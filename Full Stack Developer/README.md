# 💻 Path'Ora — Full Stack Developer: Backend & Frontend

> **Muchsin Hidayat Jaelani**
> Bagian dari Capstone Project CC26-PSU344 | Coding Camp 2026 powered by DBS Foundation

---

## 📋 Overview

Full Stack Developer membangun **backend API (Node.js/Express)** dan **frontend web (React/Vite)** yang saling terintegrasi dengan **AI Service** untuk memberikan pengalaman analisis CV end-to-end kepada user.

---

## 📁 Struktur Proyek

```
Full Stack Developer/
│
├── pathora-backend/          ★ Backend API
│   ├── src/
│   │   ├── config/           ← Database, env, logger
│   │   ├── exceptions/       ← Custom error classes
│   │   ├── middlewares/      ← Auth, CORS, error, rate-limit, upload, validate
│   │   ├── routes/           ← Route aggregator
│   │   ├── security/         ← JWT + password manager
│   │   ├── server.ts         ← Entry point
│   │   ├── services/         ← ★ Domain services (Clean Architecture)
│   │   │   ├── auth/         ← Login, register
│   │   │   ├── users/        ← Profile
│   │   │   ├── cvs/          ← CV upload & management
│   │   │   ├── analyses/     ← Trigger & lihat analisis
│   │   │   ├── dashboard/    ← Statistik dashboard
│   │   │   ├── categories/   ← 24 kategori karir
│   │   │   ├── health/       ← Health check
│   │   │   └── ai-gateway/   ← ★ HTTP adapter ke AI Service
│   │   └── utils/            ← Pagination, response, schema validator
│   ├── migrations/           ← Knex migrations (5 file)
│   ├── tests/                ← Jest unit + integration tests
│   ├── scripts/              ← Migrate CLI
│   ├── package.json
│   └── tsconfig.json
│
└── pathora-frontend/         ★ Frontend Web
    ├── src/
    │   ├── components/       ← UI components
    │   │   ├── ui/           ← Button, Card, Input, Modal, Toast, dll
    │   │   ├── auth/         ← LoginForm, RegisterForm
    │   │   ├── layout/       ← AppLayout, AuthLayout, Navbar, Sidebar
    │   │   ├── dashboard/    ← SummaryCard, UploadCTABanner, HistoryList
    │   │   ├── upload/       ← FileDropzone, TextInput, MethodTabs
    │   │   ├── analysis/     ← StatusBanner, PredictionsChart, SkillGap
    │   │   ├── career/       ← CategoryCard, SkillGap, Filter
    │   │   └── profile/      ← BioForm, HistoryList
    │   ├── pages/            ← Page components
    │   │   ├── LandingPage
    │   │   ├── Auth/         ← Login, Register
    │   │   ├── Dashboard/    ← Dashboard, UploadCv, Riwayat, Skor
    │   │   ├── Upload/
    │   │   ├── Analysis/
    │   │   ├── CareerRecommendations/
    │   │   ├── Profile/
    │   │   └── NotFound
    │   ├── hooks/            ← Custom React hooks
    │   ├── services/         ← API client + service modules
    │   ├── store/            ← Zustand state management
    │   ├── types/            ← TypeScript type definitions
    │   ├── utils/            ← Format, validation, filter helpers
    │   ├── routes/           ← React Router config
    │   ├── constants/        ← API routes, environment
    │   └── styles/           ← Global CSS + Tailwind
    ├── tests/                ← Vitest unit tests
    ├── package.json
    └── vite.config.ts
```

---

## 🔧 Backend — Clean Architecture

### Arsitektur Berlapis (per Service)

```
┌─────────────────────────────────────────────────────────────┐
│  Route            ← HTTP method + path                      │
│  (e.g., POST /auth/login)                                   │
└──────────────────────────┬──────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  Controller        ← Parse request, call use case, respond   │
└──────────────────────────┬──────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  Use Case          ← Business logic (pure functions)         │
│  (e.g., LoginUseCase, UploadCvUseCase)                      │
└──────────────────────────┬──────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  Repository        ← Database access (PostgreSQL via knex)   │
└─────────────────────────────────────────────────────────────┘
```

### Service Modules

| Service | Routes | Deskripsi |
|---------|--------|-----------|
| **Auth** | `POST /auth/register`, `POST /auth/login` | Registrasi & login dengan JWT |
| **Users** | `GET /users/me`, `PATCH /users/me` | Profile user |
| **CVs** | `POST /cvs`, `GET /cvs`, `GET /cvs/:id`, `DELETE /cvs/:id` | Upload & manage CV |
| **Analyses** | `POST /analyses`, `GET /analyses`, `GET /analyses/:id` | Trigger & lihat analisis |
| **Dashboard** | `GET /dashboard` | Statistik dashboard user |
| **Categories** | `GET /categories` | 24 kategori karir |
| **Health** | `GET /health` | Health check server |

### Database Schema

**5 migrations** untuk tabel:
| Tabel | Kolom Kunci | Deskripsi |
|-------|-------------|-----------|
| `users` | id, email, password_hash, name, photo, created_at | Data user |
| `cvs` | id, user_id, title, file_data (BYTEA), raw_text, created_at | CV yang diupload |
| `analyses` | id, cv_id, user_id, result (JSONB), created_at | Hasil analisis AI |
| `categories` | id, name, description, icon | 24 seed kategori |

**Index:**
- GIN index pada `analyses.result` untuk query JSONB
- Composite index pada foreign keys

### AI Gateway Integration

Backend memanggil AI Service melalui **HttpAiGateway**:

```
Backend ──POST /predict──────► AI Service (FastAPI:8000)
        ◄── JSON Response ──┘
```

**Konfigurasi (.env):**
```env
AI_BASE_URL=http://localhost:8000
AI_TIMEOUT_MS=60000
USE_MOCK_AI=false       # Untuk development tanpa AI Service
```

**Schema validasi response** (Zod):
```typescript
const AiResponseSchema = z.object({
  cv_id: z.string(),
  analyzed_at: z.string(),
  predicted_category: z.string(),
  confidence: z.number().min(0).max(1),
  top_5_predictions: z.array(PredictionSchema).min(1).max(5),
  extracted_skills: z.array(ExtractedSkillSchema),
  career_recommendations: z.array(CareerRecommendationSchema),
  description_career_recommendations: z.string().nullable(),
});
```

### Middleware Stack

| Middleware | Fungsi |
|-----------|--------|
| `auth.ts` | Verifikasi JWT token |
| `cors.ts` | CORS policy (configurable origins) |
| `error.ts` | Global error handler → JSON response |
| `rate-limit.ts` | Per-endpoint rate limiting |
| `upload.ts` | Multer file upload config |
| `validate.ts` | Zod schema validation |

### Security

- **Password:** bcrypt (via `password-manager.ts`)
- **JWT:** Access token (`token-manager.ts`)
- **Rate Limit:** 100 req/15min (general), 10 req/15min (auth)
- **CORS:** Whitelist origins
- **Input Validation:** Zod schemas per endpoint

---

## 🎨 Frontend — React + Vite + TypeScript

### Page Structure

```
/                    → Landing Page
/login               → Login
/register            → Register
/dashboard           → Dashboard (ringkasan + riwayat)
/upload              → Upload CV (file / text)
/analysis/:id        → Hasil analisis detail
/career-recommendations → Rekomendasi karir
/profile             → Profile user
/*                   → 404 Not Found
```

### Component Architecture

```
src/components/
├── ui/               ← Design system: Button, Card, Input, Modal, Toast, Spinner, etc.
├── layout/           ← AppLayout, AuthLayout, Navbar, Sidebar, Footer
├── auth/             ← LoginForm, RegisterForm
├── dashboard/        ← AnalysisSummaryCard, UploadCTABanner, UploadHistoryList
├── upload/           ← CVFileDropzone, CVTextInput, UploadMethodTabs
├── analysis/         ← AnalysisStatusBanner, TopPredictionsChart, SkillGapSection
├── career/           ← CategoryCard, CategorySkillGap, CareerRecsFilter
└── profile/          ← ProfileBioForm, AnalysisHistoryList
```

### State Management (Zustand)

| Store | State |
|-------|-------|
| `auth.store.ts` | User data, token, login/logout |
| `ui.store.ts` | Sidebar, theme, toasts |

### API Services

| Service | Endpoints |
|---------|-----------|
| `auth.service.ts` | POST /auth/register, POST /auth/login |
| `cv.service.ts` | POST /cvs, GET /cvs, DELETE /cvs/:id |
| `analysis.service.ts` | POST /analyses, GET /analyses, GET /analyses/:id |
| `category.service.ts` | GET /categories |
| `dashboard.service.ts` | GET /dashboard |
| `user.service.ts` | GET /users/me, PATCH /users/me |

### Tech Stack

| Aspek | Teknologi |
|-------|-----------|
| Framework | React 18 + TypeScript |
| Build | Vite |
| Styling | Tailwind CSS + CSS Modules |
| State | Zustand |
| Routing | React Router v6 |
| Testing | Vitest + React Testing Library |
| Linting | ESLint |

---

## 🚀 Cara Replikasi

### Prasyarat

```bash
Node.js 20+
PostgreSQL 15+
npm 9+
```

### 1. Backend

```bash
cd "Full Stack Developer/pathora-backend"

# Copy env
cp .env.example .env
# Edit .env: isi DATABASE_URL, JWT_SECRET, dll.

# Install dependencies
npm install

# Setup database
npm run migrate:up

# Seed categories
# (manual seed atau via migration)

# Start development
npm run dev              # http://localhost:3000

# Testing
npm test                 # All tests
npm run test:unit        # Unit tests only
npm run test:integration # Integration tests only
```

### 2. Frontend

```bash
cd "Full Stack Developer/pathora-frontend"

cp .env.example .env
# Edit .env: set VITE_API_BASE_URL=http://localhost:3000

npm install
npm run dev              # http://localhost:5173

# Testing
npm test                 # Vitest
```

### 3. Integration dengan AI Service

Pastikan AI Service berjalan di `http://localhost:8000`:

```bash
# Di .env backend:
AI_BASE_URL=http://localhost:8000
USE_MOCK_AI=false
```

### 4. Docker (Seluruh Stack)

```yaml
# docker-compose.yml (root project)
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: pathora
      POSTGRES_USER: pathora
      POSTGRES_PASSWORD: pathora
    ports:
      - "5432:5432"

  ai-service:
    build: ./AI Engineer
    ports:
      - "8000:8000"

  backend:
    build: ./Full Stack Developer/pathora-backend
    ports:
      - "3000:3000"
    depends_on:
      - postgres
      - ai-service
    environment:
      DATABASE_URL: postgresql://pathora:pathora@postgres:5432/pathora
      AI_BASE_URL: http://ai-service:8000

  frontend:
    build: ./Full Stack Developer/pathora-frontend
    ports:
      - "5173:5173"
    depends_on:
      - backend
```

---

## 🧪 Testing

### Backend (Jest)

| File | Type | Deskripsi |
|------|------|-----------|
| `tests/unit/auth.use-case.test.ts` | Unit | Login & register logic |
| `tests/unit/ai-gateway.test.ts` | Unit | AI response processing |
| `tests/unit/zod-schemas.test.ts` | Unit | Schema validation |
| `tests/integration/auth.integration.test.ts` | Integration | Auth endpoints |
| `tests/integration/cvs.integration.test.ts` | Integration | CV endpoints |
| `tests/integration/analyses.integration.test.ts` | Integration | Analysis endpoints |

### Frontend (Vitest)

| File | Deskripsi |
|------|-----------|
| `DashboardPage.test.tsx` | Dashboard rendering |
| `UploadPage.test.tsx` | Upload flow |
| `AnalysisPage.test.tsx` | Analysis display |
| `CareerRecommendationsPage.test.tsx` | Career list |
| `ProfilePage.test.tsx` | Profile editing |

---

## 🔗 Alur Data Lengkap

```
User ──► Frontend ──POST──► Backend ──POST──► AI Service
                                │                       │
                                ▼                       ▼
                          PostgreSQL              Response JSON
                                │                       │
                                └─────── Save ──────────┘
                                        │
                                        ▼
                                Frontend ←── GET ──── Backend
                                   │
                                   ▼
                              User melihat
                              hasil analisis
```

1. User upload CV (file PDF atau teks) via Frontend
2. Frontend → Backend (POST /cvs) → simpan ke PostgreSQL
3. Backend → AI Service (POST /predict) → analisis NLP
4. AI Service return JSON → Backend validasi + simpan ke analyses table
5. Frontend fetch hasil (GET /analyses/:id) → tampilkan dashboard

---

## 📚 Referensi

- [Express.js Documentation](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [PostgreSQL](https://www.postgresql.org/)
- [Knex.js](http://knexjs.org/)
- [Zod](https://zod.dev/)
- [Zustand](https://github.com/pmndrs/zustand)
- [Jest](https://jestjs.io/)
- [Vitest](https://vitest.dev/)
- [Dicoding — Menjadi Full-Stack Developer](https://www.dicoding.com/)
