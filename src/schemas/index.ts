import {z} from 'zod'


// User
export const userSchema = z.object({
  id: z.number().int(),
  name: z.string,
  email: z.string().email(),
  createdAt: z.string().datetime(),
})

export type UserSchemaT = z.infer<typeof userSchema>

export const createUserSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
})

export type CreateUserSchemaT = z.infer<typeof createUserSchema>

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export type LoginSchemaT = z.infer<typeof loginSchema>
