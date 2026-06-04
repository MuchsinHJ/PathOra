
import request from "supertest";
import { createApp } from "../../src/app.js";
import { pool } from "../../src/config/database.js";
const app = createApp();

afterEach(async () => {
  await pool.query("TRUNCATE users, cvs, analyses RESTART IDENTITY CASCADE");
});

describe("POST /api/v1/auth/register", () => {
  const validPayload = {
    full_name: "Rani Pratiwi",
    email: "rani@example.com",
    password: "secret123",
  };
  it("201 — registrasi sukses, response tidak memuat password_hash (SEC-001)", async () => {
    const res = await request(app)
      .post("/api/v1/auth/register")
      .send(validPayload);
    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({
      email: "rani@example.com",
      full_name: "Rani Pratiwi",
    });
    expect(res.body.data).not.toHaveProperty("password");
    expect(res.body.data).not.toHaveProperty("password_hash");
    expect(res.body.error).toBeNull();
  });
  it("409 — email duplikat mengembalikan ConflictError", async () => {
    await request(app).post("/api/v1/auth/register").send(validPayload);
    const res = await request(app)
      .post("/api/v1/auth/register")
      .send(validPayload);
    expect(res.status).toBe(409);
    expect(res.body.error).toBeDefined();
  });
  it("422 — email tidak valid mengembalikan ClientError", async () => {
    const res = await request(app)
      .post("/api/v1/auth/register")
      .send({ ...validPayload, email: "bukan-email" });
    expect(res.status).toBe(422);
  });
  it("422 — password kurang dari 8 karakter", async () => {
    const res = await request(app)
      .post("/api/v1/auth/register")
      .send({ ...validPayload, password: "short" });
    expect(res.status).toBe(422);
  });
});

describe("POST /api/v1/auth/login", () => {
  beforeEach(async () => {
    await request(app).post("/api/v1/auth/register").send({
      full_name: "Rani Pratiwi",
      email: "rani@example.com",
      password: "secret123",
    });
  });
  it("200 — login sukses mengembalikan token + user tanpa password_hash", async () => {
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "rani@example.com", password: "secret123" });
    expect(res.status).toBe(200);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user).toMatchObject({ email: "rani@example.com" });
    expect(res.body.data.user).not.toHaveProperty("password_hash");
  });
  it("401 — password salah mengembalikan pesan generik (FR-002)", async () => {
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "rani@example.com", password: "wrongpassword" });
    expect(res.status).toBe(401);
    expect(res.body.error.message).toBe("Email atau password salah");
  });
  it("401 — email tidak terdaftar mengembalikan pesan generik (FR-002)", async () => {
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "notfound@example.com", password: "secret123" });
    expect(res.status).toBe(401);
    expect(res.body.error.message).toBe("Email atau password salah");
  });
});

describe("Auth Guard (FR-004)", () => {
  it("401 — akses endpoint privat tanpa token", async () => {
    const res = await request(app).get("/api/v1/users/me");
    expect(res.status).toBe(401);
  });
  it("401 — token tidak valid", async () => {
    const res = await request(app)
      .get("/api/v1/users/me")
      .set("Authorization", "Bearer invalid.token.here");
    expect(res.status).toBe(401);
  });
});
