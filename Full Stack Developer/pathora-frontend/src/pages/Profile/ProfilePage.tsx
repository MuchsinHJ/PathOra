import React from "react";
import AppLayout from "../../components/layout/AppLayout";
import { useProfile } from "../../hooks/useProfile";

const ProfilePage: React.FC = () => {
  const { user, analyses, isLoading, error } = useProfile();

  if (isLoading) {
    return (
      <AppLayout>
        <div className="p-6 md:p-10 text-gray-600">Loading profile...</div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div className="p-6 md:p-10 text-red-500">{error}</div>
      </AppLayout>
    );
  }

  const averageConfidence =
    analyses.length > 0
      ? Math.round(
          (analyses.reduce((acc, analysis) => acc + analysis.confidence, 0) /
            analyses.length) *
            100,
        )
      : 0;

  return (
    <AppLayout>
      {/* Container utama: Padding px-4 untuk mobile, px-10 untuk desktop */}
      <div className="min-h-screen bg-[#F7F6F2] px-4 md:px-10 pt-4 md:pt-0 pb-8 font-['Newsreader']">
        <div className="mb-6 md:mb-8">
          <h1 className="text-3xl md:text-5xl font-bold font-['Newsreader'] text-gray-900">
            Profile
          </h1>
        </div>

        <div className="max-w-7xl mx-auto md:px-10">
          {/* Card Profil User */}
          <div className="bg-white rounded-xl p-6 md:p-8 shadow-sm mb-8 md:mb-20">
            {/* Flex-col untuk mobile (menumpuk tengah), Flex-row untuk desktop (menyamping) */}
            <div className="flex flex-col md:flex-row items-center text-center md:text-left gap-4 md:gap-8">
              {user?.profile_picture ? (
                <img
                  src={user.profile_picture}
                  alt={user.name}
                  className="w-24 h-24 rounded-full object-cover border border-gray-200 shadow-sm"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-[#102619] text-white flex items-center justify-center text-3xl font-bold shadow-sm">
                  {user?.name?.charAt(0).toUpperCase() ?? "P"}
                </div>
              )}

              <div className="mt-2 md:mt-0">
                <h2 className="font-['Newsreader'] text-2xl md:text-3xl font-bold text-[#102619]">
                  {user?.name}
                </h2>
                <p className="text-[#9A7A57] mt-1 md:mt-2 text-sm md:text-lg font-['Manrope',_sans-serif]">
                  {user?.email}
                </p>
                <p className="text-gray-400 mt-2 text-xs md:text-sm hidden md:block font-['Manrope',_sans-serif]">
                  Bergabung sejak{" "}
                  {user?.created_at
                    ? new Date(user.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    : "-"}
                </p>
              </div>
            </div>
          </div>

          {/* Section Riwayat Analisis */}
          <div className="bg-white rounded-xl shadow-sm p-4 md:p-7 mt-6 md:mt-10">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-['Newsreader'] text-xl md:text-2xl font-bold text-[#102619]">
                Analysis History
              </h2>
              {/* Teks "VIEW ALL ->" untuk mobile menyesuaikan gambar, atau Total Analisis untuk Desktop */}
              <div className="text-[10px] md:text-sm font-bold uppercase tracking-widest text-gray-500 font-['Manrope',_sans-serif]">
                <span className="hidden md:inline">Total Analisis: {analyses.length}</span>
                <span className="md:hidden flex items-center gap-1 cursor-pointer">View All &rarr;</span>
              </div>
            </div>

            {analyses.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 font-['Manrope',_sans-serif] text-sm">Belum ada riwayat analisis.</p>
              </div>
            ) : (
              <>
                {/* --- 1. TAMPILAN MOBILE (Card View) --- */}
                {/* Menyesuaikan persis dengan gambar, disembunyikan di layar besar (md:hidden) */}
                <div className="grid grid-cols-1 gap-4 md:hidden font-['Manrope',_sans-serif]">
                  {analyses.map((analysis) => (
                    <div key={analysis.id} className="bg-[#F9FAFB] rounded-2xl p-5 flex flex-col gap-4">
                      {/* Baris Atas: Tanggal & Status */}
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                          {analysis.created_at
                            ? new Date(analysis.created_at).toLocaleDateString("en-US", {
                                month: "short",
                                day: "2-digit",
                                year: "numeric",
                              })
                            : "-"}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-[9px] font-bold tracking-widest uppercase ${
                            analysis.status === "success" 
                              ? "bg-[#E3F0E6] text-[#2F6B43]"
                              : "bg-[#EAEAEA] text-[#555555]"
                          }`}
                        >
                          {analysis.status}
                        </span>
                      </div>

                      {/* Baris Bawah: Target Role & Skor */}
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mb-1">
                            Target Role
                          </p>
                          <p className="font-bold text-[#102619] text-sm">
                            {analysis.predicted_category}
                          </p>
                        </div>
                        <div className="font-['Newsreader'] text-3xl font-bold text-[#102619] leading-none">
                          {Math.round(analysis.confidence * 100)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* --- 2. TAMPILAN TABLET & DESKTOP (Table View) --- */}
                {/* Disembunyikan di mobile (hidden md:block) */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-t border-b border-gray-200">
                        <th className="py-4 text-left text-xs uppercase tracking-widest text-gray-500 font-medium font-['Manrope',_sans-serif]">
                          Date
                        </th>
                        <th className="py-4 text-left text-xs uppercase tracking-widest text-gray-500 font-medium font-['Manrope',_sans-serif]">
                          Target Role
                        </th>
                        <th className="py-4 text-center text-xs uppercase tracking-widest text-gray-500 font-medium font-['Manrope',_sans-serif]">
                          Score
                        </th>
                        <th className="py-4 text-right text-xs uppercase tracking-widest text-gray-500 font-medium font-['Manrope',_sans-serif]">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {analyses.map((analysis) => (
                        <tr
                          key={analysis.id}
                          className="border-b border-gray-100 hover:bg-gray-50"
                        >
                          <td className="py-4 text-gray-700 font-['Manrope',_sans-serif] text-sm">
                            {analysis.created_at
                              ? new Date(analysis.created_at).toLocaleDateString("id-ID")
                              : "-"}
                          </td>
                          <td className="py-4 text-gray-900 font-medium font-['Manrope',_sans-serif] text-sm">
                            {analysis.predicted_category}
                          </td>
                          <td className="py-4 text-center">
                            <span className="font-['Newsreader'] text-2xl font-bold text-[#102619]">
                              {Math.round(analysis.confidence * 100)}
                            </span>
                          </td>
                          <td className="py-4 text-right">
                            <span
                              className={`px-4 py-2 rounded-full text-xs font-bold tracking-wider uppercase font-['Manrope',_sans-serif] ${
                                analysis.status === "success"
                                  ? "bg-green-100 text-green-900"
                                  : analysis.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-gray-200 text-gray-700"
                              }`}
                            >
                              {analysis.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* Bagian Rata-Rata */}
            {analyses.length > 0 && (
              <div className="mt-8 flex justify-center md:justify-end">
                <div className="bg-[#F7F6F2] rounded-xl px-6 py-4 w-full md:w-auto text-center md:text-left border border-gray-100">
                  <p className="text-xs md:text-sm text-gray-500 font-bold uppercase tracking-wider font-['Manrope',_sans-serif]">
                    Rata-rata Confidence
                  </p>
                  <p className="text-3xl font-bold font-['Newsreader'] text-[#102619] mt-1">
                    {averageConfidence}%
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default ProfilePage;