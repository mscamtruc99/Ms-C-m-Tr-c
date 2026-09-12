import React, { useState } from 'react';
import {
  FileText,
  Download,
  Printer,
  Sparkles,
  Award,
  BookOpen,
  Layers,
  Compass,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  ArrowLeft,
  Share2,
  Trash2,
  Cpu,
  CheckCircle2,
  HelpCircle,
  Laptop,
  Cloud,
  ExternalLink,
  Mail,
} from 'lucide-react';
import { LessonPlan, ReviewScore, StudentWorksheet } from '../types';
import { exportLessonPlanToDocx } from '../utils/docxExporter';
import { getPlanTeacherDisplay } from '../utils/teacherUtils';
import { uploadLessonPlanToGoogleDrive, signInWithGoogleDrive, isDriveConnected } from '../services/googleDriveService';
import { AIChatDrawer } from './AIChatDrawer';
import { ReviewerModal } from './ReviewerModal';
import { WorksheetGeneratorModal } from './WorksheetGeneratorModal';

interface LessonPlanViewProps {
  plan: LessonPlan;
  onBack: () => void;
  onUpdatePlan: (updatedPlan: LessonPlan) => void;
  onDeletePlan: (id: string) => void;
  onClonePlan?: (plan: LessonPlan) => void;
  openGmail?: () => void;
  isJustCreated?: boolean;
}

export const LessonPlanView: React.FC<LessonPlanViewProps> = ({
  plan,
  onBack,
  onUpdatePlan,
  onDeletePlan,
  onClonePlan,
  openGmail,
  isJustCreated,
}) => {
  const [activeTab, setActiveTab] = useState<'5512' | 'ai_digcomp' | 'stem' | 'rubric'>('5512');
  const [isExportingDocx, setIsExportingDocx] = useState(false);
  const [copiedMd, setCopiedMd] = useState(false);
  const [isSavingDrive, setIsSavingDrive] = useState(false);
  const [driveSavedUrl, setDriveSavedUrl] = useState<string | null>(null);

  const handleSaveToDrive = async () => {
    setIsSavingDrive(true);
    try {
      if (!isDriveConnected()) {
        await signInWithGoogleDrive();
      }
      const uploaded = await uploadLessonPlanToGoogleDrive(plan);
      setDriveSavedUrl(uploaded.webViewLink);
      alert(`Đã lưu thành công bài dạy lên Google Drive!\n• Tên file: ${uploaded.name}\n• Thư mục: KHBD Chuẩn GDPT 2018`);
    } catch (err: any) {
      alert(`Lỗi lưu Google Drive: ${err.message}`);
    } finally {
      setIsSavingDrive(false);
    }
  };

  // Modals & Chat state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewScore, setReviewScore] = useState<ReviewScore | null>(plan.reviewScore || null);
  const [isReviewLoading, setIsReviewLoading] = useState(false);

  const [isWorksheetModalOpen, setIsWorksheetModalOpen] = useState(false);
  const [worksheet, setWorksheet] = useState<StudentWorksheet | null>(null);
  const [isWorksheetLoading, setIsWorksheetLoading] = useState(false);

  // Accordion state for activities
  const [openActivities, setOpenActivities] = useState<Record<string, boolean>>({
    'act-1': true,
    'act-2': true,
    'act-3': true,
    'act-4': true,
  });

  const toggleActivity = (id: string) => {
    setOpenActivities((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleExportDocx = async () => {
    try {
      setIsExportingDocx(true);
      await exportLessonPlanToDocx(plan);
    } catch (e: any) {
      alert(`Lỗi xuất file Word: ${e.message}`);
    } finally {
      setIsExportingDocx(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyMarkdown = () => {
    let md = `# KẾ HOẠCH BÀI DẠY (GIÁO ÁN)\n`;
    md += `## MÔN HỌC: ${plan.generalInfo.subject} - ${plan.generalInfo.grade}\n`;
    md += `### TÊN BÀI HỌC: ${plan.generalInfo.lessonTitle}\n`;
    md += `**Thời lượng:** ${plan.generalInfo.duration} | **Bộ sách:** ${plan.generalInfo.textbook}\n\n`;

    md += `### I. MỤC TIÊU BÀI HỌC\n`;
    md += `#### 1. Phẩm chất:\n` + plan.objectives.qualities.map((q) => `- ${q}`).join('\n') + '\n';
    md += `#### 2. Năng lực chung:\n` + plan.objectives.generalCompetencies.map((c) => `- ${c}`).join('\n') + '\n';
    md += `#### 3. Năng lực đặc thù:\n` + plan.objectives.subjectCompetencies.map((s) => `- ${s}`).join('\n') + '\n\n';

    md += `### II. TIẾN TRÌNH DẠY HỌC (Công văn 5512)\n`;
    plan.procedure.forEach((act) => {
      md += `#### ${act.typeLabel}: ${act.title}\n`;
      md += `- **Mục tiêu:** ${act.objectives}\n`;
      md += `- **Nội dung:** ${act.content}\n`;
      md += `- **Sản phẩm:** ${act.product}\n`;
      md += `- **Tổ chức thực hiện:**\n`;
      md += `  + Bước 1 (Chuyển giao): ${act.organization.step1_Transfer}\n`;
      md += `  + Bước 2 (Thực hiện): ${act.organization.step2_Perform}\n`;
      md += `  + Bước 3 (Báo cáo, thảo luận): ${act.organization.step3_Discuss}\n`;
      md += `  + Bước 4 (Kết luận): ${act.organization.step4_Conclude}\n\n`;
    });

    navigator.clipboard.writeText(md);
    setCopiedMd(true);
    setTimeout(() => setCopiedMd(false), 2000);
  };

  const handleRunReview = async () => {
    setIsReviewModalOpen(true);
    if (!reviewScore) {
      setIsReviewLoading(true);
      try {
        const res = await fetch('/api/khbd/review', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ plan }),
        });
        const data = await res.json();
        if (data.success && data.reviewScore) {
          setReviewScore(data.reviewScore);
          onUpdatePlan({ ...plan, reviewScore: data.reviewScore });
        }
      } catch (e) {
        console.error('Failed to run review:', e);
      } finally {
        setIsReviewLoading(false);
      }
    }
  };

  const handleGenerateWorksheet = async () => {
    setIsWorksheetModalOpen(true);
    if (!worksheet) {
      setIsWorksheetLoading(true);
      try {
        const res = await fetch('/api/khbd/generate-worksheet', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ plan }),
        });
        const data = await res.json();
        if (data.success && data.worksheet) {
          setWorksheet(data.worksheet);
        }
      } catch (e) {
        console.error('Failed to generate worksheet:', e);
      } finally {
        setIsWorksheetLoading(false);
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      {/* Navigation Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại Danh Sách</span>
        </button>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsChatOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-md border border-rose-500 transition-all"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Chỉnh Sửa Qua Chat AI</span>
          </button>

          <button
            onClick={handleRunReview}
            className="px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-cyan-700 border border-slate-200 text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-xs"
          >
            <Award className="w-4 h-4 text-cyan-600" />
            <span>Phản Biện AI</span>
          </button>

          <button
            onClick={handleGenerateWorksheet}
            className="px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-purple-700 border border-slate-200 text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-xs"
          >
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span>Sinh Phiếu Học Tập</span>
          </button>

          {onClonePlan && (
            <button
              onClick={() => onClonePlan(plan)}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center space-x-1.5 shadow-md transition-colors cursor-pointer"
              title="Sao chép bài học này vào danh sách giáo án của Thầy/Cô để tự do chỉnh sửa"
            >
              <Sparkles className="w-4 h-4 text-white" />
              <span>{plan.isSample ? 'Dùng Mẫu Này' : 'Nhân Bản KHBD'}</span>
            </button>
          )}

          <button
            onClick={handleExportDocx}
            disabled={isExportingDocx}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-black flex items-center space-x-2 shadow-md shadow-emerald-600/30 ring-2 ring-emerald-400/50 transition-all cursor-pointer"
            title="Tải Giáo Án Word (.docx) Về Máy"
          >
            <Download className="w-4 h-4 text-white animate-bounce" />
            <span>Tải Word (.docx)</span>
          </button>

          <button
            onClick={handleSaveToDrive}
            disabled={isSavingDrive}
            className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-md transition-colors cursor-pointer"
            title="Lưu bản Word trực tiếp vào Google Drive"
          >
            <Cloud className="w-4 h-4" />
            <span>{isSavingDrive ? 'Đang lưu...' : 'Lưu Drive'}</span>
          </button>

          {openGmail && (
            <button
              onClick={openGmail}
              className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-md transition-colors cursor-pointer"
              title="Gửi bài dạy qua Gmail"
            >
              <Mail className="w-4 h-4" />
              <span>Gửi Gmail</span>
            </button>
          )}

          <button
            onClick={handlePrint}
            className="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-xs"
          >
            <Printer className="w-4 h-4" />
            <span>In / PDF</span>
          </button>

          <button
            onClick={handleCopyMarkdown}
            className="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-xs"
          >
            {copiedMd ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
            <span>{copiedMd ? 'Đã chép' : 'Sao chép MD'}</span>
          </button>

          <button
            onClick={() => {
              if (confirm('Thầy/Cô có chắc chắn muốn xóa bài giảng này?')) {
                onDeletePlan(plan.id);
                onBack();
              }
            }}
            className="p-2 rounded-xl bg-white hover:bg-rose-50 text-rose-600 hover:text-rose-700 border border-slate-200 transition-colors shadow-xs"
            title="Xóa Kế hoạch bài dạy"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Newly Created Celebration Banner */}
      {isJustCreated && (
        <div className="p-4 bg-amber-50 border-2 border-amber-400 text-amber-950 rounded-2xl flex items-center justify-between gap-3 shadow-md animate-in slide-in-from-top duration-300">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm font-black">
              ✓
            </div>
            <div>
              <h4 className="text-sm font-black text-amber-900">
                Đã soạn xong bài dạy thành công!
              </h4>
              <p className="text-xs text-amber-800">
                Thầy/Cô có thể tải file Word (.docx) về máy bằng nút màu xanh lá nổi bật ngay bên dưới hoặc lưu trực tiếp lên Google Drive.
              </p>
            </div>
          </div>
          <button
            onClick={handleExportDocx}
            disabled={isExportingDocx}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center space-x-1.5 shadow-sm shrink-0 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Tải Word Ngay</span>
          </button>
        </div>
      )}

      {/* Quick Action Download & Google Drive Banner (Print Hidden) */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white rounded-3xl shadow-xl border border-emerald-400/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 print:hidden">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/30 shadow-inner">
            <Download className="w-6 h-6 text-white animate-bounce" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/20 text-white border border-white/30">
                Xuất Bản File
              </span>
              <span className="text-xs text-emerald-100 font-semibold">
                Chuẩn Công văn 5512 & GDPT 2018
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-white mt-0.5">
              Tải Kế Hoạch Bài Dạy Word (.docx) Về Máy
            </h3>
            <p className="text-xs text-emerald-100/90 font-medium">
              Chứa đầy đủ 4 hoạt động bài dạy, tích hợp AI, ma trận năng lực số và bảng tiêu chí Rubric 4 mức độ.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto shrink-0">
          <button
            type="button"
            onClick={handleExportDocx}
            disabled={isExportingDocx}
            className="flex-1 sm:flex-initial px-5 py-3 rounded-2xl bg-white hover:bg-emerald-50 active:scale-95 text-emerald-950 font-black text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-lg shadow-emerald-950/20 hover:scale-105 transition-all cursor-pointer border border-white/80"
          >
            <Download className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>{isExportingDocx ? 'Đang tạo Word...' : 'Tải File Word (.docx) Ngay'}</span>
          </button>

          <button
            type="button"
            onClick={handleSaveToDrive}
            disabled={isSavingDrive}
            className="px-3.5 py-3 rounded-2xl bg-emerald-800/80 hover:bg-emerald-900 text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors cursor-pointer border border-emerald-400/40"
            title="Lưu bản Word trực tiếp vào Google Drive"
          >
            <Cloud className="w-4 h-4" />
            <span>{isSavingDrive ? 'Đang lưu...' : 'Lưu Drive'}</span>
          </button>

          {openGmail && (
            <button
              type="button"
              onClick={openGmail}
              className="px-3.5 py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-sm transition-colors cursor-pointer"
              title="Gửi bài qua Gmail"
            >
              <Mail className="w-4 h-4" />
              <span>Gửi Gmail</span>
            </button>
          )}

          {driveSavedUrl && (
            <a
              href={driveSavedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-3 rounded-2xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs flex items-center space-x-1 transition-all border border-white/30"
            >
              <span>Mở Trên Drive</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>

      {/* Main Printable Document Sheet */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-xl space-y-6 print:bg-white print:text-black print:p-0 print:shadow-none print:border-none">
        {/* Document Banner */}
        <div className="p-6 bg-gradient-to-br from-rose-50 via-pink-50 to-amber-50/40 border border-rose-200/80 rounded-2xl space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-1 bg-rose-100 text-rose-800 font-bold border border-rose-200 rounded-lg">
                TRƯỜNG: {plan.teacherInfo?.school?.toUpperCase() || 'THCS'}
              </span>
              <span className="px-2.5 py-1 bg-white text-slate-700 font-semibold border border-slate-200 rounded-lg">
                GV: {getPlanTeacherDisplay(plan)}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-1 bg-indigo-100 text-indigo-800 font-bold border border-indigo-200 rounded-lg">
                Sách: {plan.generalInfo.textbook}
              </span>
              <span className="px-2.5 py-1 bg-amber-100 text-amber-800 font-bold border border-amber-200 rounded-lg">
                v{plan.version || 1}.0
              </span>
            </div>
          </div>

          <div className="pt-2">
            <h1 className="text-xl md:text-2xl font-black text-slate-900 leading-tight">
              KẾ HOẠCH BÀI DẠY: {plan.generalInfo.lessonTitle}
            </h1>
            <p className="text-xs text-slate-600 mt-1 font-semibold">
              Môn: {plan.generalInfo.subject} ({plan.generalInfo.grade}) • {plan.generalInfo.duration} • {plan.generalInfo.topic}
            </p>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center space-x-1 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 overflow-x-auto print:hidden">
          <button
            onClick={() => setActiveTab('5512')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 whitespace-nowrap ${
              activeTab === '5512'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>1. KHBD Chuẩn 5512</span>
          </button>

          <button
            onClick={() => setActiveTab('ai_digcomp')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 whitespace-nowrap ${
              activeTab === 'ai_digcomp'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white'
            }`}
          >
            <Laptop className="w-4 h-4" />
            <span>2. Tích hợp Năng Lực Số & AI</span>
          </button>

          <button
            onClick={() => setActiveTab('stem')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 whitespace-nowrap ${
              activeTab === 'stem'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>3. Định hướng STEM</span>
          </button>

          <button
            onClick={() => setActiveTab('rubric')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 whitespace-nowrap ${
              activeTab === 'rubric'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>4. Rubric Đánh giá</span>
          </button>
        </div>

        {/* TAB 1: KHBD CHUẨN 5512 */}
        {(activeTab === '5512' || true) && (
          <div className={activeTab === '5512' ? 'space-y-6' : 'hidden print:block space-y-6'}>
            {/* I. THÔNG TIN CHUNG */}
            <div className="space-y-3">
              <h2 className="text-sm font-extrabold text-rose-700 uppercase tracking-wider border-b border-slate-200 pb-1">
                I. THÔNG TIN CHUNG
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <span className="text-slate-500 font-semibold">Môn học / Lớp:</span>{' '}
                  <span className="text-slate-900 font-bold">{plan.generalInfo.subject} - {plan.generalInfo.grade}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold">Bộ sách giáo khoa:</span>{' '}
                  <span className="text-slate-900 font-bold">{plan.generalInfo.textbook}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold">Thời lượng & Tiết:</span>{' '}
                  <span className="text-slate-900 font-bold">{plan.generalInfo.duration} ({plan.generalInfo.lessonNumber})</span>
                </div>
              </div>
            </div>

            {/* II. MỤC TIÊU BÀI HỌC */}
            <div className="space-y-3">
              <h2 className="text-sm font-extrabold text-rose-700 uppercase tracking-wider border-b border-slate-200 pb-1">
                II. MỤC TIÊU BÀI HỌC (GDPT 2018)
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-200 space-y-2">
                  <h3 className="font-bold text-amber-900">1. Phẩm chất chủ yếu</h3>
                  <ul className="space-y-1.5">
                    {plan.objectives?.qualities?.map((q, idx) => (
                      <li key={idx} className="flex items-start space-x-1.5 text-slate-800 font-medium">
                        <span className="text-amber-600 font-bold">•</span>
                        <span>{q}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-200 space-y-2">
                  <h3 className="font-bold text-blue-900">2. Năng lực chung</h3>
                  <ul className="space-y-1.5">
                    {plan.objectives?.generalCompetencies?.map((c, idx) => (
                      <li key={idx} className="flex items-start space-x-1.5 text-slate-800 font-medium">
                        <span className="text-blue-600 font-bold">•</span>
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200 space-y-2">
                  <h3 className="font-bold text-emerald-900">3. Năng lực đặc thù</h3>
                  <ul className="space-y-1.5">
                    {plan.objectives?.subjectCompetencies?.map((s, idx) => (
                      <li key={idx} className="flex items-start space-x-1.5 text-slate-800 font-medium">
                        <span className="text-emerald-600 font-bold">•</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 bg-cyan-50/50 rounded-2xl border border-cyan-200 space-y-2">
                  <h3 className="font-bold text-cyan-900 flex items-center space-x-1.5">
                    <Laptop className="w-4 h-4 text-cyan-700 shrink-0" />
                    <span>4. Năng lực số (DigComp)</span>
                  </h3>
                  <ul className="space-y-1.5">
                    {plan.digitalCompetencyMatrix?.length > 0 ? (
                      plan.digitalCompetencyMatrix.map((item, idx) => (
                        <li key={idx} className="flex items-start space-x-1.5 text-slate-800 font-medium">
                          <span className="text-cyan-600 font-bold">•</span>
                          <span>
                            <strong className="text-cyan-900 font-semibold">{item.competency}:</strong>{' '}
                            {item.evidence}
                          </span>
                        </li>
                      ))
                    ) : (
                      <li className="text-slate-500 italic">Khai thác và ứng dụng công cụ số trong hoạt động học tập.</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>

            {/* III. THIẾT BỊ DẠY HỌC */}
            <div className="space-y-3">
              <h2 className="text-sm font-extrabold text-rose-700 uppercase tracking-wider border-b border-slate-200 pb-1">
                III. THIẾT BỊ DẠY HỌC VÀ HỌC LIỆU
              </h2>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2 text-slate-800 font-medium">
                <p>
                  <strong className="text-slate-900">1. Giáo viên:</strong> {plan.equipment?.teacher?.join('; ')}
                </p>
                <p>
                  <strong className="text-slate-900">2. Học sinh:</strong> {plan.equipment?.students?.join('; ')}
                </p>
                <p>
                  <strong className="text-purple-800">3. Công cụ AI & Phần mềm số:</strong> {plan.equipment?.digitalTools?.join(', ')}
                </p>
                {plan.equipment?.stemKits && plan.equipment.stemKits.length > 0 && (
                  <p>
                    <strong className="text-amber-800">4. Học liệu STEM / Thiết bị:</strong> {plan.equipment?.stemKits?.join(', ')}
                  </p>
                )}
              </div>
            </div>

            {/* IV. TIẾN TRÌNH DẠY HỌC */}
            <div className="space-y-4">
              <h2 className="text-sm font-extrabold text-blue-400 uppercase tracking-wider border-b border-slate-800 pb-1">
                IV. TIẾN TRÌNH DẠY HỌC (Chuẩn Công văn 5512)
              </h2>

              <div className="space-y-4">
                {plan.procedure?.map((act, idx) => {
                  const isOpen = openActivities[act.id] !== false;
                  return (
                    <div
                      key={act.id || idx}
                      className="border border-slate-200 bg-slate-50 rounded-2xl overflow-hidden print:border-slate-300 print:bg-white"
                    >
                      {/* Accordion Header */}
                      <button
                        onClick={() => toggleActivity(act.id)}
                        className="w-full p-4 bg-white hover:bg-slate-100/80 flex items-center justify-between text-left transition-colors border-b border-slate-200 print:p-2 print:bg-gray-100"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="w-7 h-7 rounded-lg bg-rose-100 text-rose-800 font-bold text-xs flex items-center justify-center border border-rose-200">
                            HĐ {idx + 1}
                          </span>
                          <div>
                            <h3 className="font-bold text-sm text-slate-900 print:text-black">
                              {act.typeLabel}: {act.title}
                            </h3>
                          </div>
                        </div>
                        <div className="print:hidden">
                          {isOpen ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
                        </div>
                      </button>

                      {/* Activity Body */}
                      {isOpen && (
                        <div className="p-5 space-y-3 text-xs text-slate-800 print:p-3 print:text-black font-medium">
                          <p>
                            <strong className="text-rose-700">a) Mục tiêu:</strong> {act.objectives}
                          </p>
                          <p>
                            <strong className="text-rose-700">b) Nội dung:</strong> {act.content}
                          </p>
                          <p>
                            <strong className="text-rose-700">c) Sản phẩm:</strong> {act.product}
                          </p>

                          <div className="space-y-2 pt-2 border-t border-slate-200">
                            <strong className="text-rose-700 block font-bold">d) Tổ chức thực hiện:</strong>

                            <div className="space-y-2 pl-3 border-l-2 border-rose-400">
                              <p>
                                <strong className="text-slate-900 print:text-black">Bước 1: Chuyển giao nhiệm vụ:</strong>{' '}
                                {act.organization?.step1_Transfer}
                              </p>
                              <p>
                                <strong className="text-slate-900 print:text-black">Bước 2: Thực hiện nhiệm vụ:</strong>{' '}
                                {act.organization?.step2_Perform}
                              </p>
                              <p>
                                <strong className="text-slate-900 print:text-black">Bước 3: Báo cáo, thảo luận:</strong>{' '}
                                {act.organization?.step3_Discuss}
                              </p>
                              <p>
                                <strong className="text-slate-900 print:text-black">Bước 4: Kết luận, nhận định:</strong>{' '}
                                {act.organization?.step4_Conclude}
                              </p>
                            </div>
                          </div>

                          {act.digitalCompetencyNote && (
                            <div className="mt-3 p-3 bg-cyan-50 border border-cyan-200 rounded-xl text-cyan-950">
                              <span className="font-bold text-cyan-800">💻 Tích hợp Năng lực số (DigComp): </span>
                              {act.digitalCompetencyNote}
                            </div>
                          )}

                          {act.aiIntegrationNote && (
                            <div className="mt-3 p-3 bg-purple-50 border border-purple-200 rounded-xl text-purple-950">
                              <span className="font-bold text-purple-800">🤖 Tích hợp AI Literacy: </span>
                              {act.aiIntegrationNote}
                              {act.aiPromptSample && (
                                <p className="mt-1 font-mono text-[11px] text-purple-900 bg-white p-2 rounded-lg border border-purple-200">
                                  Prompt mẫu: "{act.aiPromptSample}"
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: TÍCH HỢP NĂNG LỰC SỐ & AI */}
        {activeTab === 'ai_digcomp' && (
          <div className="space-y-6">
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
              <h2 className="text-sm font-extrabold text-cyan-900 uppercase tracking-wider flex items-center space-x-2">
                <Laptop className="w-5 h-5 text-cyan-700" />
                <span>1. Ma Trận Năng Lực Số (Khung Năng Lực Số GDPT 2018 / DigComp)</span>
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-200/80 text-slate-800 border-b border-slate-300">
                      <th className="p-3 font-bold">Thành phần Năng lực số</th>
                      <th className="p-3 font-bold">Hoạt động áp dụng</th>
                      <th className="p-3 font-bold">Minh chứng / Sản phẩm đạt được</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-800 font-medium">
                    {plan.digitalCompetencyMatrix?.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-100/60">
                        <td className="p-3 font-bold text-slate-900">{item.competency}</td>
                        <td className="p-3 text-rose-800">{item.activityApplied}</td>
                        <td className="p-3">{item.evidence}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* AI Tools & Prompts */}
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <h2 className="text-sm font-extrabold text-purple-900 uppercase tracking-wider">
                2. Công Cụ AI & Prompt Mẫu Cho Học Sinh
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {plan.aiIntegrationDetail?.tools?.map((tool, idx) => (
                  <div key={idx} className="p-4 bg-white rounded-xl border border-slate-200 space-y-2 text-xs">
                    <h3 className="font-bold text-slate-900 text-sm">{tool.name}</h3>
                    <p className="text-slate-600 font-medium">Mục đích: {tool.purpose}</p>
                    <div className="p-2.5 bg-purple-50 border border-purple-200 rounded-lg font-mono text-purple-900">
                      "{tool.promptForStudents}"
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Ethics & Critical Questions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <h3 className="font-bold text-emerald-800 text-sm">3. Quy Tắc Đạo Đức AI & Bản Quyền</h3>
                <ul className="space-y-1.5 text-slate-700 font-medium">
                  {plan.aiIntegrationDetail?.aiEthicsRules?.map((rule, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <h3 className="font-bold text-amber-800 text-sm">4. Câu Hỏi Phản Biện AI Cho Học Sinh</h3>
                <ul className="space-y-1.5 text-slate-700 font-medium">
                  {plan.aiIntegrationDetail?.criticalQuestions?.map((q, idx) => (
                    <li key={idx} className="flex items-start space-x-2 italic">
                      <HelpCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <span>"{q}"</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ĐỊNH HƯỚNG STEM */}
        {activeTab === 'stem' && (
          <div className="space-y-6">
            {plan.stemDetail ? (
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-5 text-xs">
                <div className="space-y-1">
                  <span className="text-amber-800 font-bold uppercase tracking-wider text-[10px]">VẤN ĐỀ THỰC TIỄN STEM</span>
                  <h3 className="text-base font-extrabold text-slate-900">{plan.stemDetail.realWorldProblem}</h3>
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold text-amber-900 text-xs">Quy Trình Thiết Kế Kỹ Thuật STEM 5 Bước:</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                    {plan.stemDetail.designProcess?.map((step, idx) => (
                      <div key={idx} className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                        <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px] flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <p className="font-semibold text-slate-800">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-1">
                  <h4 className="font-bold text-amber-900">Phương Pháp Kiểm Thử & Đánh Giá Sản Phẩm:</h4>
                  <p className="text-slate-700 font-medium">{plan.stemDetail.testingAndEvaluation}</p>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-500 font-medium text-sm">
                Bài giảng này được thiết kế ở mức độ không tích hợp STEM chuyên sâu.
              </div>
            )}
          </div>
        )}

        {/* TAB 4: RUBRIC ĐÁNH GIÁ */}
        {activeTab === 'rubric' && (
          <div className="space-y-4">
            <h2 className="text-sm font-extrabold text-emerald-800 uppercase tracking-wider">
              BẢNG RUBRIC ĐÁNH GIÁ NĂNG LỰC HỌC SINH (4 MỨC ĐỘ)
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 border-b border-slate-300">
                    <th className="p-3 font-bold">Tiêu chí đánh giá</th>
                    <th className="p-3 font-bold text-rose-700">Chưa đạt (1-4đ)</th>
                    <th className="p-3 font-bold text-amber-700">Đạt (5-6đ)</th>
                    <th className="p-3 font-bold text-blue-700">Khá (7-8đ)</th>
                    <th className="p-3 font-bold text-emerald-700">Tốt / Xuất sắc (9-10đ)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-700 font-medium">
                  {plan.assessmentRubric?.map((r, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-900">{r.criteria}</td>
                      <td className="p-3 text-slate-600">{r.levelUnsatisfactory}</td>
                      <td className="p-3 text-slate-700">{r.levelSatisfactory}</td>
                      <td className="p-3 text-blue-900 font-semibold">{r.levelGood}</td>
                      <td className="p-3 text-emerald-900 font-bold">{r.levelExcellent}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* End-of-document Export Action Box */}
        <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
          <div className="text-xs text-slate-500">
            Kế hoạch bài dạy đã lưu tự động. Thầy/Cô có thể tải file Word (.docx) hoặc tiếp tục tinh chỉnh cùng AI.
          </div>
          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleExportDocx}
              disabled={isExportingDocx}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold flex items-center justify-center space-x-2 shadow-md transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{isExportingDocx ? 'Đang tạo Word...' : 'Tải Giáo Án Word (.docx)'}</span>
            </button>
            <button
              type="button"
              onClick={() => setIsChatOpen(true)}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 text-rose-600" />
              <span>Chỉnh sửa qua Chat AI</span>
            </button>
          </div>
        </div>
      </div>

      {/* Floating Quick Action Button for Word Download */}
      <div className="fixed bottom-6 right-6 z-40 print:hidden flex flex-col items-end gap-2">
        <button
          type="button"
          onClick={handleExportDocx}
          disabled={isExportingDocx}
          className="group px-4 py-3 sm:px-5 sm:py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-700 hover:to-teal-700 active:scale-95 text-white font-black text-xs sm:text-sm flex items-center space-x-2.5 shadow-2xl shadow-emerald-700/50 ring-2 ring-emerald-300 transition-all cursor-pointer hover:shadow-emerald-600/60"
          title="Tải Giáo án Word (.docx) về máy tính"
        >
          <Download className="w-5 h-5 text-white group-hover:animate-bounce shrink-0" />
          <span className="leading-none">{isExportingDocx ? 'Đang tạo Word...' : 'Tải Giáo Án Word (.docx)'}</span>
        </button>
      </div>

      {/* AI Chat Drawer Component */}
      <AIChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        currentPlan={plan}
        onUpdatePlan={onUpdatePlan}
      />

      {/* Reviewer Modal Component */}
      <ReviewerModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        reviewScore={reviewScore}
        isLoading={isReviewLoading}
      />

      {/* Worksheet Modal Component */}
      <WorksheetGeneratorModal
        isOpen={isWorksheetModalOpen}
        onClose={() => setIsWorksheetModalOpen(false)}
        worksheet={worksheet}
        isLoading={isWorksheetLoading}
      />
    </div>
  );
};
