import React, { useState } from 'react';
import { X, Copy, Check, Search, BookOpen, Sparkles, Tag } from 'lucide-react';
import { PROMPT_LIBRARY_ITEMS } from '../data/promptLibrary';
import { PromptItem } from '../types';

interface PromptLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUsePrompt?: (promptText: string) => void;
}

export const PromptLibraryModal: React.FC<PromptLibraryModalProps> = ({
  isOpen,
  onClose,
  onUsePrompt,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Tất cả');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const categories = ['Tất cả', ...Array.from(new Set(PROMPT_LIBRARY_ITEMS.map((p) => p.category)))];

  const filteredPrompts = PROMPT_LIBRARY_ITEMS.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.promptText.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Tất cả' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-4xl text-slate-800 shadow-2xl overflow-hidden my-6 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900">Thư Viện Prompt Mẫu Soạn Bài & Đánh Giá</h3>
              <p className="text-xs text-slate-500">
                Bộ mẫu Prompt tối ưu cho Giáo viên THCS (Tạo đề Bloom, Trò chơi Kahoot, Canva AI, Rubric...)
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

        {/* Filter Bar */}
        <div className="px-6 py-3 bg-slate-50/80 border-b border-slate-200 flex flex-col sm:flex-row gap-3 shrink-0">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm mẫu Prompt..."
              className="w-full pl-9 pr-4 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-amber-500 font-medium"
            />
          </div>

          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-thin">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs whitespace-nowrap font-semibold transition-colors ${
                  selectedCategory === cat
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Prompt List */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {filteredPrompts.map((item: PromptItem) => (
            <div
              key={item.id}
              className="p-4 bg-slate-50 border border-slate-200 hover:border-amber-400 rounded-2xl transition-all"
            >
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 rounded-md">
                      {item.category}
                    </span>
                    <h4 className="font-bold text-sm text-slate-900">{item.title}</h4>
                  </div>
                  <p className="text-xs text-slate-600 font-medium">{item.description}</p>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => handleCopy(item.id, item.promptText)}
                    className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                  >
                    {copiedId === item.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Đã sao chép</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Sao chép</span>
                      </>
                    )}
                  </button>

                  {onUsePrompt && (
                    <button
                      onClick={() => {
                        onUsePrompt(item.promptText);
                        onClose();
                      }}
                      className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center space-x-1 transition-colors shadow-xs"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                      <span>Áp dụng ngay</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Prompt Text Box */}
              <div className="p-3 bg-white border border-slate-200 rounded-xl font-mono text-xs text-slate-800 whitespace-pre-wrap leading-relaxed select-all">
                {item.promptText}
              </div>

              {/* Tags */}
              <div className="mt-2.5 flex items-center space-x-1.5">
                <Tag className="w-3 h-3 text-slate-400" />
                {item.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 text-[10px] bg-slate-100 text-slate-600 rounded-md border border-slate-200 font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
