import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import AppLayout from "../../components/layout/AppLayout";
import JobRecommendationCard from "./Job";
import { useCareerRecs } from "../../hooks/useCareerRecs";
import { analysisService } from "../../services/analysis.service";
import { Analysis } from "../../types/analysis";
import { parseApiError } from "../../utils/error";
import { ChevronLeft, ChevronRight } from "lucide-react";

const CareerRecommendationsPage: React.FC = () => {
  const { analysisId } = useParams<{ analysisId: string }>();
  const detailState = useCareerRecs(analysisId);
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isListLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const isDetailMode = !!analysisId;
  const analysis = isDetailMode
    ? detailState.analysis
    : analyses[currentIndex] ?? null;
  const isLoading = isDetailMode ? detailState.isLoading : isListLoading;
  const recommendations = analysis?.result?.career_recommendations ?? [];
  const fallbackMatchedSkills = analysis?.result?.matched_skills ?? [];
  const fallbackMissingSkills = analysis?.result?.missing_skills ?? [];
  const error = isDetailMode ? detailState.error : listError;
  const totalAnalyses = analyses.length;

  useEffect(() => {
    if (isDetailMode) return;

    const fetchAnalyses = async () => {
      setListLoading(true);
      setListError(null);

      try {
        const result = await analysisService.getAllAnalyses();
        setAnalyses(result);
        setCurrentIndex(0);
      } catch (error) {
        setListError(parseApiError(error));
      } finally {
        setListLoading(false);
      }
    };

    fetchAnalyses();
  }, [isDetailMode]);

  const goToPrevious = () => {
    setCurrentIndex((current) => Math.max(current - 1, 0));
  };

  const goToNext = () => {
    setCurrentIndex((current) => Math.min(current + 1, totalAnalyses - 1));
  };

  return (
    <AppLayout>
      {/* Container utama: Padding px-4 untuk mobile, px-10 untuk desktop */}
      <div className="min-h-screen bg-[#F4F9F4] px-4 md:px-10 pt-4 md:pt-0 pb-8 font-['Newsreader']">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="mb-6 md:mb-7">
            <h1 className="text-3xl md:text-4xl font-bold font-['Newsreader'] text-gray-900 leading-tight">
              Rekomendasi Karir
            </h1>
            <p className="text-gray-500 mt-3 md:mt-2 text-[13px] md:text-sm font-['Manrope',_sans-serif] leading-relaxed">
              {isDetailMode
                ? "Berikut rekomendasi karir berdasarkan hasil analisis CV yang Anda pilih."
                : "Berdasarkan analisis keterampilan dan latar belakang profesional Anda baru-baru ini, kami telah menyusun jalur karir berpotensi tinggi yang disesuaikan dengan profil unik Anda."}
            </p>
          </div>

          {isLoading && (
            <div className="bg-white rounded-2xl p-8 text-center shadow-sm text-gray-600 font-['Manrope',_sans-serif]">
              Memuat rekomendasi karir...
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-red-600 font-['Manrope',_sans-serif]">
              {error}
            </div>
          )}

          {!isLoading && !error && analysis && (
            <div className="bg-white rounded-2xl p-5 md:p-6 shadow-sm mb-6 font-['Manrope',_sans-serif]">
              <h2 className="text-lg md:text-xl font-bold text-[#102619]">
                Hasil Analisis Utama
              </h2>

              <div className="mt-4 flex flex-col gap-3 md:gap-2">
                <div>
                  <span className="text-gray-500 text-xs md:text-sm font-semibold uppercase tracking-wider">Kategori Karir</span>
                  <p className="text-base md:text-lg font-bold text-[#102619] mt-0.5">
                    {analysis.predicted_category}
                  </p>
                </div>

                <div>
                  <span className="text-gray-500 text-xs md:text-sm font-semibold uppercase tracking-wider">
                    Confidence Score
                  </span>
                  <p className="text-base md:text-lg font-bold text-[#A27A53] mt-0.5 font-['Newsreader']">
                    {(analysis.confidence * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Pagination Section (Responsif) */}
          {!isDetailMode && !isLoading && !error && totalAnalyses > 0 && (
            <div className="mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 rounded-2xl bg-white px-5 py-4 shadow-sm font-['Manrope',_sans-serif]">
              <div>
                <p className="text-sm font-bold text-[#102619]">
                  CV {currentIndex + 1} dari {totalAnalyses}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {analysis?.created_at
                    ? new Date(analysis.created_at).toLocaleDateString("id-ID")
                    : "Tanggal analisis tidak tersedia"}
                </p>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <button
                  type="button"
                  onClick={goToPrevious}
                  disabled={currentIndex === 0}
                  className="flex-1 md:flex-none justify-center inline-flex items-center gap-2 rounded-lg border border-[#102619] px-4 py-2 text-sm font-semibold text-[#102619] hover:bg-[#102619] hover:text-white disabled:cursor-not-allowed disabled:opacity-40 transition-colors"
                >
                  <ChevronLeft size={16} />
                  Sebelumnya
                </button>
                <button
                  type="button"
                  onClick={goToNext}
                  disabled={currentIndex >= totalAnalyses - 1}
                  className="flex-1 md:flex-none justify-center inline-flex items-center gap-2 rounded-lg border border-[#102619] px-4 py-2 text-sm font-semibold text-[#102619] hover:bg-[#102619] hover:text-white disabled:cursor-not-allowed disabled:opacity-40 transition-colors"
                >
                  Berikutnya
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Render Recommendations List */}
          {!isLoading && !error && (
            <div className="space-y-4 md:space-y-6">
              {recommendations.length > 0 ? (
                recommendations.map((career, index) => (
                  <JobRecommendationCard
                    key={`${career.category}-${index}`}
                    job={{
                      id: index,
                      title: career.category,
                      category: career.description || career.category,
                      matchPercentage: Math.round(career.match_score * 100),
                      matchingSkills:
                        career.matched_skills?.length > 0
                          ? career.matched_skills
                          : fallbackMatchedSkills,
                      missingSkills:
                        career.missing_skills?.length > 0
                          ? career.missing_skills
                          : fallbackMissingSkills,
                    }}
                  />
                ))
              ) : (
                <div className="bg-white rounded-2xl p-8 text-center shadow-sm text-gray-500 font-['Manrope',_sans-serif]">
                  Tidak ada rekomendasi karir tersedia.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default CareerRecommendationsPage;