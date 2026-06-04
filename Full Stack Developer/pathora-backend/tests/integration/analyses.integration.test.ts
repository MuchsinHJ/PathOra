
import request from "supertest";
import { createApp } from "../../src/app.js";
import { pool } from "../../src/config/database.js";
const app = createApp();

async function registerAndLogin(email = "test@example.com"): Promise<string> {
  await request(app).post("/api/v1/auth/register").send({
    full_name: "Test User",
    email,
    password: "secret123",
  });
  const res = await request(app)
    .post("/api/v1/auth/login")
    .send({ email, password: "secret123" });
  if (!res.body.data?.token) {
    throw new Error(
      `registerAndLogin gagal untuk ${email}: ${JSON.stringify(res.body)}`,
    );
  }
  return res.body.data.token as string;
}
async function uploadCv(token: string): Promise<string> {
  const res = await request(app)
    .post("/api/v1/cvs")
    .set("Authorization", `Bearer ${token}`)
    .send({ source_type: "text", raw_text: "A".repeat(100) });
  if (!res.body.data?.id) {
    throw new Error(`uploadCv gagal: ${JSON.stringify(res.body)}`);
  }
  return res.body.data.id as string;
}

afterEach(async () => {
  await pool.query("TRUNCATE users, cvs, analyses RESTART IDENTITY CASCADE");
});

describe("POST /api/v1/cvs/:cvId/analyze", () => {
  it("200 — trigger sukses, status analysis menjadi success (FR-013)", async () => {
    const token = await registerAndLogin();
    const cvId = await uploadCv(token);
    const res = await request(app)
      .post(`/api/v1/cvs/${cvId}/analyze`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.analysisId).toBeDefined();
    expect(res.body.data.predicted_category).toBeDefined();
    expect(res.body.data.confidence).toBeGreaterThan(0);
  });
  it("403 — trigger analisis CV milik user lain (SEC-003)", async () => {
    const token1 = await registerAndLogin("user1@example.com");
    const cvId = await uploadCv(token1);
    const token2 = await registerAndLogin("user2@example.com");
    const res = await request(app)
      .post(`/api/v1/cvs/${cvId}/analyze`)
      .set("Authorization", `Bearer ${token2}`);
    expect(res.status).toBe(403);
  });
  it("404 — CV tidak ditemukan", async () => {
    const token = await registerAndLogin();
    const res = await request(app)
      .post("/api/v1/cvs/8f1c1c2e-1b2a-4c3d-9e4f-5a6b7c8d9e0f/analyze")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(404);
  });
});

describe("GET /api/v1/analyses/:analysisId", () => {
  it("200 — detail analisis dengan filtering tampilan (FR-016, FR-020)", async () => {
    const token = await registerAndLogin();
    const cvId = await uploadCv(token);
    const triggerRes = await request(app)
      .post(`/api/v1/cvs/${cvId}/analyze`)
      .set("Authorization", `Bearer ${token}`);
    expect(triggerRes.status).toBe(200);
    const analysisId = triggerRes.body.data.analysisId as string;
    const res = await request(app)
      .get(`/api/v1/analyses/${analysisId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    const analysisData = res.body.data;
    expect(analysisData.id).toBeDefined();
    expect(analysisData.status).toBe("success");
    const predictions = analysisData.result.top_5_predictions as Array<{
      confidence: number;
    }>;
    predictions.forEach((p) => {
      expect(p.confidence).toBeGreaterThan(0.05);
    });
    const recs = analysisData.result.career_recommendations as Array<{
      match_score: number;
    }>;
    recs.forEach((r) => {
      expect(r.match_score).toBeGreaterThan(0.3);
    });
  });
  it("403 — akses analisis milik user lain (SEC-003)", async () => {
    const token1 = await registerAndLogin("user1@example.com");
    const cvId = await uploadCv(token1);
    const triggerRes = await request(app)
      .post(`/api/v1/cvs/${cvId}/analyze`)
      .set("Authorization", `Bearer ${token1}`);
    expect(triggerRes.status).toBe(200);
    const analysisId = triggerRes.body.data.analysisId as string;
    const token2 = await registerAndLogin("user2@example.com");
    const res = await request(app)
      .get(`/api/v1/analyses/${analysisId}`)
      .set("Authorization", `Bearer ${token2}`);
    expect(res.status).toBe(403);
  });
});
