
import { z } from "zod";

export const UpdateProfileSchema = z
  .object({
    full_name: z.string().min(2).max(100).optional(),
    email: z.email().optional(),
  })
  .refine((d) => d.full_name !== undefined || d.email !== undefined, {
    message: "Minimal satu field harus diisi",
  });

export type UpdateProfileDto = z.infer<typeof UpdateProfileSchema>;
