import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../../components/layout/AppLayout";
import {
  AlertTriangle,
  CheckCircle,
  LoaderCircle,
  Upload,
  X,
} from "lucide-react";
import { useCVUpload } from "../../hooks/useCVUpload";
import { useAnalysis } from "../../hooks/useAnalysis";

const UploadPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedCvId, setUploadedCvId] = useState<string | null>(null);
  const [analysisFailed, setAnalysisFailed] = useState(false);
  const [isFeedbackOpen, setFeedbackOpen] = useState(false);
  const [fileInputKey, setFileInputKey] = useState(0);
  const { uploadCV, isLoading, progress, error } = useCVUpload();
  const { analyzeCV, isAnalyzing, error: analyzeError } = useAnalysis();

  const runAnalysis = async (cvId: string) => {
    setAnalysisFailed(false);
    setFeedbackOpen(true);
    const analysisResult = await analyzeCV(cvId);

    if (analysisResult?.id) {
      navigate(`/analysis/${analysisResult.id}`);
      return;
    }

    setAnalysisFailed(true);
  };

  const resetUploadFlow = () => {
    setSelectedFile(null);
    setUploadedCvId(null);
    setAnalysisFailed(false);
    setFeedbackOpen(false);
    setFileInputKey((current) => current + 1);
    navigate("/upload", { replace: true });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setUploadedCvId(null);
    setAnalysisFailed(false);
    setFeedbackOpen(false);

    const uploadResult = await uploadCV({
      source_type: "file",
      file,
    });

    if (!uploadResult) return;

    setUploadedCvId(uploadResult.id);
    setFeedbackOpen(true);
    await runAnalysis(uploadResult.id);
  };

  const isProcessing = isLoading || isAnalyzing;
  const errorMessage = error || analyzeError;
  const showFeedbackModal =
    isFeedbackOpen && (!!errorMessage || (!!uploadedCvId && !error));
  const isAnalyzeError = analysisFailed && !!uploadedCvId;
  const feedbackTitle = errorMessage
    ? isAnalyzeError
      ? "Analisis AI gagal diproses"
      : "Upload CV gagal"
    : isAnalyzing
      ? "Analisis CV sedang berjalan"
      : "CV berhasil diunggah";
  const feedbackMessage = errorMessage
    ? errorMessage
    : isAnalyzing
      ? "Sistem sedang membaca CV, mengekstrak skill, dan menghitung rekomendasi karir. Proses ini dapat memakan waktu beberapa saat."
      : analysisFailed
        ? "File sudah tersimpan, tetapi analisis gagal. Silakan upload file lagi untuk memulai analisis baru."
        : "CV sudah tersimpan dan hasil analisis siap ditampilkan.";

  return (
    <AppLayout>
      {/* Header - Menggunakan padding responsif pengganti ml-10 */}
      <div className="mb-6 md:mb-7 px-4 md:px-10 mt-4 md:mt-0">
        <h1 className="text-2xl md:text-3xl font-bold font-['Newsreader'] text-gray-900">
          Upload Curriculum Vitae
        </h1>
        <p className="text-gray-600 mt-2 text-sm font-['Manrope',_sans-serif]">
          Kirimkan riwayat profesional Anda untuk memulai analisis mendalam.
          Sistem kami menguraikan pengalaman Anda menjadi informasi karier yang
          dapat ditindaklanjuti.
        </p>
      </div>

      {/* Container utama dibungkus padding agar sejajar dengan header di mobile */}
      <div className="px-4 md:px-10 pb-8">
        <div className="w-full max-w-2xl mx-auto p-6 md:p-10 bg-white rounded-3xl border border-gray-200 font-['Newsreader']">
          <label
            htmlFor="file-upload"
            className="border border-dashed border-gray-400 rounded-3xl min-h-[280px] md:h-[340px] p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition text-center"
          >
            {/* Ikon diperkecil sedikit di mobile */}
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gray-200 flex items-center justify-center mb-6 md:mb-8">
              <Upload className="w-6 h-6 md:w-8 md:h-8" />
            </div>

            <h2 className="text-2xl md:text-3xl mb-3 text-[#102619]">Drag & Drop your document</h2>
            <p className="text-gray-500 text-sm md:text-base max-w-md mb-6 md:mb-8">
              Supported formats: PDF, DOC, DOCX up to 10MB. Ensure your document
              is unlocked for optimal extraction.
            </p>

            <span className="bg-[#061B0E] text-white px-6 md:px-8 py-3 rounded-lg text-sm md:text-base font-medium">
              BROWSE FILES
            </span>

            <input
              key={fileInputKey}
              id="file-upload"
              type="file"
              accept=".pdf,.doc,.docx"
              className="hidden"
              disabled={isProcessing}
              onChange={handleFileChange}
            />
          </label>

          {selectedFile && (
            <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-xs md:text-sm text-gray-500 mb-1">File Dipilih</p>
              <p className="font-medium text-sm md:text-base text-[#102619] truncate">{selectedFile.name}</p>
            </div>
          )}

          {isProcessing && (
            <div className="mt-6">
              <div className="h-2 md:h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#102619] transition-all duration-300"
                  style={{ width: `${isAnalyzing ? 100 : progress}%` }}
                />
              </div>
              <p className="text-xs md:text-sm text-gray-600 mt-2 font-['Manrope',_sans-serif]">
                {isAnalyzing
                  ? "Menganalisis CV..."
                  : `Uploading... ${progress}%`}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Feedback (Sudah cukup responsif, hanya memastikan padding aman di layar kecil) */}
      {showFeedbackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <button
              type="button"
              onClick={() => setFeedbackOpen(false)}
              disabled={isAnalyzing}
              className="absolute right-4 top-4 rounded-full p-1 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Tutup pesan"
            >
              <X size={18} />
            </button>

            <div
              className={`mb-4 flex h-12 w-12 items-center justify-center rounded-full ${
                errorMessage
                  ? "bg-red-100"
                  : isAnalyzing
                    ? "bg-[#E8F5EA]"
                    : "bg-green-100"
              }`}
            >
              {errorMessage ? (
                <AlertTriangle className="h-6 w-6 text-red-600" />
              ) : isAnalyzing ? (
                <LoaderCircle className="h-7 w-7 animate-spin text-[#102619]" />
              ) : (
                <CheckCircle className="h-6 w-6 text-green-700" />
              )}
            </div>

            <h2
              className={`pr-8 text-xl md:text-2xl font-semibold font-['Newsreader'] ${
                errorMessage ? "text-red-700" : "text-[#102619]"
              }`}
            >
              {feedbackTitle}
            </h2>
            <p className="mt-3 text-sm leading-6 text-gray-600 font-['Manrope',_sans-serif]">
              {feedbackMessage}
            </p>

            {isAnalyzing && (
              <div className="mt-5">
                <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                  <div className="h-full w-2/3 animate-pulse rounded-full bg-[#102619]" />
                </div>
                <div className="mt-4 grid grid-cols-1 gap-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#102619]" />
                    Membaca isi CV
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#102619]" />
                    Mengekstrak skill dan pengalaman
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#102619]" />
                    Menyusun prediksi karir
                  </div>
                </div>
              </div>
            )}

            {isAnalyzeError && (
              <button
                type="button"
                onClick={resetUploadFlow}
                disabled={isAnalyzing}
                className="mt-5 w-full md:w-auto inline-flex justify-center items-center gap-2 rounded-lg bg-[#102619] px-4 py-2 text-sm font-medium text-white hover:bg-[#1a3a26] transition disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Upload size={16} />
                Upload File Lagi
              </button>
            )}
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default UploadPage;
