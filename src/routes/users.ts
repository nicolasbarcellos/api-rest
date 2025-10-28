import { PrismaClient } from "@prisma/client";
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { createUserSchema, userSchema } from "../schemas";
import { z } from "zod";
import { validateApiKey } from "../hooks/auth";
import bcrypt from "bcryptjs";
import { generateVerificationCode } from "../utils/generateCode";
import { sendVerificationEmail } from "../utils/sendEmail";

const prisma = new PrismaClient();

export async function userRoutes(app: FastifyInstance) {
  const zapp = app.withTypeProvider<ZodTypeProvider>();

  // GET /users - List all users
  zapp.get(
    "/users",
    {
      preHandler: [validateApiKey],
      schema: {
        description: "List all users",
        tags: ["users"],
        response: {
          200: z.object({
            users: z.array(userSchema.omit({ password: true })),
          }),
          401: z.object({
            error: z.string(),
            message: z.string(),
          }),
          500: z.object({
            error: z.string(),
            message: z.string(),
          }),
        },
      },
    },
    async (req, res) => {
      try {
        const users = await prisma.user.findMany({
          orderBy: { createdAt: "desc" },
        });

        const usersWithStringData = users.map((user) => {
          const { password, ...userWithoutPassword } = user;
          return {
            ...userWithoutPassword,
            createdAt: user.createdAt.toISOString(),
            updatedAt: user.updatedAt.toISOString(),
            verificationCode: user.verificationCode ?? undefined,
            codeExpiresAt: user.codeExpiresAt?.toISOString() ?? undefined,
            emailVerified: user.emailVerified,
          };
        });

        return { users: usersWithStringData };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        res.code(500).send({
          error: "Internal Server Error",
          message: errorMessage,
        });
      }
    }
  );

  // Post /user - Create a new user
  zapp.post(
    "/users",
    {
      schema: {
        description: "Create a new user",
        tags: ["users"],
        body: createUserSchema,
        response: {
          201: z.object({
            message: z.string(),
            email: z.string().email(),
          }),
          400: z.object({
            error: z.string(),
            message: z.string(),
          }),
          409: z.object({
            // Email já existe
            error: z.string(),
            message: z.string(),
          }),
          500: z.object({
            error: z.string(),
            message: z.string(),
          }),
        },
      },
    },
    async (req, res) => {
      const { name, email, password } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);

      try {
        const verificationCode = generateVerificationCode();
        const codeExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

        const createUser = await prisma.user.create({
          data: {
            name,
            email,
            password: hashedPassword,
            verificationCode,
            codeExpiresAt,
            emailVerified: false,
          },
        });

        await sendVerificationEmail({
          to: email,
          name,
          code: verificationCode,
        });

        return res.code(201).send({
          message:
            "User created successfully. Please check your email to verify your account.",
          email,
        });
      } catch (error: any) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";

        if (error.code === "P2002") {
          // Email already exists
          return res.code(409).send({
            error: "Conflict",
            message: "Email already exists",
          });
        }

        res.code(500).send({
          error: "Internal Server Error",
          message: errorMessage,
        });
      }
    }
  );

  // POST /users/verify - Verify user email
  zapp.post(
    "/users/verify",
    {
      schema: {
        description: "Verify email with code",
        tags: ["Auth"],
        body: z.object({
          email: z.string().email(),
          code: z.string().length(6),
        }),
        response: {
          200: z.object({
            user: userSchema.omit({ password: true }),
            sessionId: z.string(),
          }),
          400: z.object({
            error: z.string(),
            message: z.string(),
          }),
          401: z.object({
            error: z.string(),
            message: z.string(),
          }),
          500: z.object({
            error: z.string(),
            message: z.string(),
          }),
        },
      },
    },
    async (req, res) => {
      const { email, code } = req.body;

      try {
        const user = await prisma.user.findUnique({
          where: {
            email,
          },
        });

        if (!user) {
          return res.code(401).send({
            error: "Unauthorized",
            message: "User not found",
          });
        }

        if (user.emailVerified) {
          return res.code(401).send({
            error: "Unauthorized",
            message: "Email already verified",
          });
        }

        if (user.verificationCode !== code) {
          return res.code(401).send({
            error: "Unauthorized",
            message: "Invalid code",
          });
        }

        if (!user.codeExpiresAt || new Date() > user.codeExpiresAt) {
          return res.code(401).send({
            error: "Unauthorized",
            message: "Code expired",
          });
        }

        const updateUser = await prisma.user.update({
          where: { email: user.email },
          data: {
            emailVerified: true,
            verificationCode: null,
            codeExpiresAt: null,
          },
        });

        const sessionId = updateUser.id;

        res.setCookie("sessionId", sessionId, {
          path: "/",
          httpOnly: true,
          secure: false,
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 7, // 7 dias
        });

        const userWithStringData = {
          id: updateUser.id,
          name: updateUser.name,
          email: updateUser.email,
          password: updateUser.password,
          emailVerified: updateUser.emailVerified,
          createdAt: updateUser.createdAt.toISOString(),
          updatedAt: updateUser.updatedAt.toISOString(),
          verificationCode: updateUser.verificationCode ?? undefined,
          codeExpiresAt: updateUser.codeExpiresAt?.toISOString() ?? undefined,
        };

        const { password, ...userWithoutPassword } = userWithStringData;

        return res.code(200).send({
          user: userWithoutPassword,
          sessionId: sessionId,
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        res.code(500).send({
          error: "Internal Server Error",
          message: errorMessage,
        });
      }
    }
  );
  // POST /users/resend-code - Resend verification code
  zapp.post(
    "/users/resend-code",
    {
      schema: {
        description: "Resend verification code",
        tags: ["Auth"],
        body: z.object({
          email: z.string().email(),
        }),
        response: {
          200: z.object({
            message: z.string(),
          }),
          400: z.object({
            error: z.string(),
            message: z.string(),
          }),
          401: z.object({
            error: z.string(),
            message: z.string(),
          }),
          500: z.object({
            error: z.string(),
            message: z.string(),
          }),
        },
      },
    },
    async (req, res) => {
      const { email } = req.body;

      try {
        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) {
          return res.code(400).send({
            error: "User not found",
            message: "User not found, please try again!",
          });
        }

        if (user.emailVerified) {
          return res.code(400).send({
            error: "Email already verified",
            message: "Email was already verified",
          });
        }

        const verificationCode = generateVerificationCode();
        const codeExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 min

        await prisma.user.update({
          where: { email },
          data: {
            verificationCode,
            codeExpiresAt,
          },
        });

        await sendVerificationEmail({
          name: user.name,
          to: email,
          code: verificationCode,
        });

        return res.code(200).send({
          message: "Codigo successfully sent!",
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        return res.code(500).send({
          error: "Internal Server Error",
          message: errorMessage,
        });
      }
    }
  );

  // Login a user
  zapp.post(
    "/users/session",
    {
      schema: {
        description: "Log User",
        tags: ["users"],
        body: z.object({
          email: z.string().email(),
          password: z.string().min(6),
        }),
        response: {
          200: z.object({
            user: userSchema.omit({ password: true }),
            sessionId: z.string(),
          }),
          400: z.object({
            error: z.string(),
            message: z.string(),
          }),
          401: z.object({
            error: z.string(),
            message: z.string(),
          }),
          500: z.object({
            error: z.string(),
            message: z.string(),
          }),
        },
      },
    },
    async (req, res) => {
      const { email, password } = req.body;

      try {
        const user = await prisma.user.findUnique({
          where: {
            email,
          },
        });

        console.log("User encontrado?", user);

        if (!user) {
          return res.code(401).send({
            error: "Invalid credentials",
            message: "Please enter a valid email or password",
          });
        }

        if (!user.emailVerified) {
          return res.code(401).send({
            error: "Invalid credentials",
            message: "Please enter a valid email or password",
          });
        }

        const passwordIsEqual = await bcrypt.compare(password, user.password);

        if (!passwordIsEqual) {
          return res.code(401).send({
            error: "Invalid credentials",
            message: "Please enter a valid email or password",
          });
        }

        const sessionId = user.id;

        res.setCookie("sessionId", sessionId, {
          path: "/",
          httpOnly: true,
          secure: false,
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 7, // 7 dias
        });

        const userWithStringData = {
          id: user.id,
          name: user.name,
          email: user.email,
          emailVerified: user.emailVerified,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString(),
          verificationCode: user.verificationCode ?? undefined,
          codeExpiresAt: user.codeExpiresAt?.toISOString() ?? undefined,
        };

        res.code(200).send({
          user: userWithStringData,
          sessionId,
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unkown error";

        res.code(500).send({
          error: "Internal Server Error",
          message: errorMessage,
        });
      }
    }
  );
}
