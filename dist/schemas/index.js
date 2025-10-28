import { z } from 'zod';
// User Schemas
export const userSchema = z.object({
    id: z.string().cuid(),
    name: z.string(),
    email: z.string().email(),
    password: z.string().min(6),
    verificationCode: z.string().cuid().optional(),
    codeExpiresAt: z.string().datetime().optional(),
    emailVerified: z.boolean().optional(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
});
export const createUserSchema = z.object({
    name: z.string().min(3),
    email: z.string().email(),
    password: z.string().min(6),
});
export const updateUserSchema = z.object({
    name: z.string().min(3).optional(),
    email: z.string().email().optional(),
    password: z.string().min(6).optional(),
});
export const userParamsSchema = z.object({
    id: z.string().cuid('ID deve ser um UUID válido'),
});
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
export const createMealSchema = z.object({
    name: z.string().min(1, 'Nome é obrigatório'),
    description: z.string().optional(),
    date: z.string().datetime({ message: 'Data inválida' }),
    isOnDiet: z.boolean(),
});
export const updateMealSchema = z.object({
    name: z.string().min(1).optional(),
    description: z.string().optional(),
    date: z.string().datetime().optional(),
    isOnDiet: z.boolean().optional(),
});
export const mealParamsSchema = z.object({
    id: z.string().cuid(),
});
//# sourceMappingURL=index.js.map