import React from 'react';
import { X, FileText, CheckCircle2, ShieldCheck, Sparkles, BookCheck } from 'lucide-react';
import { OFFICIAL_GUIDELINES } from '../data/guidelinesData';

interface GuidelinesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GuidelinesModal: React.FC<GuidelinesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-4xl text-slate-800 shadow-2xl overflow-hidden my-6 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900">Kho Văn Bản & Chuẩn Giáo Dục (GDPT 2018)</h3>
              <p className="text-xs text-slate-500">
                Tóm tắt quy định Công văn 5512/BGDĐT-GDTrH (THCS & THPT), Khung Năng lực số & Định hướng STEM
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {OFFICIAL_GUIDELINES.map((doc) => (
            <div key={doc.id} className="p-5 bg-slate-50 border border-slate-200 rounded-2xl">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <span className="px-2.5 py-1 text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg">
                    {doc.code}
                  </span>
                  <h4 className="font-bold text-base text-slate-900 mt-2">{doc.title}</h4>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">Cơ quan ban hành: {doc.issuedBy}</p>
                </div>
              </div>

              <p className="text-xs text-slate-700 italic mb-3 bg-white p-2.5 rounded-xl border border-slate-200 font-medium">
                {doc.summary}
              </p>

              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">Cấu trúc & Điểm cốt lõi:</p>
                <ul className="space-y-1.5">
                  {doc.keyPoints.map((pt, idx) => (
                    <li key={idx} className="flex items-start space-x-2 text-xs text-slate-700 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
