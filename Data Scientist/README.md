# 📊 Path'Ora — Data Scientist: EDA, Cleaning & Feature Engineering

> **Nendi Bagus Setiawan | CDCC179D6Y1598**
> **Muhammad Sofyan Arifin | CDCC179D6Y0607**
> Bagian dari Capstone Project CC26-PSU344 | Coding Camp 2026 powered by DBS Foundation

---

## 📋 Overview

Data Scientist bertanggung jawab untuk **membersihkan, menganalisis, dan merekayasa fitur** dari dataset CV/Resume mentah. Hasil akhirnya adalah dataset bersih (`Pathora_cleanData.csv`) yang siap digunakan oleh AI Engineer untuk training model NLP.

---

## 📁 Struktur File

```
Data Scientist/
│
├── PathOra_DataScience_CC26PSU344.ipynb   ★ NOTEBOOK UTAMA
│   ├── 1. Setup & Import Library
│   ├── 2. Load Dataset
│   ├── 3. Data Assessing
│   ├── 4. Data Cleaning
│   ├── 5. Exploratory Data Analysis (EDA)
│   │   ├── Distribusi kategori pekerjaan
│   │   ├── Analisis panjang resume per kategori
│   │   └── Keyword frequency analysis
│   ├── 6. Feature Engineering
│   │   ├── Edukasi level & label
│   │   ├── Years of experience
│   │   ├── Technical & soft skill counts
│   │   └── Word count & character count
│   └── 7. Export cleaned dataset
│
├── Pathora_Dashboard.py                   Streamlit dashboard
├── Pathora_DataDictionary.pdf             Dokumentasi data dictionary
└── requirements.txt                       Python dependencies
```

---

## 🔬 Pipeline Data Science

```
┌─────────────────────────────────────────────────────────────┐
│  📂 Resume.csv (raw, from Kaggle)                          │
│  ~2.500 resume, 24 kategori                                 │
└────────────────────────┬────────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  1. Data Assessing                                          │
│  ├── Cek missing values                                     │
│  ├── Cek duplikasi data                                     │
│  └── Cek tipe data & format                                 │
└────────────────────────┬────────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  2. Data Cleaning                                           │
│  ├── Drop kolom tidak terpakai (Resume_html)                │
│  ├── Hapus duplikat berdasarkan ID                          │
│  ├── Standarisasi format teks                               │
│  └── Case normalization                                     │
└────────────────────────┬────────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  3. EDA (Exploratory Data Analysis)                         │
│  ├── Distribusi 24 kategori pekerjaan                       │
│  ├── Word count distribution per kategori                   │
│  ├── Keyword frequency (top skills per kategori)            │
│  └── Visualisasi distribusi (bar chart, box plot, dll)      │
└────────────────────────┬────────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  4. Feature Engineering                                     │
│  ├── Edukasi: level detection + labeling                    │
│  │   (SMA, D3, S1, S2, S3)                                  │
│  ├── Pengalaman: years of experience extraction             │
│  ├── Sertifikasi: has_cert (binary)                         │
│  ├── Skill: tech_skill_count + soft_skill_count             │
│  ├── Statistik: word_count_raw, word_count, char_count      │
│  └── Teks: resume_lower (lowercased version)                │
└────────────────────────┬────────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  📄 Pathora_cleanData.csv                                   │
│  2.484 resume × 13 kolom (siap untuk modeling)              │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Dataset Detail

### Raw Dataset (`Resume.csv`)

| Metadata | Value |
|----------|-------|
| **Sumber** | Kaggle Resume Dataset |
| **Jumlah awal** | ~2.500 baris |
| **Kategori** | 24 kelas pekerjaan |
| **Kolom awal** | ID, Resume_str, Resume_html, Category |

### Cleaned Dataset (`Pathora_cleanData.csv`)

| Kolom | Tipe | Deskripsi |
|-------|------|-----------|
| `ID` | int | Unique identifier |
| `Resume_str` | string | Teks resume asli (sudah di-clean) |
| `Category` | string | Label kategori pekerjaan (24 kelas) |
| `word_count_raw` | int | Jumlah kata sebelum cleaning |
| `resume_lower` | string | Teks lowercase untuk NLP |
| `word_count` | int | Jumlah kata setelah cleaning |
| `char_count` | int | Jumlah karakter |
| `edu_level` | string | Tingkat pendidikan (teks) |
| `edu_label` | string | Label pendidikan: SMA/D3/S1/S2/S3 |
| `years_experience` | float | Tahun pengalaman (0 jika tidak disebut) |
| `has_cert` | bool | Memiliki sertifikasi? |
| `tech_skill_count` | int | Jumlah technical skills terdeteksi |
| `soft_skill_count` | int | Jumlah soft skills terdeteksi |

---

## 📈 EDA Highlights

### Distribusi Kategori

Distribusi 24 kategori **tidak merata** (class imbalance):
- Kelas **terbanyak**: INFORMATION-TECHNOLOGY (~200+ sample)
- Kelas **tersedikit**: beberapa kategori dengan <50 sample

> **Dampak:** AI Engineer perlu menggunakan **Focal Loss** + **class weights** untuk mengatasi imbalance.

### Keyword Frequency per Kategori

Setiap kategori memiliki kata kunci unik:
| Kategori | Top Keywords |
|----------|-------------|
| INFORMATION-TECHNOLOGY | Python, Java, SQL, AWS, Docker |
| HEALTHCARE | Patient, Nurse, Hospital, Clinical |
| FINANCE | Financial, Analysis, Investment, CFA |
| TEACHER | Classroom, Curriculum, Student, Lesson |

---

## 🚀 Cara Replikasi

### Prasyarat

```bash
Python 3.10+
pip install pandas numpy matplotlib seaborn scikit-learn nltk wordcloud
```

### Langkah-langkah

1. **Buka notebook** `PathOra_DataScience_CC26PSU344.ipynb`
2. **Jalankan sel demi sel** secara berurutan
3. **Output utama:** `Pathora_cleanData.csv` (otomatis tersimpan)
4. **Output visual:** Grafik distribusi, box plot, word cloud

### Dashboard Streamlit

```bash
streamlit run Pathora_Dashboard.py
```

Dashboard menampilkan:
- Ringkasan statistik dataset
- Distribusi kategori interaktif
- Analisis skill per kategori
- Filter dan pencarian

---

## 📚 Referensi

- [Kaggle Resume Dataset](https://www.kaggle.com/datasets/snehasreerajkumar/resume-dataset)
- [Pandas Documentation](https://pandas.pydata.org/)
- [Streamlit Documentation](https://docs.streamlit.io/)
- [Dicoding — Menjadi Data Scientist](https://www.dicoding.com/)
