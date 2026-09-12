import React from 'react';
import { X, Printer, Copy, Sparkles, CheckCircle, HelpCircle } from 'lucide-react';
import { StudentWorksheet } from '../types';

interface WorksheetGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  worksheet: StudentWorksheet | null;
  isLoading: boolean;
}

export const WorksheetGeneratorModal: React.FC<WorksheetGeneratorModalProps> = ({
  isOpen,
  onClose,
  worksheet,
  isLoading,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl text-slate-100 shadow-2xl overflow-hidden my-6 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-800/80 border-b border-slate-700/80 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">Phiếu Học Tập Số & Thử Thách AI</h3>
              <p className="text-xs text-slate-400">Tự động khởi tạo từ Kế hoạch bài dạy theo các mức độ Bloom</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {worksheet && (
              <button
                onClick={handlePrint}
                className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>In / Xuất PDF</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {isLoading ? (
            <div className="py-16 text-center space-y-4">
              <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-sm font-semibold text-purple-300">
                AI đang sinh Phiếu học tập số & Câu hỏi phân hóa Bloom...
              </p>
            </div>
          ) : worksheet ? (
            <div className="bg-white text-slate-900 p-8 rounded-2xl shadow-xl print:p-0 print:shadow-none space-y-6 font-sans">
              {/* Printable Title Header */}
              <div className="text-center border-b border-slate-200 pb-4">
                <h2 className="text-xl font-bold uppercase text-slate-900">{worksheet.title}</h2>
                <p className="text-xs text-slate-600 mt-1 font-medium">
                  Môn: {worksheet.subject} • {worksheet.grade} | Họ và tên học sinh: .................................................... Nhóm: ........
                </p>
              </div>

              {/* Sections */}
              {worksheet.sections?.map((sec, sIdx) => (
                <div key={sIdx} className="space-y-3">
                  <h3 className="font-bold text-sm text-purple-800 border-l-4 border-purple-600 pl-2">
                    {sec.sectionTitle}
                  </h3>
                  <p className="text-xs text-slate-600 italic">{sec.instructions}</p>

                  <div className="space-y-4 pt-1">
                    {sec.questions?.map((q, qIdx) => (
                      <div key={q.id || qIdx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                        <div className="flex items-start justify-between font-bold text-slate-800 mb-1.5">
                          <span>
                            Câu {qIdx + 1}: {q.question}
                          </span>
                          <span className="px-2 py-0.5 text-[10px] bg-purple-100 text-purple-700 rounded-md shrink-0 ml-2">
                            {q.bloomLevel}
                          </span>
                        </div>

                        {q.options && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 font-normal text-slate-700 pl-2">
                            {q.options.map((opt, oIdx) => (
                              <div key={oIdx} className="p-1.5 bg-white rounded-lg border border-slate-200">
                                {opt}
                              </div>
                            ))}
                          </div>
                        )}

                        {q.answerKey && (
                          <div className="mt-2 text-[11px] text-emerald-700 font-semibold bg-emerald-50 p-1.5 rounded-lg border border-emerald-200 print:hidden">
                            ✓ Đáp án / Gợi ý: {q.answerKey}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* AI Mini Challenge Box */}
              {worksheet.aiMiniChallenge && (
                <div className="p-4 bg-purple-50 border-2 border-purple-200 rounded-2xl text-xs space-y-2">
                  <div className="flex items-center space-x-2 text-purple-900 font-bold">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <span>THỬ THÁCH SỐ & PROMPT AI CHO HỌC SINH</span>
                  </div>
                  <p className="text-slate-700">
                    <strong>Nhiệm vụ:</strong> {worksheet.aiMiniChallenge.task}
                  </p>
                  <div className="p-2.5 bg-purple-900 text-purple-100 font-mono rounded-xl">
                    Prompt gợi ý: "{worksheet.aiMiniChallenge.suggestedPrompt}"
                  </div>
                  <p className="text-slate-700 italic">
                    <strong>Câu hỏi phản biện:</strong> {worksheet.aiMiniChallenge.reflectionQuestion}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 text-sm">
              Không tìm thấy phiếu học tập. Vui lòng bấm sinh lại.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
