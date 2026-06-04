
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

afterEach(async () => {
  await pool.query("TRUNCATE users, cvs, analyses RESTART IDENTITY CASCADE");
});

describe("POST /api/v1/cvs — upload teks", () => {
  it("201 — upload teks valid (≥100 karakter)", async () => {
    const token = await registerAndLogin();
    const res = await request(app)
      .post("/api/v1/cvs")
      .set("Authorization", `Bearer ${token}`)
      .send({ source_type: "text", raw_text: "A".repeat(100) });
    expect(res.status).toBe(201);
    expect(res.body.data.id).toBeDefined();
    expect(res.body.data.source_type).toBe("text");
  });
  it("422 — teks kurang dari 100 karakter (VAL-003)", async () => {
    const token = await registerAndLogin();
    const res = await request(app)
      .post("/api/v1/cvs")
      .set("Authorization", `Bearer ${token}`)
      .send({ source_type: "text", raw_text: "terlalu pendek" });
    expect(res.status).toBe(422);
  });
  it("401 — tanpa token", async () => {
    const res = await request(app)
      .post("/api/v1/cvs")
      .send({ source_type: "text", raw_text: "A".repeat(100) });
    expect(res.status).toBe(401);
  });
});

describe("DELETE /api/v1/cvs/:cvId", () => {
  it("200 — hapus CV milik sendiri", async () => {
    const token = await registerAndLogin();
    const uploadRes = await request(app)
      .post("/api/v1/cvs")
      .set("Authorization", `Bearer ${token}`)
      .send({ source_type: "text", raw_text: "A".repeat(100) });
    expect(uploadRes.status).toBe(201);
    const cvId = uploadRes.body.data.id as string;
    const deleteRes = await request(app)
      .delete(`/api/v1/cvs/${cvId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(deleteRes.status).toBe(200);
  });
  it("403 — hapus CV milik user lain (SEC-003)", async () => {
    const token1 = await registerAndLogin("user1@example.com");
    const uploadRes = await request(app)
      .post("/api/v1/cvs")
      .set("Authorization", `Bearer ${token1}`)
      .send({ source_type: "text", raw_text: "A".repeat(100) });
    expect(uploadRes.status).toBe(201);
    const cvId = uploadRes.body.data.id as string;
    const token2 = await registerAndLogin("user2@example.com");
    const deleteRes = await request(app)
      .delete(`/api/v1/cvs/${cvId}`)
      .set("Authorization", `Bearer ${token2}`);
    expect(deleteRes.status).toBe(403);
  });
  it("422 — cvId bukan UUID valid", async () => {
    const token = await registerAndLogin();
    const res = await request(app)
      .delete("/api/v1/cvs/bukan-uuid")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(422);
  });
});
