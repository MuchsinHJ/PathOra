# Alur Pembuatan Projek Path`Ora Backend — Dari Awal Hingga Deploy

---

## FASE 1 — Perencanaan & Dokumentasi

Sebelum satu baris kode ditulis, seluruh kebutuhan didokumentasikan:

```
docs/
├── PRD-Full-Stack-Development.md     ← "Apa yang dibangun & untuk siapa"
├── SRS-Software-Requirements-Specification.md  ← "Apa yang harus dilakukan sistem"
├── SDD-Backend-Software-Design-Document.md     ← "Bagaimana sistem dibangun"
└── contract-api-Ai.json              ← "Kontrak data antara backend & AI"
```

**Urutan pembuatan dokumen:**
1. **PRD** — mendefinisikan fitur, target pengguna, prioritas (P0/P1/P2)
2. **SRS** — menerjemahkan PRD ke kebutuhan teknis (FR, NFR, SEC, VAL)
3. **contract-api-Ai.json** — disepakati bersama tim AI Engineer
4. **SDD** — desain teknis konkret berdasarkan SRS + contract AI

---

## FASE 2 — Setup Infrastruktur Proyek

### 2.1 Inisialisasi & Konfigurasi

```
package.json          ← dependencies, scripts
tsconfig.json         ← root (references ke src & test)
tsconfig.src.json     ← untuk build production (NodeNext)
tsconfig.test.json    ← untuk Jest (CommonJS + types jest)
.gitignore            ← exclude .env, dist/, node_modules/
.env.example          ← template env vars
.env                  ← nilai aktual (tidak di-commit)
```

### 2.2 Database Schema

```
migrations/
├── ...create-users-table.js     ← tabel users
├── ...create-cvs-table.js       ← tabel cvs (file_data BYTEA, revisi v1.1)
├── ...create-analyses-table.js  ← tabel analyses (result JSONB)
├── ...create-categories-table.js ← tabel categories + seed data
└── ...add-indexs-table.js       ← index performa + GIN index
```

```bash
npm run migrate:up   # jalankan semua migrasi ke DB
```

---

## FASE 3 — Implementasi Kode (Bottom-Up)

Dibangun dari lapisan terbawah ke atas mengikuti arsitektur berlapis:

### Layer 1 — Cross-cutting (dipakai semua domain)

```
src/config/
├── index.ts      ← validasi env vars dengan Zod (fail-fast)
├── database.ts   ← pg.Pool + wrapper query()
└── logger.ts     ← Pino logger

src/exceptions/
├── base-error.ts          ← HttpException (base class)
├── authentication-error.ts ← 401
├── authorization-error.ts  ← 403
├── not-found-error.ts      ← 404
├── client-error.ts         ← 422
├── conflict-error.ts       ← 409
├── invariant-error.ts      ← 422 domain
├── ai-gateway-error.ts     ← 502/504/422
└── index.ts               ← barrel export

src/security/
├── token-manager.ts    ← JWT sign/verify
└── password-manager.ts ← bcrypt hash/compare

src/utils/
├── response.ts          ← { data, error, meta }
├── pagination.ts        ← parse limit/offset
└── ai-schema-validator.ts ← validasi respons AI

src/middlewares/
├── auth.ts        ← JWT guard
├── cors.ts        ← CORS policy
├── error.ts       ← global error handler
├── rate-limit.ts  ← globalLimiter + strictLimiter
├── upload.ts      ← Multer (MIME + size validation)
└── validate.ts    ← Zod validation factory
```

### Layer 2 — AI Gateway (inti integrasi)

```
src/services/ai-gateway/
├── ai-response.schema.ts  ← Zod schema sesuai contract-api-Ai.json
├── ai-gateway.adapter.ts  ← interface AiGatewayAdapter + CvSource type
├── ai-gateway.http.ts     ← implementasi HTTP (text=JSON, file=multipart)
├── ai-gateway.mock.ts     ← mock adapter (USE_MOCK_AI=true)
└── ai-gateway.factory.ts  ← pilih HTTP atau Mock berdasarkan env
```

### Layer 3 — Domain Services (F1–F7)

Setiap domain dibangun dengan urutan: **validator → repository → use-case → controller → route**

```
src/services/
├── auth/          ← register, login (FR-001, FR-002)
├── users/         ← get/update profile (FR-022)
├── cvs/           ← upload text/file, list, delete (FR-008..FR-012)
├── analyses/      ← trigger, get, list (FR-013..FR-023)
├── dashboard/     ← lastAnalysis + recentHistory (FR-005..FR-007)
├── categories/    ← referensi kategori + cache (FR-024)
└── health/        ← health check (FR-025)
```

### Layer 4 — Bootstrap

```
src/routes/index.ts  ← mount semua domain router ke /api/v1
src/app.ts           ← Express factory (cors→json→reqId→limiter→routes→404→error)
src/server.ts        ← entry point (config→DB→app→listen→graceful shutdown)
```

---

## FASE 4 — Pengujian

### 4.1 Unit Test (tidak butuh DB)

```bash
npm run test:unit
```

```
tests/
├── setup-env.ts              ← set env vars sebelum import modul
├── __mocks__/nanoid.ts       ← mock ESM package
└── unit/
    ├── auth.use-case.test.ts  ← register/login logic, no password_hash
    ├── ai-gateway.test.ts     ← timeout/5xx/invalid_response + mock payload
    └── zod-schemas.test.ts    ← semua schema validasi
```

**Yang diuji:** business logic murni, tanpa DB/network. Dependensi di-mock manual (DI pattern).

### 4.2 Integration Test (butuh DB test)

```bash
# Persiapan sekali:
DATABASE_URL=postgresql://...pathora_test npm run migrate:up

# Jalankan:
npm run test:integration
```

```
tests/integration/
├── auth.integration.test.ts      ← register/login/guard endpoint
├── cvs.integration.test.ts       ← upload/delete CV + ownership
└── analyses.integration.test.ts  ← trigger/get analisis + filtering
```

**Yang diuji:** alur HTTP end-to-end dengan Supertest + DB nyata + mock AI.

### 4.3 Manual Test (Postman/Thunder Client)

```bash
npm run dev   # jalankan server development
```

Test semua endpoint secara manual:
```
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/cvs
POST /api/v1/cvs/:id/analyze
GET  /api/v1/analyses/:id
GET  /api/v1/dashboard/me
GET  /api/v1/health
```

---

## FASE 5 — Build & Verifikasi

```bash
npm run lint    # pastikan tidak ada error ESLint
npm run build   # compile TypeScript → dist/
```

Hasil build:
```
dist/
├── server.js        ← entry point production
├── app.js
├── config/
├── middlewares/
├── services/
└── ...
```

---

## FASE 6 — Deployment

### 6.1 Persiapan

1. Push kode ke GitHub (tanpa `.env`, `dist/`, `node_modules/`)
2. Buat project di Railway/Render/Fly.io
3. Connect ke repository GitHub
4. Tambah PostgreSQL plugin/addon

### 6.2 Konfigurasi Platform

Set environment variables di dashboard platform:
```
NODE_ENV=production
DATABASE_URL=<dari platform>
JWT_SECRET=<generate baru, min 32 char>
USE_MOCK_AI=false
AI_BASE_URL=https://<url-layanan-ai>
ALLOWED_ORIGINS=https://<url-frontend-vercel>
LOG_LEVEL=info
...
```

### 6.3 Build & Deploy Commands

```
Build command:   npm run build
Start command:   npm start
Pre-deploy:      npm run migrate:up
```

### 6.4 Verifikasi Post-Deploy

```bash
curl https://<url-backend>/api/v1/health
# → { "data": { "status": "ok", "db": "ok" } }
```

---

## Ringkasan Alur Keseluruhan

```
PRD → SRS → SDD → contract-api-Ai.json
         ↓
    Setup project (package.json, tsconfig, .env)
         ↓
    Migrasi DB (migrations/*.js)
         ↓
    Implementasi kode (bottom-up):
    config → exceptions → security → utils → middlewares
         ↓
    AI Gateway (schema → adapter → http → mock → factory)
         ↓
    Domain services (validator → repo → use-case → controller → route)
         ↓
    Bootstrap (routes/index → app.ts → server.ts)
         ↓
    Unit test → Integration test → Manual test
         ↓
    lint + build
         ↓
    Deploy (Railway/Render) + migrate:up + verifikasi /health
```