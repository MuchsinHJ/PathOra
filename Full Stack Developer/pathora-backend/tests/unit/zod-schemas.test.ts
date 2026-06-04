
import {
  RegisterSchema,
  LoginSchema,
} from "../../src/services/auth/validators/auth.schema.js";
import { UpdateProfileSchema } from "../../src/services/users/validators/users.schema.js";
import {
  UploadCvTextSchema,
  CvIdParamSchema,
} from "../../src/services/cvs/validators/cvs.schema.js";
import { AnalysisIdParamSchema } from "../../src/services/analyses/validators/analyses.schema.js";
import { AiResponseSchema } from "../../src/services/ai-gateway/ai-response.schema.js";

describe("RegisterSchema (VAL-001)", () => {
  it("menerima input valid", () => {
    const result = RegisterSchema.safeParse({
      full_name: "Rani Pratiwi",
      email: "rani@example.com",
      password: "secret123",
    });
    expect(result.success).toBe(true);
  });
  it("menolak email tidak valid", () => {
    const result = RegisterSchema.safeParse({
      full_name: "Rani",
      email: "bukan-email",
      password: "secret123",
    });
    expect(result.success).toBe(false);
  });
  it("menolak password kurang dari 8 karakter", () => {
    const result = RegisterSchema.safeParse({
      full_name: "Rani",
      email: "rani@example.com",
      password: "short",
    });
    expect(result.success).toBe(false);
  });
  it("menolak full_name kurang dari 2 karakter", () => {
    const result = RegisterSchema.safeParse({
      full_name: "R",
      email: "rani@example.com",
      password: "secret123",
    });
    expect(result.success).toBe(false);
  });
});

describe("LoginSchema (VAL-002)", () => {
  it("menerima input valid", () => {
    const result = LoginSchema.safeParse({
      email: "rani@example.com",
      password: "secret",
    });
    expect(result.success).toBe(true);
  });
  it("menolak password kosong", () => {
    const result = LoginSchema.safeParse({
      email: "rani@example.com",
      password: "",
    });
    expect(result.success).toBe(false);
  });
});

describe("UpdateProfileSchema (VAL-005)", () => {
  it("menerima update full_name saja", () => {
    const result = UpdateProfileSchema.safeParse({ full_name: "Rani Baru" });
    expect(result.success).toBe(true);
  });
  it("menerima update email saja", () => {
    const result = UpdateProfileSchema.safeParse({ email: "baru@example.com" });
    expect(result.success).toBe(true);
  });
  it("menolak bila tidak ada field yang diisi", () => {
    const result = UpdateProfileSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe("UploadCvTextSchema (VAL-003)", () => {
  it("menerima teks minimal 100 karakter", () => {
    const result = UploadCvTextSchema.safeParse({
      source_type: "text",
      raw_text: "A".repeat(100),
    });
    expect(result.success).toBe(true);
  });
  it("menolak teks kurang dari 100 karakter", () => {
    const result = UploadCvTextSchema.safeParse({
      source_type: "text",
      raw_text: "terlalu pendek",
    });
    expect(result.success).toBe(false);
  });
});

describe("CvIdParamSchema (VAL-006)", () => {
  it("menerima UUID valid", () => {
    const result = CvIdParamSchema.safeParse({
      cvId: "8f1c1c2e-1b2a-4c3d-9e4f-5a6b7c8d9e0f",
    });
    expect(result.success).toBe(true);
  });
  it("menolak string bukan UUID", () => {
    const result = CvIdParamSchema.safeParse({ cvId: "bukan-uuid" });
    expect(result.success).toBe(false);
  });
});

describe("AnalysisIdParamSchema (VAL-006)", () => {
  it("menerima UUID valid", () => {
    const result = AnalysisIdParamSchema.safeParse({
      analysisId: "8f1c1c2e-1b2a-4c3d-9e4f-5a6b7c8d9e0f",
    });
    expect(result.success).toBe(true);
  });
});

describe("AiResponseSchema (VAL-007)", () => {
  const validPayload = {
    cv_id: "uuid-abc",
    analyzed_at: "2026-05-30T08:00:00Z",
    predicted_category: "INFORMATION-TECHNOLOGY",
    confidence: 0.832,
    top_5_predictions: [
      { category: "INFORMATION-TECHNOLOGY", confidence: 0.832 },
    ],
    extracted_skills: [
      {
        category: "INFORMATION-TECHNOLOGY",
        matched_skills: [{ skill: "Python", similarity: 0.92 }],
        missing_skills: ["Project Management"],
      },
    ],
    career_recommendations: [
      { category: "INFORMATION-TECHNOLOGY", match_score: 0.832 },
    ],
    description_career_recommendations: "Based on your skills...",
  };
  it("menerima payload sesuai kontrak AI", () => {
    const result = AiResponseSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });
  it("menerima description_career_recommendations null", () => {
    const result = AiResponseSchema.safeParse({
      ...validPayload,
      description_career_recommendations: null,
    });
    expect(result.success).toBe(true);
  });
  it("menolak payload tanpa cv_id", () => {
    const { cv_id: _omit, ...withoutCvId } = validPayload;
    const result = AiResponseSchema.safeParse(withoutCvId);
    expect(result.success).toBe(false);
  });
  it("menolak confidence di luar rentang 0-1", () => {
    const result = AiResponseSchema.safeParse({
      ...validPayload,
      confidence: 1.5,
    });
    expect(result.success).toBe(false);
  });
});
