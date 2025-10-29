import { PrismaClient } from "@prisma/client";
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { mealSchema, createMealSchema, updateMealSchema } from "../schemas/index.js";
import z from "zod";
import { authValidate } from "../middleware/auth.js";

const prisma = new PrismaClient();

export async function mealsRoutesAuth(app: FastifyInstance) {
  const zapp = app.withTypeProvider<ZodTypeProvider>();

  zapp.get(
    "/meals",
    {
      preHandler: authValidate,
      schema: {
        description: "List meals",
        tags: ["meals"],
        response: {
          200: z.object({
            meals: z.array(mealSchema),
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
      const userId = req.user.id;

      try {
        const userMeals = await prisma.meal.findMany({
          where: {
            userId: userId,
          },
          orderBy: { createdAt: "desc" },
        });

        const mealsWithString = userMeals.map((meal) => ({
          ...meal,
          date: meal.date.toISOString(),
          createdAt: meal.createdAt.toISOString(),
          updatedAt: meal.updatedAt.toISOString(),
        }));

        return res.code(200).send({
          meals: mealsWithString,
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Erro desconhecido";
        return res.code(500).send({
          error: "Internal Server Error",
          message: errorMessage,
        });
      }
    }
  );

  zapp.post(
    "/meals",
    {
      preHandler: authValidate,
      schema: {
        description: "Create a meal",
        tags: ["meals"],
        body: createMealSchema,
        response: {
          201: z.object({
            meal: mealSchema,
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
      const { name, date, description, isOnDiet } = req.body;
      const userId = req.user.id;

      try {
        const meal = await prisma.meal.create({
          data: {
            date: new Date(date),
            isOnDiet,
            name,
            userId,
            description: description || null,
          },
        });

        return res.code(201).send({
          meal: {
            ...meal,
            date: meal.date.toISOString(),
            createdAt: meal.createdAt.toISOString(),
            updatedAt: meal.updatedAt.toISOString(),
          },
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Erro desconhecido";
        return res.code(500).send({
          error: "Internal Server Error",
          message: errorMessage,
        });
      }
    }
  );

  zapp.get(
    "/meals/:id",
    {
      preHandler: authValidate,
      schema: {
        description: "Get a meal by id",
        tags: ["meals"],
        response: {
          200: z.object({
            meal: mealSchema,
          }),
          400: z.object({
            error: z.string(),
            message: z.string(),
          }),
          401: z.object({
            error: z.string(),
            message: z.string(),
          }),
          404: z.object({
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
      const { id } = req.params as { id: string };
      const userId = req.user.id;

      if (!id) {
        return res.code(400).send({
          error: "Bad Request",
          message: "ID é obrigatório",
        });
      }

      try {
        const meal = await prisma.meal.findUnique({
          where: {
            id,
            userId,
          },
        });

        if (!meal) {
          return res.code(404).send({
            error: "Not Found",
            message: "Refeição não encontrada",
          });
        }

        return res.code(200).send({
          meal: {
            ...meal,
            date: meal.date.toISOString(),
            createdAt: meal.createdAt.toISOString(),
            updatedAt: meal.updatedAt.toISOString(),
          },
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Erro desconhecido";
        return res.code(500).send({
          error: "Internal Server Error",
          message: errorMessage,
        });
      }
    }
  );

  zapp.put(
    "/meals/:id",
    {
      preHandler: authValidate,
      schema: {
        description: "Update a meal by id",
        tags: ["meals"],
        body: updateMealSchema,
        response: {
          200: z.object({
            meal: mealSchema,
          }),
          400: z.object({
            error: z.string(),
            message: z.string(),
          }),
          401: z.object({
            error: z.string(),
            message: z.string(),
          }),
          404: z.object({
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
      const { id } = req.params as { id: string };
      const userId = req.user.id;
      const { date, ...rest } = req.body;

      if (!id) {
        return res.code(400).send({
          error: "Bad Request",
          message: "ID é obrigatório",
        });
      }

      try {
        const mealUpdated = await prisma.meal.updateMany({
          where: {
            id,
            userId,
          },
          data: {
            ...rest,
            ...(date && { date: new Date(date) }),
          } as any,
        });

        if (mealUpdated.count === 0) {
          return res.code(404).send({
            error: "Not found",
            message: "Refeição não encontrada",
          });
        }

        const meal = await prisma.meal.findUnique({
          where: {
            id,
          },
        });

        if (!meal) {
          return res.code(404).send({
            error: "Not found",
            message: "Refeição não encontrada",
          });
        }

        return res.code(200).send({
          meal: {
            ...meal,
            date: meal.date.toISOString(),
            createdAt: meal.createdAt.toISOString(),
            updatedAt: meal.updatedAt.toISOString(),
          },
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Erro desconhecido";
        return res.code(500).send({
          error: "Internal Server Error",
          message: errorMessage,
        });
      }
    }
  );

  zapp.delete(
    "/meals/:id",
    {
      preHandler: authValidate,
      schema: {
        description: "Delete a meal by id",
        tags: ["meals"],
        response: {
          204: z.object({}),
          400: z.object({
            error: z.string(),
            message: z.string(),
          }),
          401: z.object({
            error: z.string(),
            message: z.string(),
          }),
          404: z.object({
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
      const { id } = req.params as { id: string };
      const userId = req.user.id;

      if (!id) {
        return res.code(400).send({
          error: "Bad Request",
          message: "ID é obrigatório",
        });
      }

      try {
        const meal = await prisma.meal.findUnique({
          where: {
            id,
            userId,
          },
        });

        if (!meal) {
          return res.code(404).send({
            error: "Not Found",
            message: "Refeição não encontrada",
          });
        }

        await prisma.meal.delete({
          where: { id },
        });

        return res.code(204).send();
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Erro desconhecido";
        return res.code(500).send({
          error: "Internal Server Error",
          message: errorMessage,
        });
      }
    }
  );
}
