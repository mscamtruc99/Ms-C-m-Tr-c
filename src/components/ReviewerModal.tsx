import React from 'react';
import { X, Award, CheckCircle2, AlertTriangle, Sparkles, TrendingUp } from 'lucide-react';
import { ReviewScore } from '../types';

interface ReviewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  reviewScore: ReviewScore | null;
  isLoading: boolean;
}

export const ReviewerModal: React.FC<ReviewerModalProps> = ({
  isOpen,
  onClose,
  reviewScore,
  isLoading,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl text-slate-100 shadow-2xl overflow-hidden my-6 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-800/80 border-b border-slate-700/80 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">Hội Đồng Phản Biện & Đánh Giá KHBD AI</h3>
              <p className="text-xs text-slate-400">
                Chấm điểm tuân thủ CV 5512, Khung Năng lực số, AI Literacy & STEM
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {isLoading ? (
            <div className="py-16 text-center space-y-4">
              <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-sm font-semibold text-cyan-300">
                Hội đồng AI đang đối chiếu Công văn 5512 & Khung Năng lực số...
              </p>
            </div>
          ) : reviewScore ? (
            <div className="space-y-6">
              {/* Score Header Banner */}
              <div className="p-6 bg-gradient-to-r from-slate-800 via-slate-850 to-indigo-950 border border-slate-700 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
                <div>
                  <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">KẾT QUẢ KIỂM ĐỊNH CHUYÊN MÔN</span>
                  <h3 className="text-xl font-extrabold text-white mt-1">Đánh giá Chất lượng Kế hoạch Bài dạy</h3>
                  <p className="text-xs text-slate-300 mt-1">Dựa trên tiêu chuẩn GDPT 2018 và hướng dẫn tích hợp công nghệ mới nhất.</p>
                </div>

                <div className="flex items-center space-x-3 shrink-0">
                  <div className="w-20 h-20 rounded-2xl bg-slate-900/90 border-2 border-cyan-500/50 flex flex-col items-center justify-center shadow-lg shadow-cyan-500/10">
                    <span className="text-2xl font-black text-cyan-400">{reviewScore.overallScore}</span>
                    <span className="text-[10px] text-slate-400 font-bold">/ 100 ĐIỂM</span>
                  </div>
                </div>
              </div>

              {/* Grid Assessment */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-800/60 border border-slate-700/80 rounded-2xl space-y-1">
                  <div className="flex items-center space-x-2 text-blue-400 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Tuân thủ Công văn 5512/BGDĐT-GDTrH</span>
                  </div>
                  <p className="text-xs text-slate-300">{reviewScore.compliance5512}</p>
                </div>

                <div className="p-4 bg-slate-800/60 border border-slate-700/80 rounded-2xl space-y-1">
                  <div className="flex items-center space-x-2 text-purple-400 font-bold text-xs">
                    <Sparkles className="w-4 h-4" />
                    <span>Độ sâu Trí tuệ nhân tạo (AI Literacy)</span>
                  </div>
                  <p className="text-xs text-slate-300">{reviewScore.aiRating}</p>
                </div>

                <div className="p-4 bg-slate-800/60 border border-slate-700/80 rounded-2xl space-y-1">
                  <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs">
                    <TrendingUp className="w-4 h-4" />
                    <span>Chất lượng Tích hợp STEM / STEAM</span>
                  </div>
                  <p className="text-xs text-slate-300">{reviewScore.stemRating}</p>
                </div>

                <div className="p-4 bg-slate-800/60 border border-slate-700/80 rounded-2xl space-y-1">
                  <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs">
                    <Award className="w-4 h-4" />
                    <span>Đáp ứng Khung Năng lực số</span>
                  </div>
                  <p className="text-xs text-slate-300">{reviewScore.digitalCompRating}</p>
                </div>
              </div>

              {/* Suggestions */}
              {reviewScore.suggestions && reviewScore.suggestions.length > 0 && (
                <div className="p-5 bg-amber-500/10 border border-amber-500/30 rounded-2xl space-y-3">
                  <div className="flex items-center space-x-2 text-amber-300 font-bold text-sm">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span>Gợi Ý Khuyên Dùng Để Nâng Cấp Giáo Án Lên Xuất Sắc:</span>
                  </div>
                  <ul className="space-y-2">
                    {reviewScore.suggestions.map((sug, idx) => (
                      <li key={idx} className="flex items-start space-x-2 text-xs text-slate-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0"></span>
                        <span>{sug}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 text-sm">
              Chưa có dữ liệu phản biện.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
