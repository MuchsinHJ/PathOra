import { Link } from "react-router-dom";
import { Route, ScanLine, Upload } from "lucide-react";
import logo from "../../images/logo.png";

/**
 * LandingPage
 * Mengikuti bahasa visual dashboard: bg #F4F9F4, aksen hijau #CFE9D3,
 * hijau gelap #0A2012/#102619, heading Newsreader, body Manrope.
 * Struktur: hero -> cara kerja (3 langkah sesuai alur nyata produk) -> CTA.
 * Tanpa statistik/testimoni/FAQ palsu (R-17, R-18, R-28).
 */
export default function LandingPage() {
    return (
        <div className="min-h-screen flex flex-col bg-[#F4F9F4] text-gray-900 font-['Manrope',_sans-serif]">
            {/* Header hijau gelap: kontras dengan bg putih hero, fixed agar selalu terlihat */}
            <header className="fixed top-0 inset-x-0 z-40 bg-[#0A2012] border-b border-[#1a3a26]">
                <div className="max-w-6xl mx-auto flex items-center justify-between px-4 md:px-10 py-4">
                    <div className="flex items-center gap-3">
                        <img src={logo} alt="Path'Ora Logo" className="w-9 h-9" />
                        <h1 className="text-2xl font-['Newsreader'] text-white">
                            Path'Ora
                        </h1>
                    </div>
                    <nav className="flex items-center gap-2 md:gap-4">
                        <Link
                            to="/login"
                            className="text-sm font-medium text-gray-200 hover:text-white px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
                        >
                            Login
                        </Link>
                        <Link
                            to="/register"
                            className="text-sm font-semibold bg-white text-[#0A2012] px-4 py-2 rounded-lg hover:bg-[#CFE9D3] transition-colors"
                        >
                            Daftar
                        </Link>
                    </nav>
                </div>
            </header>

            <main className="flex-1 pt-[72px]">
                {/* Hero: fokus pada satu CTA utama */}
                <section className="max-w-6xl mx-auto px-4 md:px-10 pt-14 md:pt-24 pb-16 md:pb-24">
                    <div className="max-w-2xl">
                        <h2 className="text-4xl md:text-5xl font-bold font-['Newsreader'] text-gray-900 leading-tight">
                            Ukur kesiapan kerja Anda, temukan jalur karir yang tepat.
                        </h2>
                        <p className="text-gray-600 mt-5 text-base md:text-lg leading-relaxed">
                            Unggah CV, Path'Ora menganalisis skill Anda, lalu
                            menyusun rekomendasi jalur karir beserta skill yang
                            perlu ditambahkan.
                        </p>
                        <div className="mt-8 flex flex-col sm:flex-row gap-3">
                            <Link
                                to="/register"
                                className="inline-flex justify-center items-center bg-[#0A2012] text-white px-6 py-3 rounded-lg text-sm font-semibold hover:bg-[#1a3a26] transition-colors"
                            >
                                Mulai Analisis CV
                            </Link>
                            <Link
                                to="/login"
                                className="inline-flex justify-center items-center border border-[#0A2012] text-[#0A2012] px-6 py-3 rounded-lg text-sm font-semibold hover:bg-[#CFE9D3] transition-colors"
                            >
                                Masuk
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Cara kerja: tiga langkah sesuai alur nyata produk (R-05) */}
                <section className="border-t border-gray-200 bg-white">
                    <div className="max-w-6xl mx-auto px-4 md:px-10 py-14 md:py-20">
                        <h3 className="text-2xl md:text-3xl font-bold font-['Newsreader'] text-gray-900">
                            Cara kerjanya
                        </h3>
                        <div className="mt-8 md:mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Langkah 1: unggah, ditonjolkan sebagai kartu gelap (fokus alur) */}
                            <div className="bg-[#0A2012] text-white rounded-2xl p-6">
                                <Upload size={22} className="text-[#CFE9D3]" />
                                <p className="mt-4 text-sm font-semibold text-[#CFE9D3]">Langkah 1</p>
                                <h4 className="mt-1 text-lg font-bold font-['Newsreader']">
                                    Unggah CV
                                </h4>
                                <p className="mt-2 text-sm text-gray-300 leading-relaxed">
                                    Kirim CV berformat PDF, DOC, atau DOCX, atau
                                    tempel teks CV Anda langsung.
                                </p>
                            </div>

                            <div className="rounded-2xl p-6 border border-gray-200">
                                <ScanLine size={22} className="text-[#0A2012]" />
                                <p className="mt-4 text-sm font-semibold text-gray-500">Langkah 2</p>
                                <h4 className="mt-1 text-lg font-bold font-['Newsreader'] text-gray-900">
                                    Analisis otomatis
                                </h4>
                                <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                                    Sistem membaca CV, mengekstrak skill, dan
                                    menghitung skor kesiapan kerja Anda.
                                </p>
                            </div>

                            <div className="rounded-2xl p-6 border border-gray-200">
                                <Route size={22} className="text-[#0A2012]" />
                                <p className="mt-4 text-sm font-semibold text-gray-500">Langkah 3</p>
                                <h4 className="mt-1 text-lg font-bold font-['Newsreader'] text-gray-900">
                                    Rekomendasi karir
                                </h4>
                                <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                                    Dapatkan jalur karir yang cocok beserta skill
                                    yang sesuai dan yang perlu ditambahkan.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA penutup */}
                <section className="max-w-6xl mx-auto px-4 md:px-10 py-14 md:py-20">
                    <div className="rounded-2xl bg-[#CFE9D3] p-8 md:p-12 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                        <div>
                            <h3 className="text-2xl md:text-3xl font-bold font-['Newsreader'] text-[#0A2012]">
                                Siap mengukur kesiapan kerja Anda?
                            </h3>
                            <p className="text-sm text-[#0A2012]/70 mt-2 max-w-lg">
                                Buat akun gratis dan mulai dari CV pertama Anda.
                            </p>
                        </div>
                        <Link
                            to="/register"
                            className="inline-flex justify-center items-center shrink-0 bg-[#0A2012] text-white px-6 py-3 rounded-lg text-sm font-semibold hover:bg-[#1a3a26] transition-colors"
                        >
                            Daftar Sekarang
                        </Link>
                    </div>
                </section>
            </main>

            {/* Footer mengikuti gaya FooterLayout aplikasi */}
            <footer className="border-t border-gray-200 bg-[#F4F9F4] px-4 py-4 md:px-10">
                <p className="max-w-6xl mx-auto text-xs text-gray-600 text-center">
                    &copy; {new Date().getFullYear()} Path'Ora. All rights reserved.
                </p>
            </footer>
        </div>
    );
}
