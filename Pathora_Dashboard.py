"""
Path'Ora - Dashboard Visualisasi & Insight
Preprocessing · EDA · Feature Engineering
Coding Camp 2026 | Tim CC26-PSU344
"""

import re, warnings
warnings.filterwarnings("ignore")

import pandas as pd
import numpy as np
import streamlit as st
import plotly.express as px
import plotly.graph_objects as go
from plotly.subplots import make_subplots

# ══════════════════════════════════════════════════════
# PAGE CONFIG
# ══════════════════════════════════════════════════════
st.set_page_config(
    page_title="Path'Ora - EDA Dashboard",
    page_icon="🧭",
    layout="wide",
    initial_sidebar_state="expanded",
)

# ══════════════════════════════════════════════════════
# GLOBAL CSS
# ══════════════════════════════════════════════════════
st.markdown("""
<style>
@import url('[https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap](https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap)');

*, *::before, *::after { box-sizing: border-box; }

html, body, .stApp, [data-testid="stAppViewContainer"] {
    background: #060a10 !important;
    font-family: 'DM Sans', sans-serif;
}
[data-testid="stHeader"] { background: transparent !important; }
[data-testid="stSidebar"] {
    background: #0b1120 !important;
    border-right: 1px solid #1a2744 !important;
}
[data-testid="stSidebar"] * { color: #94a3b8 !important; }
[data-testid="stSidebarNav"] { display: none; }

h1, h2, h3, h4, h5 {
    font-family: 'Syne', sans-serif !important;
    color: #e2e8f0 !important;
}
p, span, label, div { color: #94a3b8; }

/* - Hero banner - */
.hero {
    background: linear-gradient(135deg, #0d1f3c 0%, #0a1628 50%, #060a10 100%);
    border: 1px solid #1e3a5f;
    border-radius: 16px;
    padding: 32px 36px;
    margin-bottom: 28px;
    position: relative;
    overflow: hidden;
}
.hero::before {
    content: '';
    position: absolute;
    top: -60px; right: -60px;
    width: 260px; height: 260px;
    background: radial-gradient(circle, rgba(56,189,248,0.08) 0%, transparent 70%);
    border-radius: 50%;
}
.hero-title {
    font-family: 'Syne', sans-serif;
    font-size: 2rem; font-weight: 800;
    color: #f0f9ff !important;
    letter-spacing: -0.02em;
    margin: 0 0 6px 0;
}
.hero-sub {
    font-size: 0.9rem; color: #64748b !important;
    margin: 0;
}
.hero-tag {
    display: inline-block;
    background: rgba(56,189,248,0.12);
    border: 1px solid rgba(56,189,248,0.25);
    color: #38bdf8 !important;
    font-size: 0.72rem; font-weight: 600;
    padding: 3px 10px; border-radius: 20px;
    margin-right: 6px; margin-top: 12px;
    letter-spacing: 0.04em; text-transform: uppercase;
}

/* - Section heading - */
.sec-head {
    display: flex; align-items: center; gap: 10px;
    margin: 28px 0 14px 0;
}
.sec-icon {
    width: 34px; height: 34px;
    background: linear-gradient(135deg, #1e3a5f, #0d1f3c);
    border: 1px solid #2563eb;
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-size: 1rem;
}
.sec-title {
    font-family: 'Syne', sans-serif !important;
    font-size: 1rem; font-weight: 700;
    color: #e2e8f0 !important;
    margin: 0;
}
.sec-desc { font-size: 0.8rem; color: #475569 !important; margin: 0; }

/* - KPI card - */
.kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 24px; }
.kpi-card {
    background: linear-gradient(145deg, #0d1f3c, #060a10);
    border: 1px solid #1e3a5f;
    border-radius: 14px;
    padding: 20px 22px;
    position: relative; overflow: hidden;
    transition: border-color 0.2s;
}
.kpi-card:hover { border-color: #2563eb; }
.kpi-card::after {
    content: '';
    position: absolute; bottom: 0; left: 0; right: 0; height: 2px;
    background: linear-gradient(90deg, #2563eb, #38bdf8);
}
.kpi-num {
    font-family: 'Syne', sans-serif;
    font-size: 2rem; font-weight: 800;
    color: #38bdf8 !important; line-height: 1;
}
.kpi-lbl { font-size: 0.78rem; color: #475569 !important; margin-top: 4px; }
.kpi-note { font-size: 0.72rem; color: #334155 !important; margin-top: 6px; }

/* - Insight card - */
.insight {
    background: #0d1f3c;
    border-left: 3px solid #38bdf8;
    border-radius: 0 10px 10px 0;
    padding: 14px 18px;
    margin-top: 10px;
}
.insight p { font-size: 0.85rem; color: #7dd3fc !important; margin: 0; line-height: 1.6; }
.insight strong { color: #bae6fd !important; }

/* - Quality badge - */
.quality-row { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 10px; }
.qbadge {
    background: #0d1f3c;
    border: 1px solid #1e3a5f;
    border-radius: 10px;
    padding: 12px 18px;
    flex: 1; min-width: 130px;
}
.qbadge-val { font-size: 1.4rem; font-weight: 700; font-family: 'Syne', sans-serif; }
.qbadge-lbl { font-size: 0.75rem; color: #475569 !important; margin-top: 2px; }

/* - Divider - */
.divider { border: none; border-top: 1px solid #1a2744; margin: 24px 0; }

/* - Table override - */
[data-testid="stDataFrame"] { border: 1px solid #1e3a5f; border-radius: 10px; overflow: hidden; }

/* - Sidebar nav - */
.nav-item {
    padding: 9px 14px; border-radius: 8px; cursor: pointer;
    font-size: 0.85rem; font-family: 'DM Sans', sans-serif;
    display: flex; align-items: center; gap: 8px;
    transition: background 0.15s;
    color: #64748b !important;
    margin-bottom: 4px;
}
.nav-item.active {
    background: rgba(37,99,235,0.18);
    color: #38bdf8 !important;
    border: 1px solid rgba(37,99,235,0.3);
}
</style>
""", unsafe_allow_html=True)

# ══════════════════════════════════════════════════════
# CONSTANTS
# ══════════════════════════════════════════════════════
TECH_SKILLS = [
    'python','sql','java','javascript','excel','powerpoint','tableau',
    'machine learning','data analysis','cloud','aws','azure','docker',
    'react','angular','nodejs','tensorflow','pytorch','r programming',
    'hadoop','spark','nlp','deep learning','css','html','linux'
]
SOFT_SKILLS = [
    'leadership','management','communication','teamwork','collaboration',
    'problem.solving','analytical','creative','adaptab','time management',
    'presentation','negotiat','strategic','innovat'
]
KEYWORDS = {
    'excel':'Excel','communication':'Communication','management':'Management',
    'leadership':'Leadership','sql':'SQL','python':'Python',
    'java':'Java','javascript':'JavaScript','aws':'AWS',
    'machine learning':'Machine Learning','data analysis':'Data Analysis',
    'certif':'Certification','bachelor':'Bachelor Degree','master':'Master Degree'
}
EDU_ORDER  = ['Tidak Ada','Associate/Diploma','Bachelor','Master','PhD']
EDU_COLORS = ['#334155','#1e3a5f','#1d4ed8','#2563eb','#38bdf8']

# palette
C_BLUE   = '#38bdf8'
C_INDIGO = '#6366f1'
C_GREEN  = '#34d399'
C_AMBER  = '#fbbf24'
C_ROSE   = '#fb7185'
C_PURPLE = '#a78bfa'
C_TEAL   = '#2dd4bf'
PALETTE  = [C_BLUE, C_GREEN, C_INDIGO, C_AMBER, C_ROSE, C_PURPLE, C_TEAL,
            '#f97316','#84cc16','#e879f9','#22d3ee','#4ade80']

BG      = '#060a10'
CARD_BG = '#0b1120'
BORDER  = '#1e3a5f'

LAYOUT = dict(
    paper_bgcolor=CARD_BG, plot_bgcolor=CARD_BG,
    font=dict(color='#94a3b8', family='DM Sans'),
    margin=dict(l=12, r=12, t=36, b=12),
    xaxis=dict(gridcolor='#0f2035', zerolinecolor='#0f2035'),
    yaxis=dict(gridcolor='#0f2035', zerolinecolor='#0f2035'),
)

# ══════════════════════════════════════════════════════
# DATA LOADING
# ══════════════════════════════════════════════════════
@st.cache_data(show_spinner=False)
def load_data():
    df_raw = pd.read_csv("/Pathora/Resume.csv")

    df = df_raw.copy()
    df.dropna(subset=['Category', 'Resume_str'], inplace=True)
    if 'Resume_html' in df.columns:
        df.drop(columns=['Resume_html'], inplace=True)
        
    df['word_count'] = df['Resume_str'].str.split().str.len()
    removed = int((df['word_count'] < 50).sum())
    df = df[df['word_count'] >= 50].reset_index(drop=True)
    
    df['Resume_str'] = df['Resume_str'].str.replace(r'\s+', ' ', regex=True).str.strip()
    df['Category'] = df['Category'].astype(str).str.upper().str.strip()
    df = df[df['Category'] != '']
    
    df['resume_lower'] = df['Resume_str'].str.lower()
    df['char_count'] = df['Resume_str'].str.len()

    def edu_level(t):
        if re.search(r'ph\.?d|doctorate', t):            return 4
        if re.search(r'master|m\.s\.|m\.a\.|mba', t):   return 3
        if re.search(r'bachelor|b\.s\.|b\.a\.|undergraduate', t): return 2
        if re.search(r'associate|diploma', t):           return 1
        return 0
    def edu_lbl(l): return {0:'Tidak Ada',1:'Associate/Diploma',2:'Bachelor',3:'Master',4:'PhD'}[l]
    def max_exp(t): return max((int(x) for x in re.findall(r'(\d+)[+]?\s+year[s]?\s+(?:of\s+)?experience',t)), default=0)
    def has_cert(t): return int(bool(re.search(r'certif', t)))
    def cnt_tech(t): return sum(1 for s in TECH_SKILLS if re.search(s, t))
    def cnt_soft(t): return sum(1 for s in SOFT_SKILLS if re.search(s, t))

    df['edu_level']        = df['resume_lower'].apply(edu_level)
    df['edu_label']        = df['edu_level'].apply(edu_lbl)
    df['years_experience'] = df['resume_lower'].apply(max_exp)
    df['has_cert']         = df['resume_lower'].apply(has_cert)
    df['tech_skill_count'] = df['resume_lower'].apply(cnt_tech)
    df['soft_skill_count'] = df['resume_lower'].apply(cnt_soft)

    meta = {
        'raw_rows'   : len(df_raw),
        'clean_rows' : len(df),
        'removed'    : removed,
        'missing'    : int(df_raw.isnull().sum().sum()),
        'duplicates' : int(df_raw.duplicated().sum()),
        'n_cat'      : df['Category'].nunique(),
    }
    return df_raw, df, meta

with st.spinner("⏳ Memuat dataset..."):
    df_raw, df, meta = load_data()

# ══════════════════════════════════════════════════════
# SIDEBAR
# ══════════════════════════════════════════════════════
with st.sidebar:
    st.markdown("""
    <div style='text-align:center;padding:20px 0 16px'>
        <div style='font-size:2.8rem;line-height:1'>🧭</div>
        <div style='font-family:Syne,sans-serif;font-size:1.3rem;font-weight:800;
                    color:#38bdf8!important;margin-top:6px;letter-spacing:-0.02em'>Path'Ora</div>
        <div style='font-size:0.7rem;color:#334155!important;margin-top:4px;letter-spacing:0.08em;
                    text-transform:uppercase'>EDA Dashboard</div>
    </div>
    <div style='border-top:1px solid #1a2744;margin:0 0 16px'></div>
    """, unsafe_allow_html=True)

    page = st.radio(
        "menu",
        ["🔎 Data Quality",
         "📊 Distribusi Kategori",
         "📝 Analisis Teks",
         "🔑 Analisis Keyword",
         "🧩 Feature Engineering",
         "🔗 Korelasi & Insight"],
        label_visibility="collapsed",
    )

    st.markdown("<div style='border-top:1px solid #1a2744;margin:16px 0'></div>", unsafe_allow_html=True)
    st.markdown(f"""
    <div style='background:#0d1f3c;border:1px solid #1e3a5f;border-radius:10px;padding:14px 16px'>
        <div style='font-size:0.7rem;color:#334155!important;letter-spacing:0.07em;text-transform:uppercase;margin-bottom:8px'>Dataset Info</div>
        <div style='font-size:0.82rem;color:#475569!important;line-height:2'>
            📁 Resume.csv<br>
            📋 {meta['clean_rows']:,} resume bersih<br>
            🏷️ {meta['n_cat']} kategori pekerjaan<br>
            🧱 7 fitur direkayasa
        </div>
    </div>
    """, unsafe_allow_html=True)

# ══════════════════════════════════════════════════════
# HERO
# ══════════════════════════════════════════════════════
st.markdown(f"""
<div class='hero'>
    <div class='hero-title'>🧭 Path'Ora - Data Insight Dashboard</div>
    <div class='hero-sub'>Visualisasi lengkap pipeline Data Science: Preprocessing · EDA · Feature Engineering</div>
    <span class='hero-tag'>Coding Camp 2026</span>
    <span class='hero-tag'>CC26-PSU344</span>
    <span class='hero-tag'>Future Ready Work & Economy</span>
    <span class='hero-tag'>{meta['clean_rows']:,} Resume · {meta['n_cat']} Kategori</span>
</div>
""", unsafe_allow_html=True)

# ══════════════════════════════════════════════════════
# KPI ROW
# ══════════════════════════════════════════════════════
st.markdown(f"""
<div class='kpi-grid'>
    <div class='kpi-card'>
        <div class='kpi-num'>{meta['clean_rows']:,}</div>
        <div class='kpi-lbl'>Total Resume (Bersih)</div>
        <div class='kpi-note'>dari {meta['raw_rows']:,} data mentah</div>
    </div>
    <div class='kpi-card'>
        <div class='kpi-num'>{meta['n_cat']}</div>
        <div class='kpi-lbl'>Kategori Pekerjaan</div>
        <div class='kpi-note'>distribusi relatif seimbang</div>
    </div>
    <div class='kpi-card'>
        <div class='kpi-num'>{int(df['word_count'].mean()):,}</div>
        <div class='kpi-lbl'>Rata-rata Kata/Resume</div>
        <div class='kpi-note'>median {int(df['word_count'].median()):,} kata</div>
    </div>
    <div class='kpi-card'>
        <div class='kpi-num'>{df['has_cert'].mean()*100:.0f}%</div>
        <div class='kpi-lbl'>Resume Bersertifikasi</div>
        <div class='kpi-note'>{int(df['has_cert'].sum()):,} dari {meta['clean_rows']:,} resume</div>
    </div>
</div>
""", unsafe_allow_html=True)

# ══════════════════════════════════════════════════════════════════
# PAGE 1 - DATA QUALITY
# ══════════════════════════════════════════════════════════════════
if page == "🔎 Data Quality":
    st.markdown("""
    <div class='sec-head'>
        <div class='sec-icon'>🔎</div>
        <div><div class='sec-title'>Data Quality Assessment</div>
        <div class='sec-desc'>Penilaian kualitas data mentah sebelum proses cleaning</div></div>
    </div>
    """, unsafe_allow_html=True)

    st.markdown(f"""
    <div class='quality-row'>
        <div class='qbadge'>
            <div class='qbadge-val' style='color:#34d399'>{meta['raw_rows']:,}</div>
            <div class='qbadge-lbl'>Total Baris Raw</div>
        </div>
        <div class='qbadge'>
            <div class='qbadge-val' style='color:#34d399'>0</div>
            <div class='qbadge-lbl'>Missing Values</div>
        </div>
        <div class='qbadge'>
            <div class='qbadge-val' style='color:#34d399'>0</div>
            <div class='qbadge-lbl'>Duplikasi</div>
        </div>
        <div class='qbadge'>
            <div class='qbadge-val' style='color:#fbbf24'>{meta['removed']}</div>
            <div class='qbadge-lbl'>Dihapus (&lt;50 kata)</div>
        </div>
        <div class='qbadge'>
            <div class='qbadge-val' style='color:#38bdf8'>{meta['clean_rows']:,}</div>
            <div class='qbadge-lbl'>Baris Final Bersih</div>
        </div>
    </div>
    """, unsafe_allow_html=True)

    st.markdown("<hr class='divider'>", unsafe_allow_html=True)

    col1, col2 = st.columns(2)

    with col1:
        st.markdown("""
        <div class='sec-head'>
            <div class='sec-icon'>📏</div>
            <div><div class='sec-title'>Distribusi Panjang Resume (Raw)</div></div>
        </div>
        """, unsafe_allow_html=True)

        df_raw2 = df_raw.copy()
        df_raw2['word_count_raw'] = df_raw2['Resume_str'].str.split().str.len()
        fig_raw = go.Figure()
        fig_raw.add_trace(go.Histogram(
            x=df_raw2['word_count_raw'], nbinsx=60,
            marker_color=C_INDIGO, marker_line_color=BG, marker_line_width=0.5,
            name='Frekuensi'
        ))
        fig_raw.add_vline(x=df_raw2['word_count_raw'].mean(),
                          line_dash='dash', line_color=C_ROSE,
                          annotation_text=f"Mean: {df_raw2['word_count_raw'].mean():.0f}",
                          annotation_font_color=C_ROSE, annotation_position='top right')
        fig_raw.add_vline(x=50, line_dash='dot', line_color=C_AMBER,
                          annotation_text="Batas min (50 kata)",
                          annotation_font_color=C_AMBER, annotation_position='top left')
        fig_raw.update_layout(LAYOUT, height=300,
                              xaxis_title='Jumlah Kata', yaxis_title='Frekuensi',
                              title='Dataset Raw - Sebelum Cleaning')
        st.plotly_chart(fig_raw, use_container_width=True)

    with col2:
        st.markdown("""
        <div class='sec-head'>
            <div class='sec-icon'>✅</div>
            <div><div class='sec-title'>Distribusi Panjang Resume (Clean)</div></div>
        </div>
        """, unsafe_allow_html=True)

        fig_clean = go.Figure()
        fig_clean.add_trace(go.Histogram(
            x=df['word_count'], nbinsx=60,
            marker_color=C_BLUE, marker_line_color=BG, marker_line_width=0.5,
        ))
        fig_clean.add_vline(x=df['word_count'].mean(),
                            line_dash='dash', line_color=C_ROSE,
                            annotation_text=f"Mean: {df['word_count'].mean():.0f}",
                            annotation_font_color=C_ROSE, annotation_position='top right')
        fig_clean.add_vline(x=df['word_count'].median(),
                            line_dash='dot', line_color=C_GREEN,
                            annotation_text=f"Median: {df['word_count'].median():.0f}",
                            annotation_font_color=C_GREEN, annotation_position='top left')
        fig_clean.update_layout(LAYOUT, height=300,
                                xaxis_title='Jumlah Kata', yaxis_title='Frekuensi',
                                title='Dataset Bersih - Setelah Cleaning')
        st.plotly_chart(fig_clean, use_container_width=True)

    st.markdown("""<div class='sec-head'><div class='sec-icon'>📋</div>
    <div><div class='sec-title'>Statistik Deskriptif Panjang Resume</div></div></div>""",
    unsafe_allow_html=True)

    stats = df[['word_count','char_count']].describe().round(1).T
    stats.columns = ['Count','Mean','Std','Min','Q1 (25%)','Median (50%)','Q3 (75%)','Max']
    stats.index = ['Jumlah Kata','Jumlah Karakter']
    st.dataframe(stats, use_container_width=True)

    st.markdown("""
    <div class='insight'>
    <p>💡 <strong>Kesimpulan Data Quality:</strong> Dataset berkualitas sangat baik - tidak ada 
    <b>missing value</b> maupun duplikasi. Hanya <strong>1 baris</strong> dihapus karena 
    terlalu pendek (&lt;50 kata). Distribusi panjang resume bersifat <b>right-skewed</b> dengan 
    rata-rata <strong>812 kata</strong> dan median <strong>757 kata</strong>, menandakan sebagian 
    kecil resume sangat panjang (outlier ke atas).</p>
    </div>
    """, unsafe_allow_html=True)

    st.markdown("<hr class='divider'>", unsafe_allow_html=True)
    st.markdown("""<div class='sec-head'><div class='sec-icon'>🧹</div>
    <div><div class='sec-title'>Langkah-langkah Data Cleaning</div></div></div>""",
    unsafe_allow_html=True)

    steps = [
        ("1", "Drop kolom Resume_html", "Tidak diperlukan untuk analisis teks", C_BLUE),
        ("2", "Filter resume < 50 kata", "1 baris dihapus - terlalu pendek, tidak informatif", C_AMBER),
        ("3", "Normalisasi whitespace", "Spasi berlebih dibersihkan dari Resume_str", C_GREEN),
        ("4", "Normalisasi nama kategori", "Uppercase + strip menjadi konsistensi label", C_PURPLE),
        ("5", "Buat kolom resume_lower", "Teks lowercase untuk ekstraksi fitur berbasis keyword", C_TEAL),
    ]
    cols = st.columns(5)
    for col, (num, title, desc, color) in zip(cols, steps):
        col.markdown(f"""
        <div style='background:#0d1f3c;border:1px solid {color}33;border-radius:12px;
                    padding:16px;text-align:center;height:130px;
                    border-top:3px solid {color}'>
            <div style='font-family:Syne,sans-serif;font-size:1.5rem;font-weight:800;
                        color:{color}!important'>{num}</div>
            <div style='font-size:0.8rem;font-weight:600;color:#e2e8f0!important;
                        margin:4px 0'>{title}</div>
            <div style='font-size:0.72rem;color:#475569!important;line-height:1.4'>{desc}</div>
        </div>
        """, unsafe_allow_html=True)

# ══════════════════════════════════════════════════════════════════
# PAGE 2 - DISTRIBUSI KATEGORI
# ══════════════════════════════════════════════════════════════════
elif page == "📊 Distribusi Kategori":
    st.markdown("""<div class='sec-head'><div class='sec-icon'>📊</div>
    <div><div class='sec-title'>Distribusi Kategori Pekerjaan</div>
    <div class='sec-desc'>Sebaran jumlah resume per kategori target</div></div></div>""",
    unsafe_allow_html=True)

    cat_counts = df['Category'].value_counts().reset_index()
    cat_counts.columns = ['Category','Count']
    cat_counts['Pct'] = (cat_counts['Count'] / cat_counts['Count'].sum() * 100).round(1)

    col1, col2 = st.columns([3, 2])

    with col1:
        fig_bar = go.Figure(go.Bar(
            x=cat_counts['Count'],
            y=cat_counts['Category'],
            orientation='h',
            marker=dict(
                color=cat_counts['Count'],
                colorscale=[[0,'#1e3a5f'],[0.5,'#2563eb'],[1,'#38bdf8']],
                showscale=False,
            ),
            text=[f"{r['Count']} ({r['Pct']}%)" for _, r in cat_counts.iterrows()],
            textposition='outside', textfont_size=10,
        ))
        fig_bar.update_layout(
            LAYOUT, height=560,
            xaxis=dict(gridcolor='#0f2035', title='Jumlah Resume', range=[0, 160]),
            yaxis=dict(autorange='reversed', title=None),
            title='Jumlah Resume per Kategori',
        )
        st.plotly_chart(fig_bar, use_container_width=True)

    with col2:
        fig_pie = px.pie(
            cat_counts.head(10), values='Count', names='Category',
            color_discrete_sequence=PALETTE,
            hole=0.55,
        )
        fig_pie.update_traces(textinfo='label+percent', textfont_size=9,
                              pull=[0.03]*10)
        fig_pie.update_layout(
            LAYOUT, height=320,
            title='Top 10 Kategori',
            showlegend=False,
            annotations=[dict(text=f"Top 10<br><b style='color:#38bdf8'>{cat_counts['Count'].head(10).sum()}</b>",
                              x=0.5, y=0.5, font_size=12, showarrow=False,
                              font_color='#94a3b8')]
        )
        st.plotly_chart(fig_pie, use_container_width=True)

        top_cat   = cat_counts.iloc[0]
        bot_cat   = cat_counts.iloc[-1]
        st.markdown(f"""
        <div style='display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:8px'>
            <div style='background:#0d1f3c;border:1px solid {C_GREEN}44;border-radius:10px;
                        padding:12px;text-align:center;border-top:2px solid {C_GREEN}'>
                <div style='font-size:0.65rem;color:#34d399!important;text-transform:uppercase;
                            letter-spacing:0.07em'>Terbanyak</div>
                <div style='font-size:1rem;font-weight:700;color:#e2e8f0!important;margin-top:3px'>
                    {top_cat['Category']}</div>
                <div style='font-size:0.85rem;color:#34d399!important'>{top_cat['Count']} resume</div>
            </div>
            <div style='background:#0d1f3c;border:1px solid {C_ROSE}44;border-radius:10px;
                        padding:12px;text-align:center;border-top:2px solid {C_ROSE}'>
                <div style='font-size:0.65rem;color:#fb7185!important;text-transform:uppercase;
                            letter-spacing:0.07em'>Tersedikit</div>
                <div style='font-size:1rem;font-weight:700;color:#e2e8f0!important;margin-top:3px'>
                    {bot_cat['Category']}</div>
                <div style='font-size:0.85rem;color:#fb7185!important'>{bot_cat['Count']} resume</div>
            </div>
        </div>
        """, unsafe_allow_html=True)

    st.markdown("""
    <div class='insight'>
    <p>💡 <strong>Kesimpulan:</strong> Dataset sangat seimbang - sebagian besar kategori memiliki 
    100 hingga 120 resume. Pengecualian signifikan pada <strong>BPO (22)</strong> dan 
    <strong>Agriculture (63)</strong> yang jauh lebih sedikit. Keseimbangan ini menguntungkan 
    proses modeling karena meminimalkan bias kelas dominan. Namun perlu perhatian khusus pada 
    kategori minor saat evaluasi model nanti.</p>
    </div>
    """, unsafe_allow_html=True)

    st.markdown("<hr class='divider'>", unsafe_allow_html=True)
    st.markdown("""<div class='sec-head'><div class='sec-icon'>📋</div>
    <div><div class='sec-title'>Tabel Statistik per Kategori</div></div></div>""",
    unsafe_allow_html=True)

    cat_stats = df.groupby('Category').agg(
        Jumlah         = ('word_count','count'),
        Rata_Kata      = ('word_count','mean'),
        Med_Kata       = ('word_count','median'),
        Avg_Tech_Skill = ('tech_skill_count','mean'),
        Avg_Soft_Skill = ('soft_skill_count','mean'),
        Pct_Sertif     = ('has_cert','mean'),
    ).round(2).reset_index()
    cat_stats['Pct_Sertif'] = (cat_stats['Pct_Sertif']*100).round(1).astype(str)+'%'
    cat_stats['Rata_Kata']  = cat_stats['Rata_Kata'].round(0).astype(int)
    cat_stats['Med_Kata']   = cat_stats['Med_Kata'].round(0).astype(int)
    cat_stats.columns = ['Kategori','Jumlah','Rata-rata Kata','Median Kata',
                         'Avg Tech Skill','Avg Soft Skill','% Sertifikasi']
    st.dataframe(cat_stats.sort_values('Jumlah', ascending=False), use_container_width=True, height=380)

# ══════════════════════════════════════════════════════════════════
# PAGE 3 - ANALISIS TEKS
# ══════════════════════════════════════════════════════════════════
elif page == "📝 Analisis Teks":
    st.markdown("""<div class='sec-head'><div class='sec-icon'>📝</div>
    <div><div class='sec-title'>Analisis Teks Resume</div>
    <div class='sec-desc'>Distribusi panjang resume (word count & char count) per kategori</div>
    </div></div>""", unsafe_allow_html=True)

    order_wc = df.groupby('Category')['word_count'].median().sort_values(ascending=False).index

    fig_box = go.Figure()
    for i, cat in enumerate(order_wc):
        sub = df[df['Category']==cat]
        fig_box.add_trace(go.Box(
            y=sub['word_count'], name=cat,
            marker_color=PALETTE[i % len(PALETTE)],
            line_color=PALETTE[i % len(PALETTE)],
            boxpoints='outliers',
            marker=dict(size=3, opacity=0.5),
        ))
    fig_box.update_layout(
        LAYOUT, height=420,
        title='Distribusi Panjang Resume per Kategori (diurutkan berdasarkan median)',
        xaxis=dict(tickangle=-40, tickfont_size=9, title=None),
        yaxis=dict(title='Jumlah Kata', gridcolor='#0f2035'),
        showlegend=False,
    )
    st.plotly_chart(fig_box, use_container_width=True)

    col1, col2 = st.columns(2)

    with col1:
        wc_mean = df.groupby('Category')['word_count'].mean().sort_values(ascending=False)
        top5  = wc_mean.head(5)
        bot5  = wc_mean.tail(5)
        cats  = list(bot5.index) + list(top5.index)
        vals  = list(bot5.values) + list(top5.values)
        cols2 = [C_ROSE]*5 + [C_GREEN]*5

        fig_tb = go.Figure(go.Bar(
            x=vals, y=cats, orientation='h',
            marker_color=cols2, text=[f'{v:.0f}' for v in vals],
            textposition='outside',
        ))
        fig_tb.update_layout(LAYOUT, height=320,
                             title='Top 5 vs Bottom 5 Kategori (Rata-rata Kata)',
                             xaxis_title='Jumlah Kata', yaxis_title=None,
                             )
        st.plotly_chart(fig_tb, use_container_width=True)

    with col2:
        fig_vio = go.Figure(go.Violin(
            y=df['word_count'],
            box_visible=True,
            line_color=C_BLUE,
            meanline_visible=True,
            points='outliers',
            marker=dict(color=C_BLUE, size=3, opacity=0.4),
        ))
        fig_vio.update_layout(LAYOUT, height=320,
                              title='Distribusi Keseluruhan Panjang Resume',
                              yaxis_title='Jumlah Kata', xaxis_title=None)
        st.plotly_chart(fig_vio, use_container_width=True)

    st.markdown("""
    <div class='insight'>
    <p>💡 <strong>Kesimpulan:</strong> Resume kategori <strong>BPO</strong> dan 
    <strong>Information Technology</strong> paling panjang (rata-rata sekitar 900 kata), 
    menunjukkan deskripsi pengalaman yang lebih mendetail. <strong>Sales</strong> dan 
    <strong>Teacher</strong> memiliki median terendah. Terdapat <b>outlier</b> 
    pada beberapa kategori (Chef, Public Relations) yang bisa mencapai 5.000 kata - 
    kemungkinan resume yang sangat komprehensif atau berisi portofolio.</p>
    </div>
    """, unsafe_allow_html=True)

    st.markdown("<hr class='divider'>", unsafe_allow_html=True)
    st.markdown("""<div class='sec-head'><div class='sec-icon'>📐</div>
    <div><div class='sec-title'>Korelasi Word Count vs Char Count</div></div></div>""",
    unsafe_allow_html=True)

    sample = df.sample(min(500, len(df)), random_state=42)
    fig_sc = px.scatter(
        sample, x='word_count', y='char_count',
        color='Category', opacity=0.65,
        color_discrete_sequence=PALETTE,
        hover_data={'Category':True,'word_count':True,'char_count':True},
        title='Sample 500 Resume: Word Count vs Char Count (korelasi r=0.99)',
    )
    fig_sc.update_layout(LAYOUT, height=360,
                         xaxis_title='Jumlah Kata',
                         yaxis_title='Jumlah Karakter',
                         legend=dict(font_size=9, bgcolor=CARD_BG))
    st.plotly_chart(fig_sc, use_container_width=True)

# ══════════════════════════════════════════════════════════════════
# PAGE 4 - ANALISIS KEYWORD
# ══════════════════════════════════════════════════════════════════
elif page == "🔑 Analisis Keyword":
    st.markdown("""<div class='sec-head'><div class='sec-icon'>🔑</div>
    <div><div class='sec-title'>Analisis Frekuensi Keyword</div>
    <div class='sec-desc'>Kata kunci paling sering muncul lintas seluruh resume</div>
    </div></div>""", unsafe_allow_html=True)

    kw_pct = {
        label: round(df['resume_lower'].str.contains(kw, na=False).sum()/len(df)*100, 1)
        for kw, label in KEYWORDS.items()
    }
    kw_df2 = pd.Series(kw_pct).sort_values(ascending=True).reset_index()
    kw_df2.columns = ['Keyword','Pct']

    col1, col2 = st.columns([3, 2])
    with col1:
        colors_kw = [C_BLUE if v >= 20 else '#4f46e5' for v in kw_df2['Pct']]
        fig_kw = go.Figure(go.Bar(
            x=kw_df2['Pct'], y=kw_df2['Keyword'], orientation='h',
            marker_color=colors_kw,
            text=[f'{v}%' for v in kw_df2['Pct']],
            textposition='outside',
        ))
        fig_kw.update_layout(
            LAYOUT, height=380,
            title='% Resume yang Mengandung Keyword',
            xaxis=dict(range=[0,115], title='Persentase (%)', gridcolor='#0f2035'),
            yaxis_title=None,
        )
        st.plotly_chart(fig_kw, use_container_width=True)

    with col2:
        top5_kw = kw_df2.sort_values('Pct', ascending=False).head(5)
        fig_donut = go.Figure(go.Pie(
            labels=top5_kw['Keyword'],
            values=top5_kw['Pct'],
            hole=0.6,
            marker_colors=PALETTE[:5],
            textinfo='label+percent',
            textfont_size=10,
        ))
        fig_donut.update_layout(
            LAYOUT, height=280,
            title='Top 5 Keyword',
            showlegend=False,
            annotations=[dict(text='Top 5', x=0.5, y=0.5, font_size=12,
                              showarrow=False, font_color='#94a3b8')]
        )
        st.plotly_chart(fig_donut, use_container_width=True)

        high_kw = kw_df2[kw_df2['Pct']>=20]
        low_kw  = kw_df2[kw_df2['Pct']<10]
        st.markdown(f"""
        <div style='display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px'>
            <div style='background:#0d1f3c;border:1px solid {C_GREEN}33;border-radius:8px;
                        padding:10px;text-align:center'>
                <div style='font-size:1.4rem;font-weight:700;color:{C_GREEN}!important'>
                    {len(high_kw)}</div>
                <div style='font-size:0.72rem;color:#475569!important'>keyword ≥20%</div>
            </div>
            <div style='background:#0d1f3c;border:1px solid {C_ROSE}33;border-radius:8px;
                        padding:10px;text-align:center'>
                <div style='font-size:1.4rem;font-weight:700;color:{C_ROSE}!important'>
                    {len(low_kw)}</div>
                <div style='font-size:0.72rem;color:#475569!important'>keyword &lt;10%</div>
            </div>
        </div>
        """, unsafe_allow_html=True)

    st.markdown("""
    <div class='insight'>
    <p>💡 <strong>Kesimpulan:</strong> <strong>Management (85.4%)</strong> adalah keyword 
    paling dominan - hampir semua resume menyebut aspek manajemen. <strong>Excel (65.1%)</strong> 
    dan <strong>Communication (60.6%)</strong> juga sangat umum, menunjukkan soft skill generik. 
    Sebaliknya, skill teknis spesifik seperti <strong>Python (1.6%)</strong>, 
    <strong>Machine Learning (0.5%)</strong>, dan <strong>JavaScript (2.3%)</strong> sangat jarang, 
    mencerminkan dominasi resume non-IT dalam dataset ini.</p>
    </div>
    """, unsafe_allow_html=True)

    st.markdown("<hr class='divider'>", unsafe_allow_html=True)
    st.markdown("""<div class='sec-head'><div class='sec-icon'>🌡️</div>
    <div><div class='sec-title'>Heatmap Keyword per Kategori</div>
    <div class='sec-desc'>Persentase kemunculan setiap keyword di masing-masing kategori</div>
    </div></div>""", unsafe_allow_html=True)

    all_cats = df['Category'].value_counts().index.tolist()
    kw_list  = list(KEYWORDS.items())
    hm_z, hm_text = [], []
    for kw, label in kw_list:
        row, row_txt = [], []
        for cat in all_cats:
            sub = df[df['Category']==cat]
            pct = round(sub['resume_lower'].str.contains(kw, na=False).mean()*100, 0)
            row.append(pct); row_txt.append(f'{int(pct)}%')
        hm_z.append(row); hm_text.append(row_txt)

    fig_hm = go.Figure(go.Heatmap(
        z=hm_z, x=all_cats, y=[l for _, l in kw_list],
        colorscale=[[0,'#060a10'],[0.3,'#1e3a5f'],[0.6,'#2563eb'],[1,'#38bdf8']],
        text=hm_text, texttemplate='%{text}', textfont_size=8,
        hoverongaps=False,
    ))
    fig_hm.update_layout(
        LAYOUT, height=420,
        title='% Resume Mengandung Keyword per Kategori',
        xaxis=dict(tickangle=-35, tickfont_size=8, title=None),
        yaxis=dict(title=None, autorange='reversed'),
        margin=dict(l=120, r=12, t=40, b=80),
    )
    st.plotly_chart(fig_hm, use_container_width=True)

    st.markdown("""
    <div class='insight'>
    <p>💡 <strong>Insight Heatmap:</strong> <strong>Information Technology</strong> memiliki 
    konsentrasi keyword teknis (SQL, AWS, Python) tertinggi meski absolutnya tetap rendah. 
    Keyword Management tersebar merata di hampir semua kategori. Kategori 
    <strong>Finance & Banking</strong> unggul pada keyword sertifikasi dan Bachelor Degree. 
    Pola ini bisa menjadi sinyal diferensiasi antar kategori dalam proses feature selection.</p>
    </div>
    """, unsafe_allow_html=True)

# ══════════════════════════════════════════════════════════════════
# PAGE 5 - FEATURE ENGINEERING
# ══════════════════════════════════════════════════════════════════
elif page == "🧩 Feature Engineering":
    st.markdown("""<div class='sec-head'><div class='sec-icon'>🧩</div>
    <div><div class='sec-title'>Feature Engineering</div>
    <div class='sec-desc'>7 fitur numerik hasil rekayasa dari teks resume mentah</div>
    </div></div>""", unsafe_allow_html=True)

    features_info = [
        ("edu_level",        "Tingkat Pendidikan",   "Ordinal 0-4 (Tidak Ada ke PhD)",        C_BLUE,   "🎓"),
        ("years_experience", "Tahun Pengalaman",     "Regex ekstrak angka", C_GREEN, "📅"),
        ("has_cert",         "Sertifikasi",          "Binary: 1 jika mengandung kata certif",  C_AMBER,  "📜"),
        ("tech_skill_count", "Tech Skill Count",     "Jumlah dari 26 kata kunci teknis",         C_INDIGO, "💻"),
        ("soft_skill_count", "Soft Skill Count",     "Jumlah dari 14 kata kunci soft skill",     C_PURPLE, "🤝"),
        ("word_count",       "Word Count",           "Jumlah token kata dalam Resume_str",       C_TEAL,   "📄"),
        ("char_count",       "Character Count",      "Jumlah karakter dalam Resume_str",         C_ROSE,   "🔡"),
    ]
    cols = st.columns(7)
    for col, (feat, name, desc, color, icon) in zip(cols, features_info):
        val = df[feat].mean()
        col.markdown(f"""
        <div style='background:#0d1f3c;border:1px solid {color}33;border-radius:12px;
                    padding:14px 10px;text-align:center;
                    border-top:3px solid {color};height:145px'>
            <div style='font-size:1.4rem'>{icon}</div>
            <div style='font-size:0.72rem;font-weight:700;color:{color}!important;
                        margin:4px 0;text-transform:uppercase;letter-spacing:0.05em'>{name}</div>
            <div style='font-size:1rem;font-weight:700;color:#e2e8f0!important'>{val:.2f}</div>
            <div style='font-size:0.65rem;color:#334155!important;margin-top:4px;
                        line-height:1.3'>{desc}</div>
        </div>
        """, unsafe_allow_html=True)

    st.markdown("<br>", unsafe_allow_html=True)

    tab1, tab2 = st.tabs(["📊 Distribusi Fitur", "📦 Fitur per Kategori"])

    with tab1:
        col1, col2, col3 = st.columns(3)

        with col1:
            edu_counts = df['edu_label'].value_counts().reindex(EDU_ORDER).fillna(0)
            fig_edu = go.Figure(go.Bar(
                x=EDU_ORDER, y=edu_counts.values,
                marker_color=EDU_COLORS,
                text=[f'{int(v)}' for v in edu_counts.values],
                textposition='outside',
            ))
            fig_edu.update_layout(LAYOUT, height=280, title='🎓 Tingkat Pendidikan',
                                  xaxis=dict(tickfont_size=9, title=None),
                                  yaxis=dict(title='Jumlah', gridcolor='#0f2035'))
            st.plotly_chart(fig_edu, use_container_width=True)

        with col2:
            fig_exp = go.Figure(go.Histogram(
                x=df[df['years_experience']>0]['years_experience'],
                nbinsx=20, marker_color=C_GREEN,
                marker_line_color=BG, marker_line_width=0.5,
            ))
            pct_no_exp = (df['years_experience']==0).mean()*100
            fig_exp.update_layout(LAYOUT, height=280,
                                  title=f'📅 Tahun Pengalaman (yang lebih dari 0, {100-pct_no_exp:.0f}% populasi)',
                                  xaxis=dict(title='Tahun', gridcolor='#0f2035'),
                                  yaxis=dict(title='Frekuensi', gridcolor='#0f2035'))
            st.plotly_chart(fig_exp, use_container_width=True)

        with col3:
            cert_vals = df['has_cert'].value_counts()
            fig_cert = go.Figure(go.Pie(
                labels=['Ada Sertifikasi','Tidak Ada'],
                values=[cert_vals.get(1,0), cert_vals.get(0,0)],
                hole=0.55,
                marker_colors=[C_AMBER, '#1e3a5f'],
                textinfo='label+percent',
            ))
            fig_cert.update_layout(LAYOUT, height=280, title='📜 Sertifikasi',
                                   showlegend=False)
            st.plotly_chart(fig_cert, use_container_width=True)

        col4, col5, col6 = st.columns(3)

        with col4:
            fig_tech = go.Figure(go.Histogram(
                x=df['tech_skill_count'], nbinsx=15,
                marker_color=C_INDIGO,
                marker_line_color=BG, marker_line_width=0.5,
            ))
            fig_tech.update_layout(LAYOUT, height=280, title='💻 Tech Skill Count',
                                   xaxis=dict(title='Jumlah Skill', gridcolor='#0f2035'),
                                   yaxis=dict(title='Frekuensi', gridcolor='#0f2035'))
            st.plotly_chart(fig_tech, use_container_width=True)

        with col5:
            fig_soft2 = go.Figure(go.Histogram(
                x=df['soft_skill_count'], nbinsx=15,
                marker_color=C_PURPLE,
                marker_line_color=BG, marker_line_width=0.5,
            ))
            fig_soft2.update_layout(LAYOUT, height=280, title='🤝 Soft Skill Count',
                                    xaxis=dict(title='Jumlah Skill', gridcolor='#0f2035'),
                                    yaxis=dict(title='Frekuensi', gridcolor='#0f2035'))
            st.plotly_chart(fig_soft2, use_container_width=True)

        with col6:
            fig_wc = go.Figure(go.Histogram(
                x=df['word_count'], nbinsx=50,
                marker_color=C_TEAL,
                marker_line_color=BG, marker_line_width=0.5,
            ))
            fig_wc.add_vline(x=df['word_count'].mean(), line_dash='dash',
                             line_color=C_ROSE,
                             annotation_text=f"Mean {df['word_count'].mean():.0f}",
                             annotation_font_color=C_ROSE, annotation_position='top right')
            fig_wc.update_layout(LAYOUT, height=280, title='📄 Word Count',
                                 xaxis=dict(title='Kata', gridcolor='#0f2035'),
                                 yaxis=dict(title='Frekuensi', gridcolor='#0f2035'))
            st.plotly_chart(fig_wc, use_container_width=True)

    with tab2:
        feat_sel = st.selectbox(
            "Pilih fitur untuk dibandingkan antar kategori:",
            ['tech_skill_count','soft_skill_count','edu_level','has_cert','years_experience','word_count'],
            format_func=lambda x: {
                'tech_skill_count':'💻 Tech Skill Count',
                'soft_skill_count':'🤝 Soft Skill Count',
                'edu_level':'🎓 Edu Level (rata-rata)',
                'has_cert':'📜 % Bersertifikasi',
                'years_experience':'📅 Tahun Pengalaman (rata-rata)',
                'word_count':'📄 Word Count (rata-rata)',
            }[x]
        )

        agg_df = df.groupby('Category')[feat_sel].mean().sort_values(ascending=True).reset_index()

        if feat_sel == 'has_cert':
            agg_df[feat_sel] = agg_df[feat_sel] * 100
            ytitle = '% Bersertifikasi'
        else:
            ytitle = feat_sel.replace('_',' ').title()

        fig_feat = go.Figure(go.Bar(
            x=agg_df[feat_sel], y=agg_df['Category'],
            orientation='h',
            marker=dict(
                color=agg_df[feat_sel],
                colorscale=[[0,'#1e3a5f'],[0.5,'#2563eb'],[1,'#38bdf8']],
                showscale=False,
            ),
            text=[f'{v:.2f}' for v in agg_df[feat_sel]],
            textposition='outside',
        ))
        fig_feat.update_layout(
            LAYOUT, height=520,
            title=f'{ytitle} - Rata-rata per Kategori',
            xaxis=dict(title=ytitle, gridcolor='#0f2035'),
            yaxis=dict(title=None),
        )
        st.plotly_chart(fig_feat, use_container_width=True)

    st.markdown("""
    <div class='insight'>
    <p>💡 <strong>Kesimpulan Feature Engineering:</strong> Mayoritas resume tidak mencantumkan 
    pengalaman dalam format "N years experience" secara eksplisit - hanya 
    <strong>~12% resume</strong> yang berhasil diekstrak. Tingkat pendidikan 
    <strong>Master</strong> mendominasi dataset (940 resume). <strong>Information Technology</strong> 
    memimpin dalam tech skill count (rata-rata 2.44), sementara 
    <strong>Business Development & Public Relations</strong> unggul dalam soft skill count 
    (~4.9). Fitur <b>word_count</b> dan <b>char_count</b> paling mudah diekstrak dan paling 
    konsisten nilainya.</p>
    </div>
    """, unsafe_allow_html=True)

# ══════════════════════════════════════════════════════════════════
# PAGE 6 - KORELASI & INSIGHT
# ══════════════════════════════════════════════════════════════════
elif page == "🔗 Korelasi & Insight":
    st.markdown("""<div class='sec-head'><div class='sec-icon'>🔗</div>
    <div><div class='sec-title'>Korelasi Antar Fitur & Kesimpulan Akhir</div>
    <div class='sec-desc'>Hubungan antar 7 fitur yang direkayasa + ringkasan insight proyek</div>
    </div></div>""", unsafe_allow_html=True)

    feats = ['edu_level','years_experience','has_cert',
             'tech_skill_count','soft_skill_count','word_count','char_count']
    feat_labels = ['Edu Level','Pengalaman','Sertifikasi',
                   'Tech Skill','Soft Skill','Word Count','Char Count']
    corr = df[feats].corr().round(3)

    col1, col2 = st.columns([3, 2])

    with col1:
        fig_corr = go.Figure(go.Heatmap(
            z=corr.values,
            x=feat_labels, y=feat_labels,
            colorscale=[[0,'#1e3a5f'],[0.5,'#0b1120'],[1,'#2563eb']],
            zmid=0,
            text=corr.values.round(2),
            texttemplate='%{text}', textfont_size=11,
        ))
        fig_corr.update_layout(
            LAYOUT, height=380,
            title='Heatmap Korelasi Pearson Antar 7 Fitur',
            xaxis=dict(tickangle=-25, tickfont_size=10, title=None),
            yaxis=dict(autorange='reversed', title=None, tickfont_size=10),
            margin=dict(l=100, r=12, t=40, b=70),
        )
        st.plotly_chart(fig_corr, use_container_width=True)

    with col2:
        sample2 = df.sample(min(400, len(df)), random_state=7)
        fig_s2 = px.scatter(
            sample2, x='soft_skill_count', y='word_count',
            color='Category',
            opacity=0.65,
            color_discrete_sequence=PALETTE,
            title='Soft Skill vs Word Count (r=0.287)',
        )
        fig_s2.update_layout(LAYOUT, height=380,
                             xaxis_title='Soft Skill Count',
                             yaxis_title='Word Count',
                             showlegend=False)
        st.plotly_chart(fig_s2, use_container_width=True)

    st.markdown("""
    <div class='insight'>
    <p>💡 <strong>Insight Korelasi:</strong> Korelasi tertinggi adalah antara 
    <strong>word_count dan char_count (r=0.99)</strong> - keduanya hampir identik dan redundan; 
    cukup gunakan salah satu. Korelasi bermakna berikutnya adalah 
    <strong>soft_skill_count dan word_count (r=0.287)</strong> dan 
    <strong>soft_skill_count dan char_count (r=0.317)</strong> - resume yang lebih panjang 
    cenderung menyebut lebih banyak soft skill. <strong>years_experience</strong> hampir tidak 
    berkorelasi dengan fitur lain (r&lt;0.1) karena mayoritas resume tidak menyebutkan pengalaman 
    secara eksplisit.</p>
    </div>
    """, unsafe_allow_html=True)

    st.markdown("<hr class='divider'>", unsafe_allow_html=True)
    st.markdown("""<div class='sec-head'><div class='sec-icon'>🕸️</div>
    <div><div class='sec-title'>Radar Chart - Profil Fitur per Kategori</div>
    <div class='sec-desc'>Perbandingan rata-rata fitur (dinormalisasi) untuk 8 kategori teratas</div>
    </div></div>""", unsafe_allow_html=True)

    top8 = df['Category'].value_counts().head(8).index.tolist()
    radar_feats  = ['tech_skill_count','soft_skill_count','edu_level','has_cert','word_count']
    radar_labels = ['Tech Skill','Soft Skill','Edu Level','Sertifikasi','Word Count']
    f_min = df[radar_feats].min()
    f_max = df[radar_feats].max()

    fig_radar = go.Figure()
    for i, cat in enumerate(top8):
        sub_avg = df[df['Category']==cat][radar_feats].mean()
        norm    = ((sub_avg - f_min) / (f_max - f_min + 1e-9)).tolist()
        vals    = norm + [norm[0]]
        fig_radar.add_trace(go.Scatterpolar(
            r=vals,
            theta=radar_labels + [radar_labels[0]],
            fill='toself',
            name=cat,
            line_color=PALETTE[i],
            opacity=0.85,
        ))
    fig_radar.update_layout(
        LAYOUT, height=420,
        polar=dict(
            bgcolor='#060a10',
            radialaxis=dict(gridcolor='#1a2744', tickfont_size=8,
                            color='#334155', range=[0,1]),
            angularaxis=dict(gridcolor='#1a2744', tickfont_size=10,
                             color='#64748b'),
        ),
        legend=dict(font_size=9, bgcolor=CARD_BG, bordercolor=BORDER,
                    borderwidth=1, orientation='h', y=-0.15),
    )
    st.plotly_chart(fig_radar, use_container_width=True)

    st.markdown("<hr class='divider'>", unsafe_allow_html=True)
    st.markdown("""<div class='sec-head'><div class='sec-icon'>📌</div>
    <div><div class='sec-title'>Ringkasan Insight & Kesimpulan</div></div></div>""",
    unsafe_allow_html=True)

    insights = [
        (C_BLUE,   "📁 Kualitas Data Sangat Baik",
         "Dataset bersih: 0 missing value, 0 duplikat, hanya 1 baris dihapus (resume < 50 kata). Siap untuk proses feature engineering dan modeling tanpa imputation."),
        (C_GREEN,  "⚖️ Dataset Hampir Seimbang",
         "Sebagian besar dari 24 kategori memiliki 100-120 resume. Hanya BPO (22) dan Agriculture (63) yang jauh lebih sedikit. Ini menguntungkan proses klasifikasi multi-kelas."),
        (C_AMBER,  "📝 Resume Cukup Informatif",
         "Rata-rata 812 kata per resume (median 757). Panjang ini cukup kaya untuk ekstraksi fitur berbasis keyword, namun perlu teknik NLP lebih lanjut (TF-IDF, embeddings) untuk akurasi optimal."),
        (C_INDIGO, "💼 Management Mendominasi Keyword",
         "85.4% resume menyebut kata management - ini terlalu umum untuk menjadi fitur pembeda. Keyword spesifik seperti Python (1.6%) dan SQL (7.7%) lebih diskriminatif untuk kategori IT."),
        (C_PURPLE, "🎓 Pendidikan Tinggi Mendominasi",
         "940 resume mencantumkan Master (37.9%), disusul Bachelor (29.4%). Ini bisa menjadi fitur prediktif kuat untuk kategori seperti Advocate, Healthcare, dan Engineering."),
        (C_ROSE,   "🔁 Word Count & Char Count Redundan",
         "Korelasi r=0.99 antara kedua fitur menunjukkan redundansi. Untuk efisiensi model, disarankan hanya menggunakan salah satu (word_count lebih interpretatif)."),
        (C_TEAL,   "📅 Pengalaman Sulit Diekstrak",
         "Hanya ~12% resume (306 dari 2.483) berhasil diekstrak tahun pengalaman via regex. Mayoritas tidak menggunakan format 'N years experience' secara eksplisit - perlu strategi ekstraksi alternatif."),
    ]

    for i in range(0, len(insights), 2):
        c1, c2 = st.columns(2)
        for col, (color, title, body) in zip([c1, c2], insights[i:i+2]):
            col.markdown(f"""
            <div style='background:#0d1f3c;border:1px solid {color}33;border-radius:12px;
                        padding:16px 18px;margin-bottom:12px;
                        border-left:4px solid {color}'>
                <div style='font-family:Syne,sans-serif;font-size:0.9rem;font-weight:700;
                            color:{color}!important;margin-bottom:6px'>{title}</div>
                <div style='font-size:0.82rem;color:#64748b!important;line-height:1.6'>{body}</div>
            </div>
            """, unsafe_allow_html=True)

# ══════════════════════════════════════════════════════
# FOOTER
# ══════════════════════════════════════════════════════
st.markdown("""
<div style='text-align:center;padding:20px 0 8px;color:#1e3a5f;font-size:0.75rem'>
    Path'Ora - Coding Camp 2026 powered by DBS Foundation - Tim CC26-PSU344 -
    Dataset: Kaggle Resume Dataset
</div>
""", unsafe_allow_html=True)