# 🧠 Path'Ora — AI Engineer: NLP Model & API

> **Fauzan Ahsanudin Alfikri — CACC012D6Y2364**
> Bagian dari Capstone Project CC26-PSU344 | Coding Camp 2026 powered by DBS Foundation

---

## 📋 Overview

Membangun model NLP untuk **klasifikasi karir** dari teks resume/CV ke dalam **24 kategori pekerjaan**. Model menggunakan **BERT embedding** + **TF Functional API** dengan custom components (FeatureAttention, FocalLoss, PerClassTracker).

**Akurasi target:** ≥85%

---

## 📁 Struktur File

```
AI Enginerr/
│
├── tf-nlp-pathora.ipynb         ★ NOTEBOOK UTAMA
│   ├── BERT embeddings (768-d)
│   ├── PyTorch fine-tune 3 epoch
│   ├── TF Functional API + Custom Components
│   ├── Training + Evaluation
│   └── Save .keras / SavedModel
│
├── prepare-data.ipynb           Persiapan data
│   ├── Load CSV → EDA
│   ├── Sentence Embeddings (384-d)
│   ├── Skill Taxonomy (484 skills)
│   └── Label Encoder
│
├── pathora_api.py               FastAPI server (port 8000)
│   ├── POST /predict
│   ├── POST /predict/file
│   └── GET /health, GET /
│
├── inference_pathora.py         CLI inference script
│
├── extracted/
│   ├── Resume/Pathora_cleanData.csv  ← Dataset (dari Data Scientist)
│   ├── label_encoder.joblib          ← 24 kategori → numeric
│   ├── skill_taxonomy.json           ← 484 skills × 24 kategori
│   ├── skill_matches.pkl             ← Precomputed cosine similarity
│   └── resume_embeddings.npy         ← ST embeddings 384-d
│
├── requirements.docker.txt      Python dependencies
└── README.md                    Dokumentasi ini
```

---

## 🔬 Model Architecture

```
┌────────────────────────────────────────────────────┐
│  Input Text (raw string)                          │
└────────────────────┬───────────────────────────────┘
                     ▼
┌────────────────────────────────────────────────────┐
│  Tokenizer + AutoModel (BERT, PyTorch)         │
│  → [CLS] embedding [768-d]                        │
│  ★ Fine-tuned 3 epoch (task-specific)              │
└────────────────────┬───────────────────────────────┘
                     ▼
┌────────────────────────────────────────────────────┐
│  ★ FeatureAttention (Custom Layer)                  │
│  → Per-feature attention weighting                 │
└────────────────────┬───────────────────────────────┘
                     ▼
┌────────────────────────────────────────────────────┐
│  Dense(512) → BatchNorm → Dropout(0.4) → ReLU     │
└────────────────────┬───────────────────────────────┘
                     ▼
┌────────────────────────────────────────────────────┐
│  Dense(256) → BatchNorm → Dropout(0.3) → ReLU     │
└────────────────────┬───────────────────────────────┘
                     ▼
┌────────────────────────────────────────────────────┐
│  Dense(128) → BatchNorm → Dropout(0.2) → ReLU     │
└────────────────────┬───────────────────────────────┘
                     ▼
┌────────────────────────────────────────────────────┐
│  Dense(24) → Softmax                               │
│  ★ FocalLoss (gamma=2.0, alpha=0.85)               │
└────────────────────┬───────────────────────────────┘
                     ▼
┌────────────────────────────────────────────────────┐
│  24 Career Categories                               │
│  ★ PerClassTracker (monitor per-class accuracy)     │
└────────────────────────────────────────────────────┘
```

### Custom Components (Dicoding Requirements)

| Komponen | Kode | Fungsi |
|----------|------|--------|
| **Custom Layer** | `FeatureAttention` | Mempelajari bobot penting per fitur embedding |
| **Custom Loss** | `focal_loss(gamma=2.0, alpha=0.85)` | Focal Loss — handle class imbalance |
| **Custom Callback** | `PerClassTracker` | Monitor akurasi per kelas tiap 5 epoch |

---

## 📊 Dataset

| Metadata | Value |
|----------|-------|
| **Sumber** | Kaggle Resume Dataset (cleaned by Data Scientist) |
| **Jumlah** | 2.484 resume |
| **Kategori** | 24 kelas pekerjaan |
| **Fitur** | Resume_str (teks), Category (label), + fitur engineering |
| **Split** | 80/20 stratified |
| **Preprocessing** | Lowercase, hapus HTML tags, normalize whitespace |

**24 Kategori:** ACCOUNTANT, ADVOCATE, AGRICULTURE, APPAREL, ARTS, AUTOMOBILE, AVIATION, BANKING, BPO, BUSINESS-DEVELOPMENT, CHEF, CONSTRUCTION, CONSULTANT, DESIGNER, DIGITAL-MEDIA, ENGINEERING, FINANCE, FITNESS, HEALTHCARE, HR, INFORMATION-TECHNOLOGY, PUBLIC-RELATIONS, SALES, TEACHER

---

## 🚀 Panduan Replikasi

### Prasyarat

```bash
Python 3.10+
pip install -r requirements.docker.txt
```

### Step-by-Step

#### 1. Generate Data Artifacts

Jalankan **`prepare-data.ipynb`** secara berurutan:

| Cell | Proses | Output | Waktu |
|:----:|--------|--------|:-----:|
| 1-2 | Load CSV + EDA | Statistik dataset | ~1 menit |
| 3 | Sentence Embeddings (384-d) | `resume_embeddings.npy` | ~5 menit |
| 4-5 | Skill Taxonomy + Matching | `skill_taxonomy.json`, `skill_matches.pkl` | ~3 menit |
| 6 | Label Encoder | `label_encoder.joblib` | ~1 detik |
| 7 | Final Checklist | Verifikasi file | ~1 detik |

#### 2. Training Model

Jalankan **`tf-nlp-pathora.ipynb`** secara berurutan:

| Cell | Proses | Estimasi Waktu |
|:----:|--------|:--------------:|
| 1 | Setup & Library | ~1 menit |
| 2 | Load Data + BERT embeddings | ~5 menit |
| 3 | **PyTorch Fine-Tune (3 epoch)** | **~10 menit (GPU)** / ~1 jam (CPU) |
| 4 | Train/Test Split | ~1 detik |
| 5-7 | Custom Components (FeatureAttention, FocalLoss, PerClassTracker) | Instant |
| 8 | TF Functional API Model | ~1 menit |
| 9 | **Training (max 50 epoch)** | **~15 menit (GPU)** / ~2 jam (CPU) |
| 10 | Evaluation + Classification Report | ~1 menit |
| 11 | Save .keras + SavedModel | ~1 menit |
| 12 | Inference Test | ~1 menit |
| 13 | Dicoding Compliance Check | Instant |

**Catatan:** GPU sangat disarankan untuk fine-tuning BERT. Tanpa GPU, gunakan mode CPU dan persiapkan waktu ~3 jam total.

#### 3. Start API Server

```bash
# Dari folder AI Enginerr/
python pathora_api.py 8000
```

**Test endpoint:**
```bash
# Health check
curl http://localhost:8000/health

# Prediksi teks
curl -X POST http://localhost:8000/predict \
  -d "text=Python developer with TensorFlow, Docker, AWS"

# Prediksi PDF
curl -X POST http://localhost:8000/predict/file \
  -F file=@resume.pdf

# Prediksi dengan Gemini API key untuk LLM recommendation
curl -X POST http://localhost:8000/predict \
  -d "text=Python developer with TensorFlow" \
  -d "gemini_api_key=AIzaSy..."
```

#### 4. Docker Deployment

```bash
# Build image
docker build -t pathora-ai .

# Run container
docker run -p 8000:8000 pathora-ai
```

---

## 📡 API Documentation

### Endpoints

| Method | Path | Deskripsi |
|--------|------|-----------|
| `GET` | `/` | Status server |
| `GET` | `/health` | Health check |
| `POST` | `/predict` | Prediksi dari teks |
| `POST` | `/predict/file` | Prediksi dari file PDF |

### Request Parameters

#### `POST /predict`

| Parameter | Tipe | Required | Deskripsi |
|-----------|------|----------|-----------|
| `text` | string | ✅ | Teks resume/CV (max 20.000 karakter) |
| `gemini_api_key` | string | ❌ | API key Gemini untuk rekomendasi LLM |

#### `POST /predict/file`

| Parameter | Tipe | Required | Deskripsi |
|-----------|------|----------|-----------|
| `file` | file | ✅ | File PDF (max 10MB, max 12 halaman) |
| `gemini_api_key` | string | ❌ | API key Gemini untuk rekomendasi LLM |

### Response Format

```json
{
  "cv_id": "e8c3ab6c-6b8c-4bd5-b636-d8a25233b640",
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
      "matched_skills": [
        {"skill": "Docker", "similarity": 0.44},
        {"skill": "TensorFlow", "similarity": 0.42}
      ],
      "missing_skills": ["Python", "Java", "JavaScript"]
    }
  ],
  "career_recommendations": [
    {"category": "INFORMATION-TECHNOLOGY", "match_score": 0.832}
  ],
  "description_career_recommendations": "Berdasarkan analisis CV..."
}
```

### Field Descriptions

| Field | Tipe | Deskripsi |
|-------|------|-----------|
| `cv_id` | string | UUID unik per analisis |
| `analyzed_at` | string (ISO 8601) | Timestamp analisis |
| `predicted_category` | string | Kategori prediksi utama |
| `confidence` | float (0.0–1.0) | Confidence score |
| `top_5_predictions` | array | Top prediksi (threshold > 0.05) |
| `extracted_skills` | array | Skill matched + missing per kategori |
| `career_recommendations` | array | Rekomendasi karir (threshold > 0.3) |
| `description_career_recommendations` | string \| null | Deskripsi strategis dari LLM |

---

## ⚙️ Threshold & Konfigurasi

| Parameter | Nilai | Keterangan |
|-----------|-------|------------|
| Max token per resume | 128 | BERT tokenizer |
| Batch size training | 16 | TF Dataset |
| Learning rate (classifier) | 5e-4 | Adam optimizer |
| Learning rate (fine-tune) | 2e-5 | AdamW |
| Early stopping patience | 10 | Monitor val_accuracy |
| Reduce LR patience | 3 | Factor 0.5, min 1e-7 |
| Max epochs | 50 | - |
| Class weights | `balanced` | sklearn compute_class_weight |
| Top predictions threshold | > 0.05 | Confidence filter |
| Career rec threshold | > 0.3 | Match score filter |
| Skill similarity threshold | > 0.35 | Cosine similarity |
| PDF max pages | 12 | - |
| Text max chars | 20.000 | - |
| Rate limit | 30 req/min/IP | Per client IP |

---

## 🔗 Integrasi dengan Backend

Backend (`pathora-backend/`) memanggil AI Service melalui **HttpAiGateway**:

```
Backend (Node.js) ──HTTP──► AI Service (FastAPI:8000)
                              ├── POST /predict
                              └── POST /predict/file
```

**Konfigurasi di `.env` backend:**
```env
AI_BASE_URL=http://localhost:8000
AI_API_KEY=your_gemini_api_key
AI_TIMEOUT_MS=60000
```

**Schema validasi response** (Zod, di backend):
```typescript
const AiResponseSchema = z.object({
  cv_id: z.string(),
  analyzed_at: z.string(),
  predicted_category: z.string(),
  confidence: z.number().min(0).max(1),
  top_5_predictions: z.array(PredictionSchema),
  extracted_skills: z.array(ExtractedSkillSchema),
  career_recommendations: z.array(CareerRecommendationSchema),
  description_career_recommendations: z.string().nullable(),
});
```

---

## ✅ Dicoding Requirements Compliance

| Requirement | Status | Implementasi |
|-------------|--------|-------------|
| **TF Functional API** | ✅ | `keras.Input(768-d)` → FeatureAttention → Dense layers → `keras.Model` |
| **Custom Layer** | ✅ | `FeatureAttention` — per-feature attention weighting with trainable weights |
| **Custom Loss** | ✅ | `focal_loss()` — Focal Loss dengan gamma=2.0, alpha=0.85 |
| **Custom Callback** | ✅ | `PerClassTracker` — monitor akurasi per kelas setiap 5 epoch |
| **Model .keras** | ✅ | `pathora_model.keras` — single file save |
| **Model SavedModel** | ✅ | `pathora_savedmodel/` — TF SavedModel format |
| **Inference Code** | ✅ | `inference_pathora.py` (CLI) + `pathora_api.py` (FastAPI) |
| **Dokumentasi** | ✅ | README ini + notebook markdown cells |

---

## 📈 Performance

Model telah dievaluasi menggunakan data pengujian (test set) dan berhasil mencapai performa yang sangat baik dengan tingkat akurasi di atas 90%. Berikut adalah hasil evaluasi keseluruhan:

* ✅ **Accuracy:** 90.95% (0.9095)
* 📉 **Loss:** 2.6718

## 📊 Ringkasan Evaluasi
Model menunjukkan performa yang stabil dan presisi yang tinggi dalam mengklasifikasikan berbagai kategori profesi, dengan rata-rata metrik sebagai berikut:

| Metric | Score |
| :--- | :--- |
| **Macro Avg (F1-Score)** | 0.89 |
| **Weighted Avg (F1-Score)** | 0.91 |
| **Total Data Evaluasi (Support)** | 497 |

<details>
<summary><b>Klik untuk melihat Full Classification Report</b></summary>

| Kategori (Profesi) | Precision | Recall | F1-Score | Support |
| :--- | :---: | :---: | :---: | :---: |
| ACCOUNTANT | 0.96 | 1.00 | 0.98 | 24 |
| ADVOCATE | 1.00 | 0.88 | 0.93 | 24 |
| AGRICULTURE | 0.90 | 0.69 | 0.78 | 13 |
| APPAREL | 0.75 | 0.79 | 0.77 | 19 |
| ARTS | 0.89 | 0.76 | 0.82 | 21 |
| AUTOMOBILE | 1.00 | 0.71 | 0.83 | 7 |
| AVIATION | 0.90 | 0.75 | 0.82 | 24 |
| BANKING | 0.83 | 0.87 | 0.85 | 23 |
| BPO | 0.50 | 0.75 | 0.60 | 4 |
| BUSINESS-DEVELOPMENT | 1.00 | 1.00 | 1.00 | 24 |
| CHEF | 1.00 | 0.88 | 0.93 | 24 |
| CONSTRUCTION | 1.00 | 0.95 | 0.98 | 22 |
| CONSULTANT | 1.00 | 1.00 | 1.00 | 23 |
| DESIGNER | 0.95 | 1.00 | 0.98 | 21 |
| DIGITAL-MEDIA | 0.94 | 0.84 | 0.89 | 19 |
| ENGINEERING | 0.96 | 1.00 | 0.98 | 24 |
| FINANCE | 1.00 | 0.96 | 0.98 | 24 |
| FITNESS | 0.62 | 0.91 | 0.74 | 23 |
| HEALTHCARE | 0.88 | 0.91 | 0.89 | 23 |
| HR | 1.00 | 1.00 | 1.00 | 22 |
| INFORMATION-TECHNOLOGY | 0.92 | 0.96 | 0.94 | 24 |
| PUBLIC-RELATIONS | 0.90 | 0.82 | 0.86 | 22 |
| SALES | 0.92 | 1.00 | 0.96 | 23 |
| TEACHER | 0.91 | 1.00 | 0.95 | 20 |

</details>

---

## 📝 Catatan Penting

1. **GPU sangat disarankan** untuk training. Tanpa GPU, proses fine-tune BERT bisa memakan waktu 1-2 jam.
2. **transformers 5.x** tidak mendukung `TFAutoModel`. Gunakan pendekatan hybrid: `AutoModel` (PyTorch) untuk embeddings + TF untuk classifier.
3. **TF_USE_LEGACY_KERAS=1** harus diset untuk kompatibilitas TensorFlow 2.17 dengan Keras 3.
4. **Gemini API key** opsional — tanpa key, fitur rekomendasi LLM akan mengembalikan pesan fallback.
5. **Model .keras** tidak termasuk di repository (ukuran ~1 MB untuk classifier, ~450 MB dengan BERT). Generate via notebook.

---

## 📚 Referensi

- [TensorFlow Functional API Guide](https://www.tensorflow.org/guide/keras/functional)
- [BERT — indobenchmark/indobert-base-p2](https://huggingface.co/indobenchmark/indobert-base-p2)
- [Focal Loss for Dense Object Detection](https://arxiv.org/abs/1708.02002)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [SentenceTransformers](https://www.sbert.net/)
- [Google Gemini API](https://ai.google.dev/)
- [Dicoding — Menjadi AI Engineer](https://www.dicoding.com/)
- [Link Model Deep Learning](https://drive.google.com/drive/folders/1H1U7XBuDqxFoOAKD97t7DnSHydX9L77q?usp=sharing)
