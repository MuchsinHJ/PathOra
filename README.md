# 🧭 Path'Ora — End-to-End Career Path Recommendation Platform

> **Capstone Project CC26-PSU344** | Coding Camp 2026 powered by DBS Foundation

Path'Ora adalah platform **end-to-end** yang menganalisis CV/resume, memprediksi jalur karir yang sesuai, memberikan rekomendasi skill gap, dan menyajikannya dalam dashboard interaktif. Sistem terdiri dari 3 komponen utama yang dikerjakan oleh 3 peran berbeda.

---

## 📋 Daftar Isi

- [Arsitektur Sistem](#arsitektur-sistem)
- [Domain & Pembagian Tugas](#domain--pembagian-tugas)
  - [1. AI Engineer — NLP Model & API](#1-ai-engineer--nlp-model--api)
  - [2. Full Stack Developer — Backend & Frontend](#2-full-stack-developer--backend--frontend)
  - [3. Data Scientist — EDA & Dashboard](#3-data-scientist--eda--dashboard)
- [Cara Replikasi](#cara-replikasi)
- [Tech Stack](#tech-stack)
- [Tim Pengembang](#tim-pengembang)

---

## 🏗️ Arsitektur Sistem

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER (Browser)                           │
└──────────┬────────────────────────────────────┬─────────────────┘
           │                                    │
           ▼                                    ▼
┌──────────────────────┐         ┌──────────────────────────────┐
│   Frontend (React)   │  HTTP   │   Backend (Node.js/Express)  │
│   Vite + TypeScript  │◄───────►│   PostgreSQL + REST API      │
│   Tailwind CSS       │         │   Clean Architecture         │
└──────────────────────┘         └──────────┬───────────────────┘
                                            │ HTTP
                                            ▼
                               ┌──────────────────────────────┐
                               │   AI Service (FastAPI)        │
                               │   Python + TF + IndoBERT      │
                               │   Port 8000                   │
                               └──────────────────────────────┘
```

**Alur Data:**
1. User upload CV via Frontend (React)
2. Frontend → Backend (Express) → simpan ke PostgreSQL
3. Backend → AI Service (FastAPI) → analisis NLP
4. AI Service return: prediksi karir, skill gap, rekomendasi LLM
5. Backend simpan hasil → tampilkan di Dashboard Frontend

---

## 👥 Domain & Pembagian Tugas

### 1. AI Engineer — NLP Model & API

**👤 Fauzan Ahsanudin Alfikri — CACC012D6Y2364**

**Lokasi folder:** `AI Enginerr/`

**Tugas:**
- Membangun model NLP untuk klasifikasi 24 kategori karir dari CV/resume
- Mengekstrak skill dari teks resume (484 skills, 24 kategori)
- Menyediakan REST API untuk prediksi + skill extraction
- Integrasi dengan LLM (Gemini) untuk rekomendasi karir tekstual

**Pipeline Modeling:**

```
📂 Dataset (Pathora_cleanData.csv)
    │  2.484 resume, 24 kategori
    ▼
📓 prepare-data.ipynb
    ├── EDA & statistik dataset
    ├── Sentence Embeddings (384-d) → cosine similarity untuk skill extraction
    ├── Skill Taxonomy (484 skills × 24 kategori)
    └── Label Encoder (24 kategori → numeric)
    ▼
📓 tf-nlp-pathora.ipynb  [NOTEBOOK UTAMA]
    ├── IndoBERT embeddings (768-d, PyTorch)
    ├── ★ PyTorch Fine-Tune 3 epoch (boost accuracy)
    ├── TF Functional API Model:
    │     Input(768-d) → FeatureAttention → Dense(512) → BN → Dropout
    │     → Dense(256) → BN → Dropout → Dense(128) → BN → Dropout
    │     → Dense(24) → Softmax
    ├── ★ Custom Layer: FeatureAttention
    ├── ★ Custom Loss: FocalLoss (gamma=2.0, alpha=0.85)
    ├── ★ Custom Callback: PerClassTracker
    ├── Class weights untuk handle imbalance
    └── Save: .keras + SavedModel
    ▼
🐍 pathora_api.py  [FASTAPI SERVER]
    ├── POST /predict → prediksi dari teks
    ├── POST /predict/file → prediksi dari PDF
    ├── Skill extraction (cosine similarity)
    ├── RAG context → Gemini LLM recommendation
    ├── Rate limiting (30 req/min/IP)
    └── PDF max 12 halaman, teks max 20.000 karakter
```

**Response JSON:**
```json
{
  "cv_id": "uuid",
  "analyzed_at": "2026-06-02T11:45:18.400018+00:00",
  "predicted_category": "INFORMATION-TECHNOLOGY",
  "confidence": 0.832,
  "top_5_predictions": [
    {"category": "INFORMATION-TECHNOLOGY", "confidence": 0.832},
    {"category": "HEALTHCARE", "confidence": 0.075}
  ],
  "extracted_skills": [
    {
      "category": "INFORMATION-TECHNOLOGY",
      "matched_skills": [{"skill": "Python", "similarity": 0.92}],
      "missing_skills": ["Java", "JavaScript"]
    }
  ],
  "career_recommendations": [
    {"category": "INFORMATION-TECHNOLOGY", "match_score": 0.832}
  ],
  "description_career_recommendations": "Rekomendasi strategis dari LLM..."
}
```

**Ketentuan Dicoding yang Dipenuhi:**

| Requirement | Status | Detail |
|-------------|--------|--------|
| TF Functional API | ✅ | `keras.Input` + `keras.Model` multi-Dense |
| Custom Layer | ✅ | `FeatureAttention` — per-feature weighting |
| Custom Loss | ✅ | `focal_loss()` — Focal Loss |
| Custom Callback | ✅ | `PerClassTracker` — monitor per-class accuracy |
| Model .keras | ✅ | `pathora_model.keras` |
| Model SavedModel | ✅ | `pathora_savedmodel/` |
| Inference Code | ✅ | `pathora_api.py` + `inference_pathora.py` |

---

### 2. Full Stack Developer — Backend & Frontend

**Lokasi folder:** `Full Stack Developer/`

#### Backend (`pathora-backend/`)

**Stack:** Node.js + TypeScript + Express + PostgreSQL

**Arsitektur:** Clean Architecture (Use Cases → Repositories → Controllers)

**Fitur:**
- **Auth** — Register/Login dengan JWT + bcrypt
- **CV Management** — Upload file PDF / input teks
- **AI Gateway** — HTTP adapter ke AI Service (FastAPI)
- **Analysis** — Trigger analisis, lihat hasil, riwayat
- **Dashboard** — Statistik pengguna
- **Categories** — 24 kategori karir
- **Users** — Profile management
- **Rate Limiting** — Per endpoint
- **Zod Validation** — Request validation
- **Jest Testing** — Unit + integration tests

#### Frontend (`pathora-frontend/`)

**Stack:** React + Vite + TypeScript + Tailwind CSS

**Fitur:**
- Landing Page
- Auth (Login/Register)
- Dashboard — Riwayat analisis, skor, CTA upload
- Upload CV — Drag & drop PDF atau input teks
- Analisis — Prediksi karir, skill gap, rekomendasi
- Rekomendasi Karir — Filter, sort, detail per kategori
- Profile — Edit bio, foto, riwayat analisis
- Protected/Public Routes

---

### 3. Data Scientist — EDA & Dashboard

**Lokasi folder:** `Data Scientist/`

**File:**
| File | Deskripsi |
|------|-----------|
| `PathOra_DataScience_CC26PSU344.ipynb` | Notebook EDA lengkap |
| `Pathora_Dashboard.py` | Dashboard visualisasi Python |
| `Pathora_DataDictionary.pdf` | Dokumentasi data dictionary |
| `requirements.txt` | Dependencies |

---

## 🚀 Cara Replikasi (Lengkap)

### Prasyarat

| Tools | Minimal Versi |
|-------|--------------|
| Python | 3.10+ |
| Node.js | 20+ |
| PostgreSQL | 15+ |
| Docker (opsional) | 24+ |
| Git | 2.30+ |

### 1. Clone Repository

```bash
git clone <repo-url>
cd "Capstone Dicoding/PathOra"
```

### 2. AI Service (Port 8000)

```bash
cd "AI Engineer"

# Setup Python
python -m venv venv
source venv/bin/activate  # Linux/Mac
# .\venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.docker.txt

# Data preparation (generate artifacts)
# Buka prepare-data.ipynb di Jupyter, jalankan semua cell
# Atau jika artifacts sudah tersedia di extracted/, lewati

# Train model
# Buka tf-nlp-pathora.ipynb di Jupyter, jalankan semua cell
# Butuh GPU ~1-2 jam. Tanpa GPU ~3-4 jam.

# Start API server
python pathora_api.py 8000

# Verifikasi
curl http://localhost:8000/health
# Output: {"status":"ok"}
```

> **📖 Dokumentasi lengkap:** `AI Engineer/README.md`

### 3. Backend (Port 3000)

```bash
cd "Full Stack Developer/pathora-backend"

# Setup
cp .env.example .env
# Edit .env: isi DATABASE_URL, JWT_SECRET, dll.

npm install

# Database
npm run migrate:up

# Start
npm run dev

# Test
curl http://localhost:3000/health

# Unit tests
npm run test:unit

# Integration tests (butuh DB running)
npm run test:integration
```

> **📖 Dokumentasi lengkap:** `Full Stack Developer/README.md`

### 4. Frontend (Port 5173)

```bash
cd "Full Stack Developer/pathora-frontend"

cp .env.example .env
# Set VITE_API_BASE_URL=http://localhost:3000

npm install
npm run dev

# Test
npm test
```

### 5. Docker (Semua Service)

```bash
# Dari root proyek
# Build AI service image
cd "AI Engineer"
docker build -t pathora-ai .

# Jalankan dengan docker-compose (buat file compose di root)
docker-compose up -d
```

> **Catatan:** Pastikan menjalankan service dengan urutan:
> 1. PostgreSQL (docker atau native)
> 2. AI Service (python pathora_api.py 8000)
> 3. Backend (npm run dev)
> 4. Frontend (npm run dev)

---

## 🛠️ Tech Stack

| Domain | Teknologi |
|--------|-----------|
| **AI/ML** | Python, TensorFlow, PyTorch, Transformers, SentenceTransformers, scikit-learn |
| **AI API** | FastAPI, Uvicorn, PyMuPDF |
| **AI LLM** | Gemini API (RAG-enhanced prompting) |
| **Backend** | Node.js, TypeScript, Express, PostgreSQL, Knex.js, Zod, JWT |
| **Frontend** | React, Vite, TypeScript, Tailwind CSS, Zustand, React Router |
| **Infra** | Docker, GitHub Actions |

---

## 👨‍💻 Tim Pengembang

**CC26-PSU344 — Path'Ora**

| Role | Nama | Kontak |
|------|------|--------|
| **AI Engineer** | Fauzan Ahsanudin | fauzanahsanudin@gmail.com |
| **Full Stack Developer** | Muchsin Hidayat Julianto | muchsinhj10@gmail.com |
| **Full Stack Developer** | M. Faridh Awalludin Harahap | cakfarid12@gmail.com |
| **Data Scientist** | Nendi Bagus Setiawan | nendisetiawan10@gmail.com |
| **Data Scientist** | Muhammad Sofyan Arifin | muhamadsofyanarifin310@gmail.com |

---

> **Coding Camp 2026** — Powered by DBS Foundation & Dicoding Indonesia
