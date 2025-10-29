import { PrismaClient } from "@prisma/client";
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { authValidate } from "../middleware/auth.js";
import z from "zod";
import { metricsSchema } from "../schemas/index.js";

const prisma = new PrismaClient();

export async function metricsRoutesAuth(app: FastifyInstance) {
  const zapp = app.withTypeProvider<ZodTypeProvider>();

  zapp.get(
    "/metrics",
    {
      preHandler: authValidate,
      schema: {
        description: "Get meals metrics",
        tags: ["metrics"],
        response: {
          200: z.object({
            metrics: metricsSchema,
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
      const userId = req.user.id;

      try {
        const meals = await prisma.meal.findMany({
          where: { userId },
          orderBy: { createdAt: "asc" },
          select: { id: true, userId: true, isOnDiet: true, createdAt: true },
        });

        const mealsQuantity = meals.length;

        const mealsOnDiet = meals.filter((meal) => meal.isOnDiet === true);
        const mealsOnDietQuantity = mealsOnDiet.length;

        const mealsOffDiet = meals.filter((meal) => meal.isOnDiet === false);
        const mealsOffDietQuantity = mealsOffDiet.length;

        const { bestStreak } = meals.reduce(
          (acc, meal) => {
            if (meal.isOnDiet) {
              acc.currentStreak++;
              acc.bestStreak = Math.max(acc.bestStreak, acc.currentStreak);
            } else {
              acc.currentStreak = 0;
            }

            return acc;
          },
          { bestStreak: 0, currentStreak: 0 }
        );

        return res.code(200).send({
          metrics: {
            totalMeals: mealsQuantity,
            mealsOnDiet: mealsOnDietQuantity,
            mealsOffDiet: mealsOffDietQuantity,
            bestStreak,
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
}
