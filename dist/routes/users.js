import { PrismaClient } from "@prisma/client";
import { createUserSchema, userSchema } from "../schemas";
import { z } from "zod";
import { validateApiKey } from "../hooks/auth";
import bcrypt from "bcryptjs";
import { generateVerificationCode } from "../utils/generateCode";
import { sendVerificationEmail } from "../utils/sendEmail";
const prisma = new PrismaClient();
export async function userRoutes(app) {
    const zapp = app.withTypeProvider();
    // GET /users - List all users
    zapp.get("/users", {
        preHandler: [validateApiKey],
        schema: {
            description: "List all users",
            tags: ["users"],
            response: {
                200: z.object({
                    users: z.array(userSchema),
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
    }, async (req, res) => {
        try {
            const users = await prisma.user.findMany({
                orderBy: { createdAt: "desc" },
            });
            const usersWithStringData = users.map((user) => ({
                ...user,
                createdAt: user.createdAt.toISOString(),
                updatedAt: user.updatedAt.toISOString(),
            }));
            return { users: usersWithStringData };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            res.code(500).send({
                error: "Internal Server Error",
                message: errorMessage,
            });
        }
    });
    // Post /user - Create a new user
    zapp.post("/users", {
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
    }, async (req, res) => {
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
                message: "User created successfully. Please check your email to verify your account.",
                email,
            });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
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
    });
    // POST /users/verify - Verify user email
    zapp.post("/users/verify", {
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
    }, async (req, res) => {
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
                ...updateUser,
                createdAt: updateUser.createdAt.toISOString(),
                updatedAt: updateUser.updatedAt.toISOString(),
            };
            const { password, ...userWithoutPassword } = userWithStringData;
            return res.code(200).send({
                user: userWithoutPassword,
                sessionId: sessionId,
            });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            res.code(500).send({
                error: "Internal Server Error",
                message: errorMessage,
            });
        }
    });
}
//# sourceMappingURL=users.js.map