import os
os.environ["TF_USE_LEGACY_KERAS"] = "1"
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"

import io, json, re, asyncio, uuid, pickle, time
from datetime import datetime, timezone
import numpy as np
import uvicorn
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
import urllib.request
import urllib.error

import joblib
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import backend as K
from sentence_transformers import SentenceTransformer
from transformers import AutoTokenizer, AutoModel
import torch
import fitz

# Custom Components (Dicoding)
class FeatureAttention(keras.layers.Layer):
    def __init__(self, **kw): super().__init__(**kw)
    def build(self, s): self.W = self.add_weight(shape=(s[-1],), initializer="ones", trainable=True)
    def call(self, x): return x * tf.nn.softmax(self.W)
    def get_config(self): return super().get_config()

@keras.saving.register_keras_serializable()
def focal_loss(g=2.0, a=0.5):
    def fn(y, p):
        y = tf.squeeze(tf.cast(y, tf.int32))
        p = K.clip(p, K.epsilon(), 1-K.epsilon())
        ce = tf.nn.sparse_softmax_cross_entropy_with_logits(labels=y, logits=tf.math.log(p+K.epsilon()))
        idx = tf.stack([tf.range(tf.shape(p)[0], dtype=tf.int32), y], axis=-1)
        return K.mean(a * K.pow(1-tf.gather_nd(p,idx), g) * ce)
    return fn

# Load Models
print("Loading models...")
model = keras.models.load_model("pathora_model.keras", custom_objects={
    "FeatureAttention": FeatureAttention,
    "loss_fn": focal_loss()
})
le = joblib.load("extracted/label_encoder.joblib")
st = SentenceTransformer("all-MiniLM-L6-v2")
print("Loading IndoBERT for embeddings...")
bert_tokenizer = AutoTokenizer.from_pretrained("indobenchmark/indobert-base-p2")
bert_model = AutoModel.from_pretrained("indobenchmark/indobert-base-p2")
bert_model.eval()
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
bert_model.to(device)

# Load skill data
with open("extracted/skill_taxonomy.json") as f:
    skill_taxonomy = json.load(f)
with open("extracted/skill_matches.pkl", "rb") as f:
    all_skills = pickle.load(f)
print("All models & data loaded!")

app = FastAPI(title="PathOra API", version="2.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

# Basic abuse guards
# Keep high to avoid early rejection, but LLM context still has limits.
MAX_TEXT_CHARS = 200000
MAX_PDF_PAGES = 12
MAX_REQUESTS_PER_MINUTE = 30
_rate_limit_lock = asyncio.Lock()
_rate_limit = {}


async def enforce_rate_limit(client_ip: str):
    now = time.time()
    cutoff = now - 60
    async with _rate_limit_lock:
        hits = _rate_limit.get(client_ip, [])
        hits = [t for t in hits if t >= cutoff]
        if len(hits) >= MAX_REQUESTS_PER_MINUTE:
            raise HTTPException(429, "Too many requests. Please slow down.")
        hits.append(now)
        _rate_limit[client_ip] = hits

def extract_pdf(file_bytes):
    doc = fitz.open(stream=file_bytes, filetype="pdf")
    if doc.page_count > MAX_PDF_PAGES:
        doc.close()
        raise HTTPException(400, f"PDF terlalu panjang. Maks {MAX_PDF_PAGES} halaman.")
    text = "".join(page.get_text() for page in doc)
    doc.close()
    return text.strip()

def predict(text):
    text = re.sub("<[^>]+>", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    # IndoBERT embedding (768-d) - [CLS] token
    tok = bert_tokenizer([text], padding=True, truncation=True, max_length=128, return_tensors="pt")
    tok = {k: v.to(device) for k, v in tok.items()}
    with torch.no_grad():
        out = bert_model(**tok)
    emb = out.last_hidden_state[:, 0, :].cpu().numpy()
    probs = model.predict(emb, verbose=0)[0]
    return probs

def get_all_predictions(probs):
    """Get all predictions sorted by confidence descending."""
    results = []
    for i in range(len(le.classes_)):
        results.append({"category": le.classes_[i], "confidence": float(probs[i])})
    results.sort(key=lambda x: x["confidence"], reverse=True)
    return results

def get_skill_profile(text):
    """Extract skills from resume text using pre-computed skill matches."""
    emb = st.encode([text], convert_to_numpy=True)

    skill_texts = [s for skills in skill_taxonomy.values() for s in skills]
    skill_names = skill_texts.copy()
    skill_cats = [cat for cat, skills in skill_taxonomy.items() for s in skills]

    from sklearn.metrics.pairwise import cosine_similarity
    skill_emb = st.encode(skill_texts, convert_to_numpy=True)
    sims = cosine_similarity(emb, skill_emb)[0]

    profile = {}
    threshold = 0.35

    for cat in skill_taxonomy.keys():
        matched = []
        cat_skills = skill_taxonomy[cat]
        cat_indices = [i for i, c in enumerate(skill_cats) if c == cat]

        for idx in cat_indices:
            if sims[idx] >= threshold:
                matched.append({
                    "skill": skill_names[idx],
                    "similarity": round(float(sims[idx]), 2)
                })

        matched.sort(key=lambda x: x["similarity"], reverse=True)
        matched_skills = [m["skill"] for m in matched]
        missing_skills = [s for s in cat_skills if s not in matched_skills]

        profile[cat] = {
            "matched_skills": matched,
            "missing_skills": missing_skills[:5]  # top 5 missing
        }

    return profile

async def call_gemini(prompt, api_key):
    if not api_key:
        return "Gemini API key tidak disertakan. Rekomendasi LLM dilewati."
    try:
        masked = f"{api_key[:4]}...{api_key[-4:]}" if len(api_key) >= 8 else "***"
        print(f"[gemini] api_key={masked}")
        print(f"[gemini] request prompt_chars={len(prompt)}")
        url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + api_key
        data = {"contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {"temperature": 0.7, "maxOutputTokens": 4096}}
        req = urllib.request.Request(url, data=json.dumps(data).encode(), headers={"Content-Type": "application/json"})
        with urllib.request.urlopen(req, timeout=30) as r:
            raw = r.read()
            print(f"[gemini] response_status={r.status} bytes={len(raw)}")
            resp = json.loads(raw)
            return resp["candidates"][0]["content"]["parts"][0]["text"]
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", "ignore")
        print(f"[gemini] http_error status={e.code} body={body[:2000]}")
        return f"Gagal menghasilkan rekomendasi: HTTP Error {e.code}: {e.reason}"
    except Exception as e:
        print(f"[gemini] error {type(e).__name__}: {e}")
        return f"Gagal menghasilkan rekomendasi: {str(e)}"

def _truncate_for_llm(text: str, max_chars: int) -> str:
    if len(text) <= max_chars:
        return text
    head = text[:max_chars]
    return head + "\n[...dipotong untuk batas konteks LLM...]"

async def generate_llm(results, resume_text, extracted_skills, api_key):
    if not results:
        return "Belum ada rekomendasi yang memenuhi threshold."
    if not api_key:
        return "Silakan masukkan Gemini API Key pada parameter request untuk mendapatkan rekomendasi AI."

    # RAG: ringkas profil skill dan hasil prediksi sebagai konteks yang terstruktur
    skills_context = []
    for skill_data in extracted_skills:
        cat_name = skill_data["category"]
        matched = ", ".join([m["skill"] for m in skill_data["matched_skills"][:8]])
        missing = ", ".join(skill_data["missing_skills"][:8])
        skills_context.append(
            f"- Domain: {cat_name}\n"
            f"  Skill Dikuasai: {matched or '-'}\n"
            f"  Skill Perlu Dipelajari: {missing or '-'}"
        )
    skills_context_text = "\n".join(skills_context)

    top = results[0]
    cats = ", ".join([r["category"] for r in results[:3]])

    resume_context = _truncate_for_llm(resume_text, 6000)
    prompt = f"""Anda adalah asisten karir AI profesional. Berdasarkan analisis CV dan pencocokan profil berikut, buatlah rekomendasi strategis yang rinci dalam Bahasa Indonesia yang natural.

KANDIDAT BERPOTENSI SEBAGAI: {top["category"]} ({round(top["confidence"]*100, 1)}%)
REKOMENDASI ALTERNATIF: {cats}

[KONTEKS RAG: ANALISIS SKILL]
Berikut adalah hasil ekstraksi sistem kami mengenai skill yang sudah dimiliki kandidat dan yang masih kurang (gap):
{skills_context_text if skills_context_text else "Tidak ada skill spesifik yang terdeteksi menonjol."}

[CUPLIKAN TEKS CV (Untuk Konteks Gaya & Pengalaman)]
{resume_context}

INSTRUKSI:
Tulis 3-4 paragraf yang detail dan tidak terlalu singkat:
Paragraf 1: Ringkas profil kandidat dan mengapa cocok untuk peran utama ({top["category"]}), kaitkan dengan pengalaman/indikasi dari CV.
Paragraf 2: Soroti "Skill Dikuasai" yang paling relevan dan bagaimana itu mendukung performa di peran tersebut.
Paragraf 3: Berikan rencana pengembangan karir taktis berbasis "Skill Perlu Dipelajari" untuk menutupi gap kompetensi.
Paragraf 4 (opsional jika relevan): Rekomendasi langkah nyata 30-60 hari ke depan (kursus/proyek/portofolio) agar target peran lebih realistis.
Gunakan Bahasa Indonesia natural, profesional, informatif, dan cukup mendetail."""

    result = await call_gemini(prompt, api_key)
    return result

# ===== ENDPOINTS =====
@app.get("/")
def root():
    return {"message": "PathOra API v2.0", "status": "running"}

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/predict")
async def predict_text(
    request: Request,
    text: str = Form(...), 
    gemini_api_key: str = Form(None) # Ditambahkan parameter API Key
):
    await enforce_rate_limit(request.client.host if request.client else "unknown")
    if len(text) > MAX_TEXT_CHARS:
        raise HTTPException(400, f"Teks terlalu panjang. Maks {MAX_TEXT_CHARS} karakter.")
    cv_id = str(uuid.uuid4())
    analyzed_at = datetime.now(timezone.utc).isoformat()
    
    probs = predict(text)
    all_preds = get_all_predictions(probs)
    
    top5 = [p for p in all_preds if p["confidence"] > 0.05][:5]
    top = all_preds[0] if all_preds else {"category": "UNKNOWN", "confidence": 0.0}
    career_recs = [{"category": p["category"], "match_score": p["confidence"]} for p in all_preds if p["confidence"] > 0.3]
    
    skill_profile = get_skill_profile(text)
    extracted_skills = []
    for cat, data in skill_profile.items():
        if data["matched_skills"]:
            extracted_skills.append({
                "category": cat,
                "matched_skills": data["matched_skills"],
                "missing_skills": data["missing_skills"]
            })
    
    # Passing API key and extracted skills to LLM function
    api_key = gemini_api_key or os.getenv("GEMINI_API_KEY")
    llm = await generate_llm(all_preds, text, extracted_skills, api_key)
    
    return {
        "cv_id": cv_id,
        "analyzed_at": analyzed_at,
        "predicted_category": top["category"],
        "confidence": top["confidence"],
        "top_5_predictions": top5,
        "extracted_skills": extracted_skills,
        "career_recommendations": career_recs,
        "description_career_recommendations": llm
    }

@app.post("/predict/file")
async def predict_file(
    request: Request,
    file: UploadFile = File(...), 
    gemini_api_key: str = Form(None) # Ditambahkan parameter API Key
):
    await enforce_rate_limit(request.client.host if request.client else "unknown")
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(400, "Only PDF files accepted.")
    content = await file.read()
    if len(content) > 10 * 1024 * 1024:
        raise HTTPException(400, "File too large. Max 10MB.")
    text = extract_pdf(content)
    if len(text) < 20:
        raise HTTPException(400, "Could not extract enough text.")
    if len(text) > MAX_TEXT_CHARS:
        raise HTTPException(400, f"Teks terlalu panjang. Maks {MAX_TEXT_CHARS} karakter.")
    
    cv_id = str(uuid.uuid4())
    analyzed_at = datetime.now(timezone.utc).isoformat()
    
    probs = predict(text)
    all_preds = get_all_predictions(probs)
    
    top5 = [p for p in all_preds if p["confidence"] > 0.05][:5]
    top = all_preds[0] if all_preds else {"category": "UNKNOWN", "confidence": 0.0}
    career_recs = [{"category": p["category"], "match_score": p["confidence"]} for p in all_preds if p["confidence"] > 0.3]
    
    skill_profile = get_skill_profile(text)
    extracted_skills = []
    for cat, data in skill_profile.items():
        if data["matched_skills"]:
            extracted_skills.append({
                "category": cat,
                "matched_skills": data["matched_skills"],
                "missing_skills": data["missing_skills"]
            })
    
    # Passing API key and extracted skills to LLM function
    api_key = gemini_api_key
    llm = await generate_llm(all_preds, text, extracted_skills, api_key)
    
    return {
        "cv_id": cv_id,
        "analyzed_at": analyzed_at,
        "predicted_category": top["category"],
        "confidence": top["confidence"],
        "top_5_predictions": top5,
        "extracted_skills": extracted_skills,
        "career_recommendations": career_recs,
        "description_career_recommendations": llm
    }

if __name__ == "__main__":
    import sys
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    uvicorn.run(app, host="0.0.0.0", port=port)