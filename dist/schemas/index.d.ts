import { z } from 'zod';
export declare const userSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
    verificationCode: z.ZodOptional<z.ZodString>;
    codeExpiresAt: z.ZodOptional<z.ZodString>;
    emailVerified: z.ZodOptional<z.ZodBoolean>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, z.core.$strip>;
export type UserSchemaT = z.infer<typeof userSchema>;
export declare const createUserSchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
}, z.core.$strip>;
export type CreateUserSchemaT = z.infer<typeof createUserSchema>;
export declare const updateUserSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    password: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type UpdateUserSchemaT = z.infer<typeof updateUserSchema>;
export declare const userParamsSchema: z.ZodObject<{
    id: z.ZodString;
}, z.core.$strip>;
export type UserParamsSchemaT = z.infer<typeof userParamsSchema>;
export declare const mealSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    description: z.ZodNullable<z.ZodString>;
    date: z.ZodString;
    isOnDiet: z.ZodBoolean;
    userId: z.ZodString;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, z.core.$strip>;
export type MealSchemaT = z.infer<typeof mealSchema>;
export declare const createMealSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    date: z.ZodString;
    isOnDiet: z.ZodBoolean;
}, z.core.$strip>;
export type CreateMealSchemaT = z.infer<typeof createMealSchema>;
export declare const updateMealSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    date: z.ZodOptional<z.ZodString>;
    isOnDiet: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export type UpdateMealSchemaT = z.infer<typeof updateMealSchema>;
export declare const mealParamsSchema: z.ZodObject<{
    id: z.ZodString;
}, z.core.$strip>;
export type MealParamsSchemaT = z.infer<typeof mealParamsSchema>;
//# sourceMappingURL=index.d.ts.map