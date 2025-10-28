import { z } from "zod";

// User Schemas
export const userSchema = z.object({
  id: z.string().cuid(),
  name: z.string(),
  email: z.string().email(),
  password: z.string().min(6),
  verificationCode: z.string().optional(),
  codeExpiresAt: z.string().datetime().optional(),
  emailVerified: z.boolean().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type UserSchemaT = z.infer<typeof userSchema>;

export const createUserSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
});

export type CreateUserSchemaT = z.infer<typeof createUserSchema>;

export const updateUserSchema = z.object({
  name: z.string().min(3).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
});
export type UpdateUserSchemaT = z.infer<typeof updateUserSchema>;

export const userParamsSchema = z.object({
  id: z.string().cuid("ID deve ser um UUID válido"),
});

export type UserParamsSchemaT = z.infer<typeof userParamsSchema>;

// Meal Schemas
export const mealSchema = z.object({
  id: z.string().cuid(),
  name: z.string(),
  description: z.string().nullable(),
  date: z.string().datetime(),
  isOnDiet: z.boolean(),
  userId: z.string().cuid(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type MealSchemaT = z.infer<typeof mealSchema>;

export const createMealSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  date: z.string().datetime({ message: "Data inválida" }),
  isOnDiet: z.boolean(),
});

export type CreateMealSchemaT = z.infer<typeof createMealSchema>;

export const updateMealSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  date: z.string().datetime().optional(),
  isOnDiet: z.boolean().optional(),
});

export type UpdateMealSchemaT = z.infer<typeof updateMealSchema>;

export const mealParamsSchema = z.object({
  id: z.string().cuid(),
});

export type MealParamsSchemaT = z.infer<typeof mealParamsSchema>;
