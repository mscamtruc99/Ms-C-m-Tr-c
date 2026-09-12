import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  FileText,
  Plus,
  Search,
  Filter,
  Trash2,
  Eye,
  Download,
  Cpu,
  Compass,
  Award,
  Layers,
  GraduationCap,
  Laptop,
  Cloud,
  Mail,
  ExternalLink,
  Globe,
  Sparkles,
  Copy,
  CheckCircle2,
  Lightbulb,
} from 'lucide-react';
import { LessonPlan, Subject, Grade } from '../types';
import { exportLessonPlanToDocx } from '../utils/docxExporter';
import { getPlanTeacherDisplay } from '../utils/teacherUtils';

interface DashboardProps {
  plans: LessonPlan[];
  samplePlans?: LessonPlan[];
  onSelectPlan: (plan: LessonPlan) => void;
  onNewPlan: () => void;
  onDeletePlan: (id: string) => void;
  onClonePlan?: (plan: LessonPlan) => void;
  openPromptLibrary?: () => void;
  openGuidelines?: () => void;
  openGoogleDrive?: () => void;
  onSavePlanToDrive?: (plan: LessonPlan) => void;
  openGmail?: () => void;
  onSendPlanViaGmail?: (plan: LessonPlan) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  plans,
  samplePlans = [],
  onSelectPlan,
  onNewPlan,
  onDeletePlan,
  onClonePlan,
  openPromptLibrary,
  openGuidelines,
  openGoogleDrive,
  onSavePlanToDrive,
  openGmail,
  onSendPlanViaGmail,
}) => {
  // Tab state: 'all' | 'sample'
  const [activeTab, setActiveTab] = useState<'all' | 'sample'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('Tất cả');
  const [customSubjectFilter, setCustomSubjectFilter] = useState<string>('');
  const [selectedGrade, setSelectedGrade] = useState<string>('Tất cả');
  const [selectedTextbook, setSelectedTextbook] = useState<string>('Tất cả');
  const [integrationFilter, setIntegrationFilter] = useState<string>('Tất cả');
  const [quickFilter, setQuickFilter] = useState<string>('Tất cả');

  // Mark plans
  const userPlans = useMemo(() => plans.filter((p) => !p.isSample), [plans]);
  const samplePlansList = useMemo(() => samplePlans, [samplePlans]);

  // Combined pool based on activeTab
  const currentPool = useMemo(() => {
    if (activeTab === 'sample') return samplePlansList;
    // 'all': Show user plans first, then sample plans
    return [...userPlans, ...samplePlansList];
  }, [activeTab, userPlans, samplePlansList]);

  // Stats
  const totalUserPlans = userPlans.length;
  const totalSamplePlans = samplePlansList.length;
  const digCompCount = currentPool.filter((p) => p.digitalCompetencyMatrix?.length > 0).length;
  const aiCount = currentPool.filter((p) => p.aiIntegrationDetail?.tools?.length > 0).length;
  const stemCount = currentPool.filter((p) => p.stemDetail?.realWorldProblem).length;

  const ALL_STANDARD_SUBJECTS = [
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
  ];

  const subjectsFilterList = [
    'Tất cả',
    ...Array.from(
      new Set([...ALL_STANDARD_SUBJECTS, ...currentPool.map((p) => p.generalInfo.subject)])
    ),
    'Môn khác (Tự nhập...)',
  ];
  const gradesFilterList = ['Tất cả', 'Lớp 6', 'Lớp 7', 'Lớp 8', 'Lớp 9'];
  const textbooksFilterList = [
    'Tất cả',
    'Kết nối tri thức với cuộc sống',
    'Chân trời sáng tạo',
    'Cánh diều',
  ];

  const filteredPlans = useMemo(() => {
    return currentPool.filter((p) => {
      // Search matches
      const matchesSearch =
        p.generalInfo.lessonTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.generalInfo.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.teacherInfo?.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.sampleBadge && p.sampleBadge.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.generalInfo.textbook && p.generalInfo.textbook.toLowerCase().includes(searchTerm.toLowerCase()));

      // Subject filter
      const matchesSubject =
        selectedSubject === 'Tất cả'
          ? true
          : selectedSubject === 'Môn khác (Tự nhập...)'
          ? p.generalInfo.subject.toLowerCase().includes(customSubjectFilter.toLowerCase().trim())
          : p.generalInfo.subject === selectedSubject;

      // Grade filter
      const matchesGrade = selectedGrade === 'Tất cả' || p.generalInfo.grade === selectedGrade;

      // Textbook filter
      const matchesTextbook =
        selectedTextbook === 'Tất cả' ||
        (p.generalInfo.textbook &&
          p.generalInfo.textbook.toLowerCase().includes(selectedTextbook.toLowerCase()));

      // Integration filter
      const matchesIntegration =
        integrationFilter === 'Tất cả'
          ? true
          : integrationFilter === 'digcomp'
          ? p.digitalCompetencyMatrix?.length > 0
          : integrationFilter === 'ai'
          ? p.aiIntegrationDetail?.tools?.length > 0
          : integrationFilter === 'stem'
          ? !!p.stemDetail?.realWorldProblem
          : true;

      // Quick shortcut pills
      let matchesQuick = true;
      if (quickFilter === 'kntt') {
        matchesQuick = p.generalInfo.textbook?.toLowerCase().includes('kết nối') ?? true;
      } else if (quickFilter === 'k6') {
        matchesQuick = p.generalInfo.grade === 'Lớp 6';
      } else if (quickFilter === 'k7') {
        matchesQuick = p.generalInfo.grade === 'Lớp 7';
      } else if (quickFilter === 'k8') {
        matchesQuick = p.generalInfo.grade === 'Lớp 8';
      } else if (quickFilter === 'k9') {
        matchesQuick = p.generalInfo.grade === 'Lớp 9';
      } else if (quickFilter === 'toan') {
        matchesQuick = p.generalInfo.subject.toLowerCase().includes('toán');
      } else if (quickFilter === 'van') {
        matchesQuick = p.generalInfo.subject.toLowerCase().includes('ngữ văn') || p.generalInfo.subject.toLowerCase().includes('văn');
      } else if (quickFilter === 'ta') {
        matchesQuick = p.generalInfo.subject.toLowerCase().includes('tiếng anh');
      } else if (quickFilter === 'khtn') {
        matchesQuick = p.generalInfo.subject.toLowerCase().includes('khoa học tự nhiên');
      } else if (quickFilter === 'lsdl') {
        matchesQuick = p.generalInfo.subject.toLowerCase().includes('lịch sử');
      } else if (quickFilter === 'tin') {
        matchesQuick = p.generalInfo.subject.toLowerCase().includes('tin học');
      } else if (quickFilter === 'cn') {
        matchesQuick = p.generalInfo.subject.toLowerCase().includes('công nghệ');
      } else if (quickFilter === 'gdcd') {
        matchesQuick = p.generalInfo.subject.toLowerCase().includes('giáo dục công dân');
      } else if (quickFilter === 'hdtn') {
        matchesQuick = p.generalInfo.subject.toLowerCase().includes('hoạt động trải nghiệm');
      }

      return matchesSearch && matchesSubject && matchesGrade && matchesTextbook && matchesIntegration && matchesQuick;
    });
  }, [
    currentPool,
    searchTerm,
    selectedSubject,
    customSubjectFilter,
    selectedGrade,
    selectedTextbook,
    integrationFilter,
    quickFilter,
  ]);

  return (
    <div className="max-w-7xl mx-auto space-y-7 pb-16">
      {/* Hero Welcome Banner */}
      <div className="p-7 md:p-8 bg-gradient-to-r from-emerald-100 via-green-100 to-teal-100 rounded-3xl border border-emerald-300/80 shadow-sm relative overflow-hidden text-slate-800">
        <div className="absolute -top-12 -right-12 w-80 h-80 bg-emerald-200/40 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <h1 className="text-2xl md:text-3xl font-black text-emerald-950 tracking-tight leading-snug">
              <a
                href="https://hoclieu.vn/"
                target="_blank"
                rel="noopener noreferrer"
                title="Truy cập Học liệu số: https://hoclieu.vn/"
                className="hover:text-emerald-700 transition-colors inline-flex items-center gap-2 group cursor-pointer"
              >
                <span>Ms Cẩm Trúc - KHBD CHUẨN 5512</span>
                <ExternalLink className="w-5 h-5 text-emerald-700/60 group-hover:text-emerald-800 transition-colors" />
              </a>
            </h1>
            <p className="text-xs md:text-sm text-emerald-900 font-medium">
              Hệ thống quản lý giáo án đã soạn và kho giáo án mẫu chuẩn Công văn 5512 (GDPT 2018) cho Tiếng Anh 7, 8, 9 Global Success và các môn học.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-2.5">
              <button
                onClick={onNewPlan}
                className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-200 flex items-center space-x-2 transition-transform active:scale-95 border border-emerald-600 cursor-pointer"
              >
                <Plus className="w-4 h-4 text-white" />
                <span>Soạn KHBD Mới Bằng AI</span>
              </button>

              <a
                href="https://hoclieu.vn/"
                target="_blank"
                rel="noopener noreferrer"
                title="Truy cập kho Học liệu số: https://hoclieu.vn/"
                className="px-4 py-2.5 rounded-2xl bg-white hover:bg-amber-50 text-amber-900 font-bold text-xs shadow-sm border border-amber-300 flex items-center space-x-2 transition-transform active:scale-95 cursor-pointer group"
              >
                <Globe className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
                <span className="group-hover:underline">https://hoclieu.vn</span>
                <ExternalLink className="w-3.5 h-3.5 text-amber-600" />
              </a>

              {openGoogleDrive && (
                <button
                  type="button"
                  onClick={openGoogleDrive}
                  className="px-4 py-2.5 rounded-2xl bg-white hover:bg-sky-50 text-sky-800 font-extrabold text-xs shadow-sm border border-sky-300 flex items-center space-x-2 transition-transform active:scale-95 cursor-pointer"
                >
                  <Cloud className="w-4 h-4 text-sky-600" />
                  <span>Google Drive</span>
                </button>
              )}

              {openGmail && (
                <button
                  type="button"
                  onClick={openGmail}
                  className="px-4 py-2.5 rounded-2xl bg-white hover:bg-rose-50 text-rose-800 font-extrabold text-xs shadow-sm border border-rose-300 flex items-center space-x-2 transition-transform active:scale-95 cursor-pointer"
                >
                  <Mail className="w-4 h-4 text-red-600" />
                  <span>Gmail</span>
                </button>
              )}
            </div>
          </div>

          {/* Key Metrics Cards */}
          <div className="grid grid-cols-3 gap-2.5 w-full lg:w-auto shrink-0">
            <div
              onClick={() => setActiveTab('sample')}
              className={`p-3.5 rounded-2xl text-center space-y-0.5 shadow-xs cursor-pointer transition-all border ${
                activeTab === 'sample'
                  ? 'bg-amber-600 text-white border-amber-700'
                  : 'bg-white/90 border-amber-200/80 hover:border-amber-400 text-slate-800'
              }`}
            >
              <span className={`text-xl md:text-2xl font-black ${activeTab === 'sample' ? 'text-white' : 'text-amber-700'}`}>
                {totalSamplePlans}
              </span>
              <p className={`text-[10px] font-bold uppercase ${activeTab === 'sample' ? 'text-amber-100' : 'text-slate-500'}`}>
                Mẫu Gợi Ý
              </p>
            </div>

            <div className="p-3.5 bg-white/90 border border-cyan-200/80 rounded-2xl text-center space-y-0.5 shadow-xs">
              <span className="text-xl md:text-2xl font-black text-cyan-700">{digCompCount}</span>
              <p className="text-[10px] text-slate-500 font-bold uppercase">Năng Lực Số</p>
            </div>

            <div className="p-3.5 bg-white/90 border border-purple-200/80 rounded-2xl text-center space-y-0.5 shadow-xs">
              <span className="text-xl md:text-2xl font-black text-purple-700">{aiCount}</span>
              <p className="text-[10px] text-slate-500 font-bold uppercase">Tích Hợp AI</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Section: Segmented Tabs (Tất cả / Kho giáo án mẫu gợi ý) */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          {/* Tabs switch */}
          <div className="inline-flex p-1.5 bg-slate-100 rounded-2xl border border-slate-200 text-xs font-bold gap-1 w-full md:w-auto">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-xl transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-white text-emerald-800 shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Tất Cả ({totalUserPlans + totalSamplePlans})</span>
            </button>

            <button
              onClick={() => setActiveTab('sample')}
              className={`px-4 py-2 rounded-xl transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                activeTab === 'sample'
                  ? 'bg-amber-500 text-white shadow-xs font-black'
                  : 'text-amber-800 hover:text-amber-950 hover:bg-amber-100/60'
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-200" />
              <span>💡 Kho Giáo Án Mẫu & Gợi Ý ({totalSamplePlans})</span>
            </button>
          </div>

          {/* Quick info note */}
          <div className="text-xs text-slate-500 flex items-center space-x-1.5">
            <Award className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">
              {activeTab === 'sample'
                ? 'Kho Kế hoạch bài dạy mẫu chuẩn 5512 đầy đủ tất cả các môn học Khối 6, 7, 8, 9 theo bộ sách Kết nối tri thức với cuộc sống.'
                : 'Hiển thị đầy đủ danh sách Kế hoạch bài dạy và Kho giáo án mẫu gợi ý chuẩn 5512 (Khối 6, 7, 8, 9).'}
            </span>
          </div>
        </div>

        {/* Quick Filter Tag Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] font-bold text-slate-500 mr-1 flex items-center space-x-1">
            <Filter className="w-3 h-3 text-slate-400" />
            <span>Lọc nhanh:</span>
          </span>
          {[
            { id: 'Tất cả', label: 'Tất cả bài học' },
            { id: 'kntt', label: '📚 Bộ Sách Kết Nối Tri Thức' },
            { id: 'k6', label: 'Lớp 6' },
            { id: 'k7', label: 'Lớp 7' },
            { id: 'k8', label: 'Lớp 8' },
            { id: 'k9', label: 'Lớp 9' },
            { id: 'toan', label: 'Toán học (6-9)' },
            { id: 'van', label: 'Ngữ văn (6-9)' },
            { id: 'ta', label: 'Tiếng Anh (6-9)' },
            { id: 'khtn', label: 'KHTN (6-9)' },
            { id: 'lsdl', label: 'Lịch sử & Địa lí (6-9)' },
            { id: 'tin', label: 'Tin học (6-9)' },
            { id: 'cn', label: 'Công nghệ (6-9)' },
            { id: 'gdcd', label: 'GDCD (6-9)' },
            { id: 'hdtn', label: 'HĐTN (6-9)' },
          ].map((tag) => (
            <button
              key={tag.id}
              onClick={() => setQuickFilter(tag.id)}
              className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                quickFilter === tag.id
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              {tag.label}
            </button>
          ))}
        </div>

        {/* Search & Detail Filters Bar */}
        <div className="flex flex-col lg:flex-row gap-3 pt-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm theo tên bài học (Bài 1, Unit 1...), chủ đề, môn học, giáo viên, bộ sách..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-emerald-500 font-medium"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="flex items-center space-x-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
              <span className="text-slate-600 font-medium">Bộ sách:</span>
              <select
                value={selectedTextbook}
                onChange={(e) => setSelectedTextbook(e.target.value)}
                className="bg-transparent text-slate-800 font-semibold focus:outline-none cursor-pointer max-w-[170px] truncate"
              >
                {textbooksFilterList.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-slate-600 font-medium">Tích hợp:</span>
              <select
                value={integrationFilter}
                onChange={(e) => setIntegrationFilter(e.target.value)}
                className="bg-transparent text-slate-800 font-semibold focus:outline-none cursor-pointer"
              >
                <option value="Tất cả">Tất cả</option>
                <option value="digcomp" className="text-cyan-700">
                  Năng Lực Số (DigComp)
                </option>
                <option value="ai" className="text-purple-700">
                  Tích Hợp AI
                </option>
                <option value="stem" className="text-amber-700">
                  Tích Hợp STEM
                </option>
              </select>
            </div>

            <div className="flex items-center space-x-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
              <span className="text-slate-600 font-medium">Môn:</span>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="bg-transparent text-slate-800 font-semibold focus:outline-none cursor-pointer max-w-[150px] truncate"
              >
                {subjectsFilterList.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {selectedSubject === 'Môn khác (Tự nhập...)' && (
              <input
                type="text"
                value={customSubjectFilter}
                onChange={(e) => setCustomSubjectFilter(e.target.value)}
                placeholder="Tên môn..."
                className="px-3 py-1.5 bg-slate-50 border border-emerald-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-emerald-500 font-medium"
              />
            )}

            <div className="flex items-center space-x-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
              <span className="text-slate-600 font-medium">Lớp:</span>
              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                className="bg-transparent text-slate-800 font-semibold focus:outline-none cursor-pointer"
              >
                {gradesFilterList.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Plans Grid */}
      {filteredPlans.length === 0 ? (
        <div className="py-16 bg-white border border-slate-200 rounded-3xl text-center space-y-4 shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <BookOpen className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900">Không Tìm Thấy Giáo Án Phù Hợp</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              {activeTab === 'user'
                ? 'Thầy/Cô chưa có giáo án tự soạn phù hợp bộ lọc. Thầy/Cô có thể bấm "Soạn KHBD Mới" hoặc chuyển sang tab "Kho Giáo Án Mẫu & Gợi Ý" để chọn dùng các mẫu có sẵn.'
                : 'Thử thay đổi từ khóa tìm kiếm hoặc chọn lại bộ lọc môn học và lớp.'}
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={onNewPlan}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md inline-flex items-center space-x-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Soạn Giáo Án Mới Bằng AI</span>
            </button>
            {activeTab !== 'sample' && (
              <button
                onClick={() => setActiveTab('sample')}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md inline-flex items-center space-x-1.5 cursor-pointer"
              >
                <Lightbulb className="w-4 h-4" />
                <span>Xem Kho Giáo Án Mẫu</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPlans.map((plan) => {
            const isSamplePlan = plan.isSample;

            return (
              <div
                key={plan.id}
                className={`p-5 bg-white border rounded-2xl transition-all shadow-xs hover:shadow-md flex flex-col justify-between group ${
                  isSamplePlan
                    ? 'border-amber-200/90 hover:border-amber-400 bg-gradient-to-b from-amber-50/20 to-white'
                    : 'border-slate-200/90 hover:border-emerald-300'
                }`}
              >
                <div className="space-y-3">
                  {/* Category Badge & Subject & Grade */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                      <span className="px-2.5 py-0.5 text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg">
                        {plan.generalInfo.subject}
                      </span>
                      <span className="px-2 py-0.5 text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200 rounded-lg">
                        {plan.generalInfo.grade}
                      </span>
                      {plan.generalInfo.textbook && (
                        <span
                          className="px-2 py-0.5 text-[10px] font-medium bg-blue-50 text-blue-800 border border-blue-200 rounded-lg max-w-[150px] truncate"
                          title={plan.generalInfo.textbook}
                        >
                          📖 {plan.generalInfo.textbook}
                        </span>
                      )}
                    </div>

                    {isSamplePlan ? (
                      <span className="px-2.5 py-0.5 text-[10px] font-black text-amber-800 bg-amber-100/80 border border-amber-300 rounded-full flex items-center space-x-1 shrink-0">
                        <Lightbulb className="w-3 h-3 text-amber-600" />
                        <span>Mẫu Chuẩn 5512</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 rounded-full flex items-center space-x-1 shrink-0">
                        <CheckCircle2 className="w-3 h-3 text-rose-600" />
                        <span>Đã Soạn</span>
                      </span>
                    )}
                  </div>

                  {/* Specific Sample Badge if present */}
                  {plan.sampleBadge && (
                    <div className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/70 inline-block">
                      ★ {plan.sampleBadge}
                    </div>
                  )}

                  {/* Lesson Title */}
                  <div>
                    <h3
                      onClick={() => onSelectPlan(plan)}
                      className="font-bold text-base text-slate-900 hover:text-emerald-700 cursor-pointer line-clamp-2 leading-snug transition-colors"
                      title={plan.generalInfo.lessonTitle}
                    >
                      {plan.generalInfo.lessonTitle}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-1 mt-1 font-medium">
                      {plan.generalInfo.topic}
                    </p>
                  </div>

                  {/* Author / Teacher & Duration */}
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                    <span className="truncate max-w-[170px] font-medium">
                      GV: {getPlanTeacherDisplay(plan)}
                    </span>
                    <span className="font-semibold text-slate-600">
                      {plan.generalInfo.duration}
                    </span>
                  </div>

                  {/* Badges for Digital Competency, AI & STEM */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {plan.digitalCompetencyMatrix?.length > 0 && (
                      <span className="px-2 py-0.5 text-[10px] bg-cyan-50 text-cyan-700 border border-cyan-200 rounded-md font-semibold flex items-center space-x-1">
                        <Laptop className="w-3 h-3 text-cyan-600" />
                        <span>Năng Lực Số ({plan.digitalCompetencyMatrix.length})</span>
                      </span>
                    )}

                    {plan.aiIntegrationDetail?.tools?.length > 0 && (
                      <span className="px-2 py-0.5 text-[10px] bg-purple-50 text-purple-700 border border-purple-200 rounded-md font-semibold flex items-center space-x-1">
                        <Cpu className="w-3 h-3 text-purple-600" />
                        <span>AI Literacy</span>
                      </span>
                    )}

                    {plan.stemDetail?.realWorldProblem && (
                      <span className="px-2 py-0.5 text-[10px] bg-amber-50 text-amber-700 border border-amber-200 rounded-md font-semibold flex items-center space-x-1">
                        <Compass className="w-3 h-3 text-amber-600" />
                        <span>STEM</span>
                      </span>
                    )}

                    <span className="px-2 py-0.5 text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md font-semibold">
                      Chuẩn 5512
                    </span>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs gap-2">
                  <span className="text-[10px] text-slate-500 truncate max-w-[110px] font-medium">
                    {plan.generalInfo.textbook}
                  </span>

                  <div className="flex items-center space-x-1.5 shrink-0">
                    {/* If it's a sample plan: Provide "Dùng Mẫu Này / Nhân Bản" */}
                    {isSamplePlan && onClonePlan && (
                      <button
                        onClick={() => onClonePlan(plan)}
                        className="px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-bold flex items-center space-x-1 shadow-xs transition-transform active:scale-95 cursor-pointer"
                        title="Sao chép bài mẫu này vào danh sách giáo án của Thầy/Cô để tự do chỉnh sửa"
                      >
                        <Sparkles className="w-3 h-3 text-white" />
                        <span>Dùng Mẫu Này</span>
                      </button>
                    )}

                    {/* Word Download */}
                    <button
                      onClick={() => exportLessonPlanToDocx(plan)}
                      className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold flex items-center space-x-1 shadow-xs transition-all cursor-pointer"
                      title="Tải Giáo án Word (.docx) về máy"
                    >
                      <Download className="w-3.5 h-3.5 text-white" />
                      <span>Tải Word</span>
                    </button>

                    {/* View Button */}
                    <button
                      onClick={() => onSelectPlan(plan)}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-semibold text-[11px] flex items-center space-x-1 shadow-xs cursor-pointer"
                      title="Xem toàn bộ nội dung giáo án"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Xem</span>
                    </button>

                    {/* Actions for User's own plans: Save to Drive, Gmail, Delete */}
                    {!isSamplePlan && (
                      <>
                        {onSavePlanToDrive && (
                          <button
                            onClick={() => onSavePlanToDrive(plan)}
                            className="p-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 transition-colors cursor-pointer"
                            title="Lưu vào Google Drive (.docx)"
                          >
                            <Cloud className="w-3.5 h-3.5 text-sky-600" />
                          </button>
                        )}

                        <button
                          onClick={() => {
                            if (confirm('Thầy/Cô có chắc chắn muốn xóa giáo án này khỏi danh sách?')) {
                              onDeletePlan(plan.id);
                            }
                          }}
                          className="p-1.5 rounded-xl bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 transition-colors cursor-pointer"
                          title="Xóa giáo án này"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
