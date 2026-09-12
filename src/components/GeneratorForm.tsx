import React, { useState, useEffect } from 'react';
import { Sparkles, BookOpen, Layers, Cpu, Compass, CheckSquare, Settings2, ArrowRight, Lightbulb, Globe, Download, CheckCircle2, Eye, FileDown, X, Cloud, ExternalLink, Mail } from 'lucide-react';
import { Subject, Grade, TextbookSeries, AILevel, STEMLevel, LessonPlanRequest, TeacherProfile, LessonPlan, AppLanguage } from '../types';
import { DIGITAL_COMPETENCY_GROUPS } from '../data/digitalCompetenciesData';
import { exportLessonPlanToDocx } from '../utils/docxExporter';
import { uploadLessonPlanToGoogleDrive, signInWithGoogleDrive, isDriveConnected } from '../services/googleDriveService';

interface GeneratorFormProps {
  teacherProfile: TeacherProfile;
  appLanguage?: AppLanguage;
  onSuccessGenerated: (plan: LessonPlan) => void;
  onCancel: () => void;
  openGmailWithPlan?: (plan: LessonPlan) => void;
}

const ALL_SUBJECTS: string[] = [
  'Toán học',
  'Ngữ văn',
  'Tiếng Anh',
  'Khoa học tự nhiên',
  'Lịch sử và Địa lí',
  'Tin học',
  'Công nghệ',
  'Giáo dục công dân',
  'Hoạt động trải nghiệm, hướng nghiệp',
  'Hoạt động trải nghiệm hướng nghiệp',
  'Âm nhạc',
  'Mỹ thuật',
  'Giáo dục thể chất',
  'Môn khác (Tự nhập...)',
];

const GRADES: Grade[] = ['Lớp 6', 'Lớp 7', 'Lớp 8', 'Lớp 9'];

const TEXTBOOKS: TextbookSeries[] = [
  'Kết nối tri thức với cuộc sống',
  'Chân trời sáng tạo',
  'Cánh diều',
];

export const GeneratorForm: React.FC<GeneratorFormProps> = ({
  teacherProfile,
  appLanguage = 'Vietnamese',
  onSuccessGenerated,
  onCancel,
  openGmailWithPlan,
}) => {
  const initialSubject = teacherProfile.subjects[0] || 'Tin học';
  const isInitialSubjectInList = ALL_SUBJECTS.includes(initialSubject);

  const [selectedSubjectOption, setSelectedSubjectOption] = useState<string>(
    isInitialSubjectInList ? initialSubject : 'Môn khác (Tự nhập...)'
  );
  const [customSubject, setCustomSubject] = useState<string>(
    isInitialSubjectInList ? '' : initialSubject
  );

  const [grade, setGrade] = useState<Grade>('Lớp 8');
  const [textbook, setTextbook] = useState<TextbookSeries>(teacherProfile.defaultTextbook || 'Kết nối tri thức với cuộc sống');
  const [topic, setTopic] = useState('Chủ đề: Tích hợp Công nghệ & Sáng tạo');
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonNumber, setLessonNumber] = useState('Tiết 1');
  const [duration, setDuration] = useState('1 tiết (45 phút)');
  const [language, setLanguage] = useState<AppLanguage>(appLanguage);

  useEffect(() => {
    if (appLanguage) {
      setLanguage(appLanguage);
    }
  }, [appLanguage]);

  // Integration Configs
  const [aiLevel, setAiLevel] = useState<AILevel>('medium');
  const [stemLevel, setStemLevel] = useState<STEMLevel>('mini_stem');
  const [selectedDigitalComps, setSelectedDigitalComps] = useState<string[]>([
    'Tìm kiếm thông tin số',
    'Đánh giá & Trích dẫn thông tin',
    'Hiểu biết & Soạn Prompt AI (AI Literacy)',
    'Đạo đức & Bản quyền AI (AI Ethics)',
  ]);

  const [extraOptions, setExtraOptions] = useState({
    localEducation: false,
    environmental: false,
    careerGuidance: false,
    financialLiteracy: false,
    digitalTransformation: true,
  });

  const [customInstructions, setCustomInstructions] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);
  const [completedPlan, setCompletedPlan] = useState<LessonPlan | null>(null);
  const [isExportingWord, setIsExportingWord] = useState(false);
  const [isSavingToDrive, setIsSavingToDrive] = useState(false);
  const [driveSavedLink, setDriveSavedLink] = useState<string | null>(null);
  const [driveSaveError, setDriveSaveError] = useState<string | null>(null);
  const [autoDownloadWord, setAutoDownloadWord] = useState(true);
  const [downloadSuccessToast, setDownloadSuccessToast] = useState(false);

  const handleDownloadWordNow = async () => {
    if (!completedPlan) return;
    setIsExportingWord(true);
    try {
      await exportLessonPlanToDocx(completedPlan);
      setDownloadSuccessToast(true);
    } catch (err: any) {
      alert(`Lỗi khi xuất file Word: ${err.message}`);
    } finally {
      setIsExportingWord(false);
    }
  };

  const handleSaveToDriveNow = async () => {
    if (!completedPlan) return;
    setIsSavingToDrive(true);
    setDriveSaveError(null);
    try {
      if (!isDriveConnected()) {
        await signInWithGoogleDrive();
      }
      const uploaded = await uploadLessonPlanToGoogleDrive(completedPlan);
      setDriveSavedLink(uploaded.webViewLink);
    } catch (err: any) {
      console.error('Save to Drive error:', err);
      setDriveSaveError(err.message || 'Lỗi khi lưu lên Google Drive.');
    } finally {
      setIsSavingToDrive(false);
    }
  };

  const loadingStepsText = [
    'Phân tích Chương trình Khung GDPT 2018...',
    'Áp dụng Công văn 5512/BGDĐT-GDTrH cấu trúc 4 bước tổ chức...',
    'Tích hợp công cụ AI, Prompt mẫu & Đạo đức AI...',
    'Thiết kế chuỗi hoạt động STEM & Ma trận Năng lực số...',
    'Tạo Rubric đánh giá 4 mức độ & Hoàn thiện Kế hoạch bài dạy...',
  ];

  const toggleComp = (compName: string) => {
    if (selectedDigitalComps.includes(compName)) {
      setSelectedDigitalComps(selectedDigitalComps.filter((c) => c !== compName));
    } else {
      setSelectedDigitalComps([...selectedDigitalComps, compName]);
    }
  };

  const handleQuickFill = (
    presetTitle: string,
    presetTopic: string,
    presetSubject: Subject,
    presetGrade?: Grade
  ) => {
    if (ALL_SUBJECTS.includes(presetSubject)) {
      setSelectedSubjectOption(presetSubject);
    } else {
      setSelectedSubjectOption('Môn khác (Tự nhập...)');
      setCustomSubject(presetSubject);
    }
    setLessonTitle(presetTitle);
    setTopic(presetTopic);
    if (presetGrade) {
      setGrade(presetGrade);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonTitle.trim()) {
      setError('Vui lòng nhập Tên bài học.');
      return;
    }

    if (selectedSubjectOption === 'Môn khác (Tự nhập...)' && !customSubject.trim()) {
      setError('Vui lòng tự nhập tên Môn học của bạn.');
      return;
    }

    const finalSubject =
      selectedSubjectOption === 'Môn khác (Tự nhập...)'
        ? customSubject.trim() || 'Môn học tự chọn'
        : selectedSubjectOption;

    setError(null);
    setIsGenerating(true);
    setLoadingStep(0);

    const stepInterval = setInterval(() => {
      setLoadingStep((prev) => (prev < loadingStepsText.length - 1 ? prev + 1 : prev));
    }, 2200);

    const requestData: LessonPlanRequest = {
      subject: finalSubject,
      grade,
      textbook,
      topic,
      lessonTitle,
      lessonNumber,
      duration,
      language,
      aiLevel,
      stemLevel,
      digitalCompetencies: selectedDigitalComps,
      extraOptions,
      customInstructions,
    };

    try {
      const res = await fetch('/api/khbd/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ request: requestData, teacher: teacherProfile }),
      });

      const data = await res.json();
      clearInterval(stepInterval);

      if (data.success && data.plan) {
        setCompletedPlan(data.plan);
        if (autoDownloadWord) {
          try {
            await exportLessonPlanToDocx(data.plan);
            setDownloadSuccessToast(true);
          } catch (autoErr) {
            console.warn('Auto Word download warning:', autoErr);
          }
        }
      } else {
        setError(data.error || 'Đã xảy ra lỗi khi sinh bài giảng.');
      }
    } catch (err: any) {
      clearInterval(stepInterval);
      setError(`Lỗi kết nối máy chủ AI: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Newly Completed Plan Banner with Quick Download Button */}
      {completedPlan && (
        <div className="p-5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white rounded-3xl border-2 border-emerald-400 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-in slide-in-from-top duration-300">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/30 shadow-inner">
              <CheckCircle2 className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-extrabold uppercase tracking-wide">
                <span>Soạn bài thành công</span>
              </div>
              <h3 className="text-lg font-black text-white mt-0.5">
                {completedPlan.generalInfo.lessonTitle}
              </h3>
              <p className="text-xs text-emerald-100 font-medium">
                Môn {completedPlan.generalInfo.subject} • {completedPlan.generalInfo.grade} • {completedPlan.generalInfo.textbook} • Chuẩn Công văn 5512
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto shrink-0">
            <button
              type="button"
              onClick={handleDownloadWordNow}
              disabled={isExportingWord}
              className="flex-1 md:flex-initial px-5 py-3 rounded-2xl bg-white hover:bg-emerald-50 text-emerald-950 font-black text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-lg shadow-emerald-950/20 hover:scale-105 active:scale-95 transition-all cursor-pointer border border-white/80"
            >
              <Download className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>{isExportingWord ? 'Đang xuất Word...' : 'Tải Giáo Án Word (.docx) Về Máy'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onSuccessGenerated(completedPlan);
                setCompletedPlan(null);
              }}
              className="px-4 py-3 rounded-2xl bg-emerald-800/80 hover:bg-emerald-900 text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors cursor-pointer border border-emerald-400/50"
            >
              <Eye className="w-4 h-4" />
              <span>Xem & Chỉnh Sửa</span>
            </button>
          </div>
        </div>
      )}

      {/* Form Header Card */}
      <div className="p-6 bg-gradient-to-r from-rose-100/90 via-pink-100/80 to-purple-100/90 rounded-3xl border border-rose-200/90 shadow-sm relative overflow-hidden text-slate-800">
        <div className="absolute top-0 right-0 w-64 h-64 bg-rose-200/30 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <a
              href="https://hoclieu.vn/"
              target="_blank"
              rel="noopener noreferrer"
              title="Truy cập Học liệu số: https://hoclieu.vn/"
              className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-rose-200/70 hover:bg-rose-200 border border-rose-300/80 text-rose-900 text-xs font-bold backdrop-blur transition-colors cursor-pointer group"
            >
              <Sparkles className="w-3.5 h-3.5 text-rose-700" />
              <span>Ms Cẩm Trúc-KHBD CHUẨN</span>
              <ExternalLink className="w-3 h-3 text-rose-700/60 group-hover:text-rose-900 transition-colors" />
            </a>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              Tạo Kế Hoạch Bài Dạy Mới
            </h1>
            <p className="text-xs md:text-sm text-slate-600 font-medium">
              Tùy chỉnh môn học, lớp, mức độ tích hợp AI, STEM và Năng lực số để AI khởi tạo giáo án chuẩn 5512.
            </p>
          </div>

          {/* Quick Presets */}
          <div className="p-3 bg-white/90 backdrop-blur rounded-2xl border border-rose-200/80 text-xs space-y-1.5 shrink-0 w-full md:w-auto shadow-xs">
            <p className="text-[10px] font-bold text-amber-800 uppercase tracking-wider flex items-center space-x-1">
              <Lightbulb className="w-3 h-3 text-amber-600" />
              <span>Gợi ý mẫu bài học hay:</span>
            </p>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() =>
                  handleQuickFill(
                    'Unit 1: Leisure Time - Getting Started & A Closer Look 1',
                    'Theme: Our Communities & Hobbies',
                    'Tiếng Anh',
                    'Lớp 8'
                  )
                }
                className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg border border-emerald-200 transition-colors font-semibold text-[11px]"
              >
                🇬🇧 TA 8: Unit 1 Leisure Time
              </button>
              <button
                type="button"
                onClick={() =>
                  handleQuickFill(
                    'Unit 2: Life in the Countryside - Skills 1 & 2',
                    'Theme: Rural and Urban Lifestyle',
                    'Tiếng Anh',
                    'Lớp 8'
                  )
                }
                className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg border border-emerald-200 transition-colors font-semibold text-[11px]"
              >
                🇬🇧 TA 8: Unit 2 Countryside
              </button>
              <button
                type="button"
                onClick={() =>
                  handleQuickFill(
                    'Unit 1: Local Community - Getting Started & Vocabulary',
                    'Theme: Community Services & Artisans',
                    'Tiếng Anh',
                    'Lớp 9'
                  )
                }
                className="px-2.5 py-1 bg-sky-50 hover:bg-sky-100 text-sky-800 rounded-lg border border-sky-200 transition-colors font-semibold text-[11px]"
              >
                🇬🇧 TA 9: Unit 1 Local Community
              </button>
              <button
                type="button"
                onClick={() =>
                  handleQuickFill(
                    'Unit 3: Healthy Living for Teens - A Closer Look 2 (Modal Verbs)',
                    'Theme: Physical and Mental Wellbeing',
                    'Tiếng Anh',
                    'Lớp 9'
                  )
                }
                className="px-2.5 py-1 bg-sky-50 hover:bg-sky-100 text-sky-800 rounded-lg border border-sky-200 transition-colors font-semibold text-[11px]"
              >
                🇬🇧 TA 9: Unit 3 Healthy Living
              </button>
              <button
                type="button"
                onClick={() =>
                  handleQuickFill(
                    'Đơn thức nhiều biến và Đa thức nhiều biến',
                    'Chương 1: Biểu thức đại số',
                    'Toán học',
                    'Lớp 8'
                  )
                }
                className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-800 rounded-lg border border-rose-200 transition-colors font-semibold text-[11px]"
              >
                📐 Toán 8: Đơn thức & Đa thức
              </button>
              <button
                type="button"
                onClick={() =>
                  handleQuickFill(
                    'Khám phá hứng thú nghề nghiệp & lập kế hoạch rèn luyện',
                    'Chủ đề: Định hướng nghề nghiệp tương lai',
                    'Hoạt động trải nghiệm, hướng nghiệp',
                    'Lớp 9'
                  )
                }
                className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg border border-amber-200 transition-colors font-semibold text-[11px]"
              >
                🎯 HĐTN 9: Nghề nghiệp
              </button>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-center justify-between font-medium">
          <span>⚠️ {error}</span>
          <button onClick={() => setError(null)} className="font-bold underline text-rose-900">
            Đóng
          </button>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Thông tin Bài học */}
        <div className="p-6 bg-white border border-slate-200 rounded-3xl space-y-4 shadow-xs">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center font-bold text-sm border border-rose-200">
              1
            </div>
            <h3 className="font-bold text-base text-slate-900">Thông Tin Chung & Bài Học</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Môn học (*)</label>
              <select
                value={selectedSubjectOption}
                onChange={(e) => setSelectedSubjectOption(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-rose-500 font-medium cursor-pointer"
              >
                {ALL_SUBJECTS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>

              {selectedSubjectOption === 'Môn khác (Tự nhập...)' && (
                <div className="mt-2 space-y-1">
                  <input
                    type="text"
                    value={customSubject}
                    onChange={(e) => setCustomSubject(e.target.value)}
                    placeholder="Tự nhập tên môn học (VD: Tiếng Anh, Hoạt động trải nghiệm...)"
                    className="w-full px-3 py-2 bg-white border border-rose-400 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500 font-semibold shadow-xs"
                  />
                  <p className="text-[10px] text-rose-600 font-medium">
                    ✏️ Thầy/Cô có thể tự nhập tên môn học bất kỳ.
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Khối Lớp (*)</label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value as Grade)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-rose-500 font-medium cursor-pointer"
              >
                {GRADES.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Bộ Sách Giáo Khoa</label>
              <select
                value={textbook}
                onChange={(e) => setTextbook(e.target.value as TextbookSeries)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-rose-500 font-medium cursor-pointer"
              >
                {TEXTBOOKS.map((tb) => (
                  <option key={tb} value={tb}>
                    {tb}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Thời lượng dạy học</label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-rose-500 font-medium"
                placeholder="1 tiết (45 phút)"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tiết thứ</label>
              <input
                type="text"
                value={lessonNumber}
                onChange={(e) => setLessonNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-rose-500 font-medium"
                placeholder="Tiết 12 - 13"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Chủ đề bài học</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-rose-500 font-medium"
                placeholder="Chủ đề 3: Các ứng dụng thực tiễn..."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center space-x-1">
                <Globe className="w-3.5 h-3.5 text-rose-600" />
                <span>Ngôn ngữ (Language)</span>
              </label>
              <div className="grid grid-cols-2 gap-1 p-1 bg-slate-50 border border-slate-200 rounded-xl">
                <button
                  type="button"
                  onClick={() => setLanguage('Vietnamese')}
                  className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-1 cursor-pointer ${
                    language === 'Vietnamese'
                      ? 'bg-rose-600 text-white shadow-2xs font-extrabold'
                      : 'bg-transparent text-slate-600 hover:text-slate-900 font-medium'
                  }`}
                >
                  <span>Tiếng Việt</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('English')}
                  className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-1 cursor-pointer ${
                    language === 'English'
                      ? 'bg-rose-600 text-white shadow-2xs font-extrabold'
                      : 'bg-transparent text-slate-600 hover:text-slate-900 font-medium'
                  }`}
                >
                  <span>English</span>
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Tên Bài Học (*)</label>
            <input
              type="text"
              value={lessonTitle}
              onChange={(e) => setLessonTitle(e.target.value)}
              required
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-rose-500"
              placeholder="Nhập tên bài học đầy đủ (Ví dụ: Bài 8: Đo tốc độ chuyển động bằng cảm biến số)"
            />
          </div>
        </div>

        {/* Step 2: Cấu hình Tích hợp AI, STEM & Năng lực số */}
        <div className="p-6 bg-white border border-slate-200 rounded-3xl space-y-5 shadow-xs">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold text-sm border border-purple-200">
              2
            </div>
            <h3 className="font-bold text-base text-slate-900">Mức Độ Tích Hợp Công Nghệ & STEM</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* AI Level */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <label className="block text-xs font-bold text-purple-700 uppercase tracking-wider flex items-center space-x-1.5">
                <Cpu className="w-4 h-4 text-purple-600" />
                <span>Mức độ Tích hợp Trí tuệ nhân tạo (AI Literacy)</span>
              </label>

              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'none', label: 'Không tích hợp', desc: 'Giáo án truyền thống' },
                  { id: 'basic', label: 'Cơ bản', desc: 'AI tra cứu thông tin' },
                  { id: 'medium', label: 'Trung bình', desc: 'Prompt mẫu + Đạo đức AI' },
                  { id: 'advanced', label: 'Nâng cao', desc: 'Phản biện AI + AI Coding' },
                ].map((lvl) => (
                  <button
                    key={lvl.id}
                    type="button"
                    onClick={() => setAiLevel(lvl.id as AILevel)}
                    className={`p-3 rounded-xl text-left border transition-all ${
                      aiLevel === lvl.id
                        ? 'bg-purple-600 text-white font-bold border-purple-600 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="font-bold text-xs">{lvl.label}</div>
                    <div className={`text-[10px] ${aiLevel === lvl.id ? 'text-purple-100' : 'text-slate-500'}`}>{lvl.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* STEM Level */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <label className="block text-xs font-bold text-amber-700 uppercase tracking-wider flex items-center space-x-1.5">
                <Compass className="w-4 h-4 text-amber-600" />
                <span>Mức độ Tích hợp STEM / STEAM</span>
              </label>

              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'none', label: 'Không STEM', desc: 'Dạy lý thuyết tiêu chuẩn' },
                  { id: 'mini_stem', label: 'Mini STEM', desc: 'Thử nghiệm & Chế tạo ngắn' },
                  { id: 'stem_project', label: 'STEM Project', desc: 'Dự án thực tiễn có Rubric' },
                  { id: 'steam', label: 'STEAM', desc: 'Tích hợp Nghệ thuật & Thiết kế' },
                ].map((lvl) => (
                  <button
                    key={lvl.id}
                    type="button"
                    onClick={() => setStemLevel(lvl.id as STEMLevel)}
                    className={`p-3 rounded-xl text-left border transition-all ${
                      stemLevel === lvl.id
                        ? 'bg-amber-600 text-white font-bold border-amber-600 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="font-bold text-xs">{lvl.label}</div>
                    <div className={`text-[10px] ${stemLevel === lvl.id ? 'text-amber-100' : 'text-slate-500'}`}>{lvl.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Digital Competencies Groups */}
          <div className="space-y-3 pt-2">
            <label className="block text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center space-x-1.5">
              <Layers className="w-4 h-4 text-emerald-600" />
              <span>Năng Lực Số Cần Phát Triển (Khung Bộ GD&ĐT & DigComp)</span>
            </label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {DIGITAL_COMPETENCY_GROUPS.map((group, idx) => (
                <div key={idx} className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <h4 className="text-xs font-bold text-slate-800 border-b border-slate-200 pb-1">
                    {group.category}
                  </h4>
                  <div className="space-y-1.5">
                    {group.items.map((item) => {
                      const isChecked = selectedDigitalComps.includes(item.name);
                      return (
                        <label
                          key={item.id}
                          className="flex items-start space-x-2 text-xs text-slate-700 cursor-pointer hover:text-slate-900"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleComp(item.name)}
                            className="mt-0.5 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                          />
                          <div>
                            <span className={isChecked ? 'font-bold text-rose-700' : 'font-medium'}>{item.name}</span>
                            <p className="text-[10px] text-slate-500">{item.description}</p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Extra Education Options */}
          <div className="pt-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Các Nội Dung Tích Hợp Bổ Sung:
            </label>
            <div className="flex flex-wrap gap-3 text-xs">
              {[
                { id: 'localEducation', label: 'Giáo dục địa phương' },
                { id: 'environmental', label: 'Giáo dục môi trường' },
                { id: 'careerGuidance', label: 'Giáo dục hướng nghiệp' },
                { id: 'financialLiteracy', label: 'Giáo dục tài chính' },
                { id: 'digitalTransformation', label: 'Chuyển đổi số giáo dục' },
              ].map((opt) => (
                <label
                  key={opt.id}
                  className="flex items-center space-x-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-100"
                >
                  <input
                    type="checkbox"
                    checked={(extraOptions as any)[opt.id]}
                    onChange={(e) =>
                      setExtraOptions({ ...extraOptions, [opt.id]: e.target.checked })
                    }
                    className="rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                  />
                  <span className="text-slate-700 font-medium">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Custom Instructions */}
        <div className="p-6 bg-white border border-slate-200 rounded-3xl space-y-3 shadow-xs">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Yêu cầu & Ghi chú bổ sung dành riêng cho AI (Tùy chọn):
          </label>
          <textarea
            value={customInstructions}
            onChange={(e) => setCustomInstructions(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-rose-500 font-medium"
            placeholder="Ví dụ: Bổ sung thêm trò chơi ô chữ ở Hoạt động 1, phân hóa cao cho học sinh giỏi, sử dụng công cụ Canva để học sinh nộp sản phẩm..."
          />
        </div>

        {/* Auto-Download Word Checkbox */}
        <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <label className="flex items-center space-x-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={autoDownloadWord}
              onChange={(e) => setAutoDownloadWord(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 border-slate-300"
            />
            <span className="text-xs sm:text-sm font-bold text-emerald-950 flex items-center gap-1.5">
              <Download className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>Tự động tải giáo án Word (.docx) về máy ngay sau khi tạo xong</span>
            </span>
          </label>
          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100/90 border border-emerald-300/80 px-2.5 py-1 rounded-full self-start sm:self-auto">
            Khuyên dùng
          </span>
        </div>

        {/* Submit & Generate Actions */}
        <div className="pt-2 flex items-center justify-end space-x-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={isGenerating}
            className="px-5 py-3 rounded-2xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Hủy Bỏ
          </button>

          <button
            type="submit"
            disabled={isGenerating}
            className="px-8 py-3.5 rounded-2xl text-base font-bold bg-gradient-to-r from-pink-600 via-rose-600 to-rose-700 hover:from-pink-700 hover:to-rose-800 text-white shadow-md flex items-center space-x-2 transition-all transform hover:scale-[1.02] active:scale-95 disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Đang Sinh Bài Giảng AI...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-amber-300" />
                <span>Bắt Đầu Khởi Tạo KHBD</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Loading Modal Overlay */}
      {isGenerating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
          <div className="bg-white border border-slate-200 p-8 rounded-3xl max-w-md w-full text-center space-y-6 shadow-2xl">
            <div className="relative w-20 h-20 mx-auto">
              <div className="absolute inset-0 rounded-full bg-rose-500 animate-ping opacity-20"></div>
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-pink-600 via-rose-600 to-amber-500 flex items-center justify-center shadow-md">
                <Sparkles className="w-10 h-10 text-white animate-pulse" />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-extrabold text-slate-900">AI Đang Thiết Kế Giáo Án GDPT 2018</h3>
              <p className="text-xs text-rose-700 font-bold min-h-[36px] flex items-center justify-center px-4">
                {loadingStepsText[loadingStep]}
              </p>
            </div>

            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-pink-500 to-rose-600 h-full transition-all duration-500 ease-out"
                style={{ width: `${((loadingStep + 1) / loadingStepsText.length) * 100}%` }}
              ></div>
            </div>

            <p className="text-[11px] text-slate-500 font-medium">
              Quá trình này mất khoảng 10-15 giây để đảm bảo tuân thủ đầy đủ Công văn 5512/BGDĐT-GDTrH.
            </p>
          </div>
        </div>
      )}

      {/* Success Modal: Soạn xong giáo án & Nút Tải Word */}
      {completedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/75 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white border-2 border-emerald-500/80 p-5 sm:p-7 rounded-3xl max-w-xl w-full text-slate-800 shadow-2xl space-y-5 relative max-h-[92vh] overflow-y-auto">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => {
                onSuccessGenerated(completedPlan);
                setCompletedPlan(null);
              }}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Đóng và xem chi tiết giáo án"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-100/60 rounded-full blur-3xl pointer-events-none"></div>

            <div className="text-center space-y-2.5 pt-2">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-inner border border-emerald-200">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-100/80 text-emerald-800 text-xs font-extrabold">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Hoàn tất soạn giáo án chuẩn 5512 & GDPT 2018</span>
              </div>
              <h2 className="text-xl md:text-2xl font-black text-slate-900">
                Đã Soạn Xong Kế Hoạch Bài Dạy!
              </h2>
            </div>

            {/* Plan Info Card */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-500">
                <span className="font-bold text-slate-700">Môn & Khối lớp:</span>
                <span className="font-bold text-rose-700">{completedPlan.generalInfo.subject} • {completedPlan.generalInfo.grade}</span>
              </div>
              <div className="flex items-center justify-between text-slate-500">
                <span className="font-bold text-slate-700">Bài học:</span>
                <span className="font-bold text-slate-900 text-right max-w-[280px] truncate">{completedPlan.generalInfo.lessonTitle}</span>
              </div>
              <div className="flex items-center justify-between text-slate-500">
                <span className="font-bold text-slate-700">Bộ sách & Thời lượng:</span>
                <span>{completedPlan.generalInfo.textbook} • {completedPlan.generalInfo.duration}</span>
              </div>
              <div className="flex items-center justify-between text-slate-500 pt-1 border-t border-slate-200/80">
                <span className="font-bold text-slate-700">Tích hợp:</span>
                <span className="text-emerald-700 font-bold">Trí tuệ nhân tạo (AI) • Ma trận Năng lực số • STEM</span>
              </div>
            </div>

            {/* Download Status Toast */}
            {downloadSuccessToast && (
              <div className="p-3.5 bg-emerald-50 border-2 border-emerald-400 rounded-2xl flex items-center space-x-2.5 text-xs text-emerald-950 font-bold animate-in fade-in">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>File Word (.docx) đã được xuất về máy thành công! Thầy/Cô có thể bấm tải lại bất cứ lúc nào bên dưới.</span>
              </div>
            )}

            {/* Primary Action: Nút Tải file Word (.docx) & Lưu Google Drive */}
            <div className="space-y-3 pt-1">
              <button
                type="button"
                onClick={handleDownloadWordNow}
                disabled={isExportingWord}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-700 hover:to-teal-700 active:scale-98 text-white font-black text-base flex items-center justify-center space-x-3 shadow-xl shadow-emerald-600/35 ring-4 ring-emerald-400/30 transition-all cursor-pointer border border-emerald-400"
              >
                {isExportingWord ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Đang đóng gói file Word (.docx)...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-6 h-6 text-white shrink-0 animate-bounce" />
                    <div className="text-left">
                      <div className="text-sm sm:text-base font-black leading-tight">Tải Giáo Án Word (.docx) Về Máy</div>
                      <div className="text-[11px] font-normal text-emerald-100">Chuẩn CV 5512, tích hợp AI, Năng lực số & Rubric</div>
                    </div>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleSaveToDriveNow}
                disabled={isSavingToDrive}
                className="w-full py-3.5 px-6 rounded-2xl bg-sky-600 hover:bg-sky-700 active:scale-98 text-white font-extrabold text-sm flex items-center justify-center space-x-2.5 shadow-md shadow-sky-600/20 transition-all cursor-pointer border border-sky-500"
              >
                {isSavingToDrive ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Đang tải lên Google Drive...</span>
                  </>
                ) : (
                  <>
                    <Cloud className="w-5 h-5 text-white shrink-0" />
                    <span>Lưu Trực Tiếp Vào Google Drive (.docx)</span>
                  </>
                )}
              </button>

              {openGmailWithPlan && (
                <button
                  type="button"
                  onClick={() => {
                    openGmailWithPlan(completedPlan);
                    onSuccessGenerated(completedPlan);
                    setCompletedPlan(null);
                  }}
                  className="w-full py-3.5 px-6 rounded-2xl bg-red-600 hover:bg-red-700 active:scale-98 text-white font-extrabold text-sm flex items-center justify-center space-x-2.5 shadow-md shadow-red-600/20 transition-all cursor-pointer border border-red-500"
                >
                  <Mail className="w-5 h-5 text-white shrink-0" />
                  <span>Gửi Giáo Án Này Qua Gmail Ngay</span>
                </button>
              )}

              {driveSavedLink && (
                <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl flex items-center justify-between text-xs text-sky-900 font-semibold animate-in fade-in">
                  <span className="flex items-center gap-1.5 truncate">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="truncate">Đã lưu vào thư mục &quot;KHBD Chuẩn GDPT 2018&quot;!</span>
                  </span>
                  <a
                    href={driveSavedLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 px-2.5 py-1 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-[11px] font-bold flex items-center space-x-1 shrink-0"
                  >
                    <span>Mở Drive</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}

              {driveSaveError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-semibold">
                  {driveSaveError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    onSuccessGenerated(completedPlan);
                    setCompletedPlan(null);
                  }}
                  className="py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-98 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-md transition-all cursor-pointer"
                >
                  <Eye className="w-4 h-4" />
                  <span>Xem & Chỉnh Sửa Kế Hoạch</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onSuccessGenerated(completedPlan);
                    onCancel();
                    setCompletedPlan(null);
                  }}
                  className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer border border-slate-200"
                >
                  <span>Lưu & Về Danh Sách</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
