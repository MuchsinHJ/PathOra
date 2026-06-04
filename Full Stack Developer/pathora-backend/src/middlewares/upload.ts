
import multer, { type FileFilterCallback } from "multer";
import type { Request } from "express";
import { config } from "../config/index.js";
import { ClientError } from "../exceptions/client-error.js";

const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);
const ALLOWED_MIME_LABEL = "PDF atau DOCX";

function fileFilter(
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback,
): void {
  if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new ClientError(
        `Tipe berkas tidak didukung. Hanya ${ALLOWED_MIME_LABEL} yang diizinkan`,
      ),
    );
  }
}

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: {
    fileSize: config.MAX_FILE_SIZE_BYTES,
    files: 1,
  },
});

export const uploadCvFile = upload.single("file");
