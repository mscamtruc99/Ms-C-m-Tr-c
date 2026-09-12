import React from 'react';
import { User, GraduationCap, LogOut, Users, Plus, FolderKanban, Globe, Cloud, Mail, ExternalLink } from 'lucide-react';
import { TeacherProfile, AppLanguage } from '../types';

interface NavbarProps {
  currentView: 'dashboard' | 'generator' | 'detail';
  setCurrentView: (view: 'dashboard' | 'generator' | 'detail') => void;
  teacherProfile: TeacherProfile;
  userEmail?: string;
  language?: AppLanguage;
  onLanguageChange?: (lang: AppLanguage) => void;
  openTeacherProfile: () => void;
  openPromptLibrary?: () => void;
  openGuidelines?: () => void;
  openLoginHistory?: () => void;
  openGoogleDrive?: () => void;
  openGmail?: () => void;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
  teacherProfile,
  userEmail,
  language = 'Vietnamese',
  onLanguageChange,
  openTeacherProfile,
  openPromptLibrary,
  openGuidelines,
  openLoginHistory,
  openGoogleDrive,
  openGmail,
  onLogout,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-rose-100 text-slate-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <div className="flex items-center space-x-3 shrink-0">
          <button
            type="button"
            onClick={() => setCurrentView('dashboard')}
            title="Về Trang chủ"
            className="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-600 via-rose-500 to-amber-500 flex items-center justify-center shadow-md shadow-rose-200 hover:scale-105 transition-transform cursor-pointer shrink-0"
          >
            <GraduationCap className="w-6 h-6 text-white" />
          </button>
          <a
            href="https://hoclieu.vn/"
            target="_blank"
            rel="noopener noreferrer"
            title="Truy cập Học liệu số: https://hoclieu.vn/"
            className="group flex items-center space-x-1.5 cursor-pointer py-1 whitespace-nowrap"
          >
            <span className="font-bold text-base sm:text-lg text-slate-900 group-hover:text-rose-600 transition-colors tracking-tight">
              Ms Cẩm Trúc-KHBD CHUẨN
            </span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-600 transition-colors" />
          </a>
        </div>

        {/* Center / Action Navigation */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCurrentView('dashboard')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer whitespace-nowrap ${
              currentView === 'dashboard'
                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                : 'text-slate-600 hover:text-rose-700 hover:bg-rose-50/60'
            }`}
          >
            <FolderKanban className="w-4 h-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </button>

          <button
            onClick={() => setCurrentView('generator')}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-200 flex items-center space-x-1.5 transition-all transform active:scale-95 cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>Soạn KHBD</span>
          </button>

          {/* Link hoclieu.vn kế chữ Soạn KHBD */}
          <a
            href="https://hoclieu.vn/"
            target="_blank"
            rel="noopener noreferrer"
            title="Truy cập kho Học liệu số: https://hoclieu.vn/"
            className="px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300/90 text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer shadow-2xs group whitespace-nowrap"
          >
            <Globe className="w-3.5 h-3.5 text-amber-600 group-hover:scale-110 transition-transform shrink-0" />
            <span className="font-semibold text-amber-900 group-hover:text-amber-950 group-hover:underline">
              https://hoclieu.vn
            </span>
            <ExternalLink className="w-3 h-3 text-amber-600 shrink-0" />
          </a>

          {openGoogleDrive && (
            <button
              onClick={openGoogleDrive}
              className="px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 shadow-2xs"
              title="Đồng bộ & Lưu trữ Google Drive"
            >
              <Cloud className="w-4 h-4 text-sky-600" />
              <span className="hidden sm:inline">Google Drive</span>
            </button>
          )}

          {openGmail && (
            <button
              onClick={openGmail}
              className="px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 shadow-2xs"
              title="Gửi KHBD qua Gmail"
            >
              <Mail className="w-4 h-4 text-red-600" />
              <span className="hidden sm:inline">Gmail</span>
            </button>
          )}
        </div>

        {/* Right Action Menu: Language, History, Teacher Profile & Logout */}
        <div className="flex items-center space-x-2">
          {/* Language Selector Button */}
          <div className="flex items-center p-1 bg-slate-100/90 border border-slate-200/90 rounded-xl text-xs font-bold shadow-2xs">
            <div className="flex items-center space-x-1 px-1.5 text-slate-500 text-[11px] font-bold">
              <Globe className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              <span className="hidden md:inline">Ngôn ngữ:</span>
            </div>
            <button
              type="button"
              onClick={() => onLanguageChange?.('Vietnamese')}
              className={`px-2 py-1 rounded-lg text-xs transition-all cursor-pointer ${
                language === 'Vietnamese'
                  ? 'bg-white text-rose-700 shadow-xs font-extrabold border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900 font-medium'
              }`}
            >
              Vietnamese
            </button>
            <button
              type="button"
              onClick={() => onLanguageChange?.('English')}
              className={`px-2 py-1 rounded-lg text-xs transition-all cursor-pointer ${
                language === 'English'
                  ? 'bg-white text-rose-700 shadow-xs font-extrabold border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900 font-medium'
              }`}
            >
              English
            </button>
          </div>

          {openLoginHistory && (
            <button
              onClick={openLoginHistory}
              className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-colors shadow-2xs flex items-center space-x-1.5 cursor-pointer"
              title="Xem danh sách tài khoản đã sử dụng app"
            >
              <Users className="w-4 h-4 text-rose-600" />
              <span className="hidden lg:inline">History</span>
            </button>
          )}

          <button
            onClick={openTeacherProfile}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-sm text-slate-800 transition-colors shadow-2xs cursor-pointer"
            title="Cấu hình thông tin Giáo viên"
          >
            <div className="w-7 h-7 rounded-full bg-rose-600 text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
              {teacherProfile.fullName ? teacherProfile.fullName.charAt(0) : 'L'}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-bold leading-tight text-slate-900">
                {teacherProfile.fullName || 'Lê Thị Cẩm Trúc'}
              </p>
              <p className="text-[10px] text-slate-500 font-medium leading-tight">
                ({userEmail || 'mscamtruc99@gmail.com'})
              </p>
            </div>
          </button>

          {onLogout && (
            <button
              onClick={onLogout}
              className="p-2 rounded-xl bg-slate-50 hover:bg-red-50 text-slate-500 hover:text-red-600 border border-slate-200 hover:border-red-200 transition-colors"
              title="Đăng xuất"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
