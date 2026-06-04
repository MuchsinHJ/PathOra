

import { z } from "zod";

/**
 * Regex patterns untuk validasi
 */
export const VALIDATION_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD_MIN_LENGTH: 8,
  NAME_MIN_LENGTH: 3,
  NAME_MAX_LENGTH: 100,
};

/**
 * Schema untuk Login
 * Sesuai SRS VAL-001 & FR-001
 */
export const loginSchema = z.object({
  email: z
    .string("Email harus diisi")
    .min(1, "Email harus diisi")
    .email("Format email tidak valid"),
  password: z
    .string("Password harus diisi")
    .min(1, "Password harus diisi")
    .min(6, "Password minimal 6 karakter"),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type LoginFormInput = LoginFormData; // Backward compatibility

/**
 * Schema untuk Register
 * Sesuai SRS VAL-002 & FR-001
 */
export const registerSchema = z
  .object({
    name: z
      .string("Nama harus diisi")
      .min(3, "Nama minimal 3 karakter")
      .max(100, "Nama maksimal 100 karakter"),
    email: z
      .string("Email harus diisi")
      .min(1, "Email harus diisi")
      .email("Format email tidak valid"),
    password: z
      .string("Password harus diisi")
      .min(6, "Password minimal 6 karakter"),
    password_confirm: z
      .string("Konfirmasi password harus diisi"),
  })
  .refine((data) => data.password === data.password_confirm, {
    message: "Password tidak cocok",
    path: ["password_confirm"],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;
export type RegisterFormInput = RegisterFormData; // Backward compatibility

/**
 * Schema untuk Update Profile
 * Sesuai SRS VAL-003 & FR-007
 */
// export const updateProfileSchema = z.object({
//   name: z
//     .string()
//     .min(3, "Nama minimal 3 karakter")
//     .max(100, "Nama maksimal 100 karakter")
//     .optional(),
//   email: z
//     .string()
//     .email("Format email tidak valid")
//     .optional(),
// });

// export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;

/**
 * Schema untuk CV Upload
 * Sesuai SRS VAL-004 & FR-003
 */
export const cvUploadSchema = z
  .object({
    source_type: z.enum(["text", "file"]),
    raw_text: z
      .string()
      .min(50, "Teks CV minimal 50 karakter")
      .optional(),
    file: z.instanceof(File).optional(),
  })
  .refine(
    (data) => {
      // Jika text, raw_text harus ada
      if (data.source_type === "text" && !data.raw_text) {
        return false;
      }
      // Jika file, file harus ada
      if (data.source_type === "file" && !data.file) {
        return false;
      }
      return true;
    },
    {
      message: "CV harus diisi (teks atau file)",
      path: ["source_type"],
    }
  )
  .refine(
    (data) => {
      // Validasi file size jika file ada
      if (data.file && data.file.size > 10 * 1024 * 1024) {
        return false;
      }
      return true;
    },
    {
      message: "File maksimal 10MB",
      path: ["file"],
    }
  )
  .refine(
    (data) => {
      // Validasi file type jika file ada
      const allowedTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
      if (data.file && !allowedTypes.includes(data.file.type)) {
        return false;
      }
      return true;
    },
    {
      message: "File harus PDF atau DOCX",
      path: ["file"],
    }
  );

export type CVUploadFormData = z.infer<typeof cvUploadSchema>;

/**
 * Validate dan parse form data dengan Zod
 */
export async function validateFormData<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): Promise<{ success: true; data: T } | { success: false; errors: Record<string, string> }> {
  try {
    const result = await schema.parseAsync(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.issues.forEach((err) => {
        const path = err.path.join(".");
        errors[path] = err.message;
      });
      return { success: false, errors };
    }
    return { success: false, errors: { _form: "Validasi gagal" } };
  }
}
