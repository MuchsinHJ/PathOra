
import { z } from "zod";

export const RegisterSchema = z.object({
  full_name: z.string().min(2).max(100),
  email: z.email(),
  password: z.string().min(8).max(72),
});
export const LoginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

export type RegisterDto = z.infer<typeof RegisterSchema>;
export type LoginDto = z.infer<typeof LoginSchema>;
