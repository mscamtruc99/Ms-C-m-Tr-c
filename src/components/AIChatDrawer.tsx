import React, { useState } from 'react';
import { X, Send, Sparkles, RefreshCw, Zap, MessageSquare } from 'lucide-react';
import { LessonPlan } from '../types';

interface AIChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan: LessonPlan;
  onUpdatePlan: (updatedPlan: LessonPlan) => void;
}

export const AIChatDrawer: React.FC<AIChatDrawerProps> = ({
  isOpen,
  onClose,
  currentPlan,
  onUpdatePlan,
}) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; text: string }[]>([
    {
      role: 'assistant',
      text: `Xin chào Thầy/Cô! Em là Trợ lý AI chuyên tinh chỉnh Kế hoạch bài dạy. Thầy/Cô muốn điều chỉnh gì ở bài giảng "${currentPlan.generalInfo?.lessonTitle}"?`,
    },
  ]);
  const [input, setInput] = useState('');
  const [isRefining, setIsRefining] = useState(false);

  if (!isOpen) return null;

  const quickPrompts = [
    'Tăng mức độ STEM thành Dự án',
    'Thêm câu hỏi phản biện AI vào Hoạt động 2',
    'Chuyển bài giảng thành 1 tiết (45 phút)',
    'Thêm trò chơi Kahoot vào Hoạt động Khởi động',
    'Thêm phiếu tự đánh giá cho học sinh',
  ];

  const handleSend = async (customInstruction?: string) => {
    const textToSend = customInstruction || input;
    if (!textToSend.trim() || isRefining) return;

    const userMsg = textToSend.trim();
    if (!customInstruction) setInput('');

    setMessages((prev) => [...prev, { role: 'user', text: userMsg }]);
    setIsRefining(true);

    try {
      const res = await fetch('/api/khbd/refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPlan, instruction: userMsg }),
      });
      const data = await res.json();

      if (data.success && data.plan) {
        onUpdatePlan(data.plan);
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            text: `✅ Đã cập nhật thành công Kế hoạch bài dạy (Phiên bản v${data.plan.version})! Thầy/Cô có thể kiểm tra nội dung mới ở các tab tương ứng.`,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            text: `❌ Lỗi: ${data.error || 'Không thể điều chỉnh bài giảng.'}`,
          },
        ]);
      }
    } catch (e: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: `❌ Đã xảy ra lỗi kết nối: ${e.message}`,
        },
      ]);
    } finally {
      setIsRefining(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-white border-l border-slate-200 shadow-2xl flex flex-col">
      {/* Drawer Header */}
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600 border border-rose-200">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900">Trợ Lý Tinh Chỉnh AI</h3>
            <p className="text-[10px] text-slate-500 font-medium">Điều chỉnh KHBD thời gian thực theo yêu cầu</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Quick Prompt Suggestions */}
      <div className="p-3 bg-slate-50/50 border-b border-slate-200 space-y-1.5">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Gợi ý điều chỉnh nhanh:</p>
        <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
          {quickPrompts.map((qp, idx) => (
            <button
              key={idx}
              disabled={isRefining}
              onClick={() => handleSend(qp)}
              className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-[11px] font-semibold text-rose-700 border border-slate-200 hover:border-rose-300 transition-colors text-left truncate max-w-full"
            >
              + {qp}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/30">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed font-medium ${
                m.role === 'user'
                  ? 'bg-rose-600 text-white rounded-br-none shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-xs'
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}

        {isRefining && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 p-3 rounded-2xl text-xs text-rose-700 flex items-center space-x-2 shadow-xs">
              <RefreshCw className="w-4 h-4 animate-spin text-rose-600" />
              <span>AI đang cập nhật lại Kế hoạch bài dạy...</span>
            </div>
          </div>
        )}
      </div>

      {/* Chat Input */}
      <div className="p-3 bg-white border-t border-slate-200">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center space-x-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isRefining}
            placeholder="Nhập yêu cầu sửa giáo án..."
            className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-rose-500 font-medium"
          />
          <button
            type="submit"
            disabled={!input.trim() || isRefining}
            className="p-2 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white transition-colors shadow-xs"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
