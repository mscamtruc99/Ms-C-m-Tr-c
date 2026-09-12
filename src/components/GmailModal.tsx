import React, { useState, useEffect } from 'react';
import {
  Mail,
  X,
  Send,
  FileCheck2,
  Paperclip,
  CheckCircle2,
  AlertTriangle,
  LogOut,
  Loader2,
  FileText,
  User,
  Inbox,
  ExternalLink,
  Save,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  isGmailConnected,
  signInWithGmail,
  signOutGmail,
  getGmailProfile,
  sendLessonPlanEmail,
  createLessonPlanDraft,
  listRecentGmailMessages,
  GmailProfile,
  GmailMessageItem,
} from '../services/gmailService';
import { LessonPlan, TeacherProfile } from '../types';
import { auth } from '../services/googleDriveService';

interface GmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan?: LessonPlan | null;
  teacherProfile?: TeacherProfile;
}

export const GmailModal: React.FC<GmailModalProps> = ({
  isOpen,
  onClose,
  currentPlan,
  teacherProfile,
}) => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [profile, setProfile] = useState<GmailProfile | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [activeTab, setActiveTab] = useState<'compose' | 'history'>('compose');

  // Compose Email State
  const [recipient, setRecipient] = useState('');
  const [cc, setCc] = useState('');
  const [showCc, setShowCc] = useState(false);
  const [subject, setSubject] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [attachDocx, setAttachDocx] = useState(true);

  // Status & Notifications
  const [isSending, setIsSending] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Recent messages list
  const [recentMessages, setRecentMessages] = useState<GmailMessageItem[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  useEffect(() => {
    if (isOpen) {
      checkAuth();
    }
  }, [isOpen]);

  useEffect(() => {
    if (currentPlan) {
      const subjectText = `[KHBD GDPT 2018] ${currentPlan.generalInfo.lessonTitle} - Môn ${currentPlan.generalInfo.subject} ${currentPlan.generalInfo.grade}`;
      setSubject(subjectText);

      const teacherName = teacherProfile?.fullName || currentPlan.teacherInfo?.fullName || 'Lê Thị Cẩm Trúc';
      const schoolName = teacherProfile?.school || currentPlan.teacherInfo?.school || 'THCS';
      const defaultNote = `Kính gửi Ban Giám hiệu / Thầy Cô Tổ trưởng chuyên môn,\n\nEm/Tôi xin gửi Kế hoạch bài dạy (KHBD) chuẩn GDPT 2018 và Công văn 5512/BGDĐT cho bài học: "${currentPlan.generalInfo.lessonTitle}" (${currentPlan.generalInfo.subject} - ${currentPlan.generalInfo.grade}).\n\nKế hoạch đã tích hợp đầy đủ Ma trận Năng lực số, định hướng STEM và bảng tiêu chí Rubric đánh giá 4 mức độ.\n\nKính nhờ Thầy/Cô xem xét và góp ý chuyên môn giúp em/tôi.\nTrân trọng cảm ơn Thầy/Cô!\n\nGiáo viên: ${teacherName} (${schoolName})`;
      setCustomMessage(defaultNote);
    }
  }, [currentPlan, teacherProfile]);

  const checkAuth = async () => {
    if (isGmailConnected() && auth.currentUser) {
      setIsSignedIn(true);
      try {
        const prof = await getGmailProfile();
        setProfile(prof);
      } catch {
        // Fallback
        setProfile({ emailAddress: auth.currentUser.email || '' });
      }
      loadRecentMessages();
    } else {
      setIsSignedIn(false);
      setProfile(null);
    }
  };

  const loadRecentMessages = async () => {
    setIsLoadingMessages(true);
    try {
      const msgs = await listRecentGmailMessages('', 8);
      setRecentMessages(msgs);
    } catch {
      // Ignored
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const handleSignIn = async () => {
    setIsAuthenticating(true);
    setErrorMessage(null);
    try {
      await signInWithGmail();
      setIsSignedIn(true);
      const prof = await getGmailProfile();
      setProfile(prof);
      await loadRecentMessages();
    } catch (err: any) {
      setErrorMessage(err.message || 'Không thể kết nối tài khoản Gmail.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleSignOut = async () => {
    await signOutGmail();
    setIsSignedIn(false);
    setProfile(null);
    setRecentMessages([]);
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPlan) {
      setErrorMessage('Chưa chọn bài giảng để gửi.');
      return;
    }
    if (!recipient.trim()) {
      setErrorMessage('Vui lòng nhập địa chỉ email người nhận.');
      return;
    }

    setIsSending(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await sendLessonPlanEmail({
        to: recipient.trim(),
        cc: cc.trim() || undefined,
        subject: subject.trim(),
        customMessage: customMessage.trim(),
        lessonPlan: currentPlan,
        attachDocx,
      });

      setSuccessMessage(`Đã gửi thành công email giáo án kèm file Word đến: ${recipient.trim()}`);
      loadRecentMessages();
    } catch (err: any) {
      setErrorMessage(err.message || 'Lỗi khi gửi email qua Gmail API.');
    } finally {
      setIsSending(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!currentPlan) return;
    if (!recipient.trim()) {
      setErrorMessage('Vui lòng nhập email người nhận trước khi lưu nháp.');
      return;
    }

    setIsSavingDraft(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await createLessonPlanDraft({
        to: recipient.trim(),
        cc: cc.trim() || undefined,
        subject: subject.trim(),
        customMessage: customMessage.trim(),
        lessonPlan: currentPlan,
        attachDocx,
      });

      setSuccessMessage('Đã lưu bản nháp giáo án vào hòm thư Gmail của bạn!');
    } catch (err: any) {
      setErrorMessage(err.message || 'Lỗi khi lưu bản nháp.');
    } finally {
      setIsSavingDraft(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-red-50/60 via-white to-rose-50/60">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shadow-xs border border-red-200">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <span>Gửi KHBD Qua Gmail</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-red-100 text-red-800 border border-red-200">
                  Google Workspace
                </span>
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Gửi Kế hoạch bài dạy trực tiếp đến Ban Giám hiệu, Tổ trưởng chuyên môn & đồng nghiệp
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs (if signed in) */}
        {isSignedIn && (
          <div className="px-6 border-b border-slate-200 bg-slate-50/50 flex space-x-6 text-xs font-bold">
            <button
              onClick={() => setActiveTab('compose')}
              className={`py-3 border-b-2 flex items-center space-x-1.5 cursor-pointer transition-colors ${
                activeTab === 'compose'
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>Soạn & Gửi Kế Hoạch</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('history');
                loadRecentMessages();
              }}
              className={`py-3 border-b-2 flex items-center space-x-1.5 cursor-pointer transition-colors ${
                activeTab === 'history'
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Inbox className="w-3.5 h-3.5" />
              <span>Hộp Thư Gần Đây ({recentMessages.length})</span>
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Section: Google Account Status */}
          {!isSignedIn ? (
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-4">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-white shadow-xs border border-slate-200 flex items-center justify-center">
                <svg className="w-8 h-8" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              </div>
              <div className="space-y-1">
                <h3 className="font-extrabold text-base text-slate-800">
                  Kết Nối Gmail Của Thầy/Cô
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Đăng nhập tài khoản Google để cấp quyền gửi Kế hoạch bài dạy chuẩn GDPT 2018 và đính kèm file Word trực tiếp từ hòm thư của Thầy/Cô.
                </p>
              </div>

              <button
                type="button"
                onClick={handleSignIn}
                disabled={isAuthenticating}
                className="py-3 px-6 rounded-2xl bg-white hover:bg-slate-100 text-slate-800 font-extrabold text-xs border border-slate-300 shadow-md inline-flex items-center space-x-3 transition-all active:scale-98 cursor-pointer disabled:opacity-50"
              >
                {isAuthenticating ? (
                  <>
                    <Loader2 className="w-4 h-4 text-slate-600 animate-spin" />
                    <span>Đang kết nối Gmail...</span>
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 text-red-600" />
                    <span>Đăng nhập với Google Workspace</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-red-50/60 border border-red-200/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-red-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="font-extrabold text-sm text-slate-900">
                      {auth.currentUser?.displayName || 'Tài khoản Gmail'}
                    </span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <p className="text-xs text-slate-600 font-semibold">{profile?.emailAddress || auth.currentUser?.email}</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <a
                  href="https://mail.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-red-700 border border-red-200 text-xs font-bold flex items-center space-x-1 transition-colors"
                >
                  <span>Mở Gmail Web</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="p-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-500 hover:text-red-600 border border-slate-200 transition-colors cursor-pointer"
                  title="Đăng xuất"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Feedback Messages */}
          {successMessage && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs text-emerald-900 font-semibold animate-in fade-in">
              <div className="flex items-center space-x-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{successMessage}</span>
              </div>
              <a
                href="https://mail.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold shrink-0 ml-2"
              >
                Xem trong Gmail
              </a>
            </div>
          )}

          {errorMessage && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center space-x-2.5 text-xs text-red-800 font-semibold animate-in fade-in">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* TAB 1: COMPOSE EMAIL */}
          {isSignedIn && activeTab === 'compose' && (
            <form onSubmit={handleSendEmail} className="space-y-4">
              {/* Current Lesson Plan Tag */}
              {currentPlan ? (
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center space-x-2.5 overflow-hidden">
                    <FileText className="w-4 h-4 text-red-600 shrink-0" />
                    <div className="truncate">
                      <p className="text-xs font-bold text-slate-800 truncate">
                        {currentPlan.generalInfo.lessonTitle}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {currentPlan.generalInfo.subject} • {currentPlan.generalInfo.grade} • {currentPlan.generalInfo.duration} tiết
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-extrabold shrink-0">
                    Sẵn sàng gửi
                  </span>
                </div>
              ) : (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800 font-semibold">
                  Chưa có Kế hoạch bài dạy nào đang được chọn. Vui lòng mở hoặc soạn một bài dạy trước khi gửi!
                </div>
              )}

              {/* Recipient Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <label htmlFor="gmail-recipient">Người nhận (To): *</label>
                  <button
                    type="button"
                    onClick={() => setShowCc(!showCc)}
                    className="text-slate-500 hover:text-slate-800 text-[11px] font-medium flex items-center gap-0.5 cursor-pointer"
                  >
                    <span>Cc / Bcc</span>
                    {showCc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                </div>
                <input
                  id="gmail-recipient"
                  type="email"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="totruongchuyenmon@edu.vn hoặc bgh@school.edu.vn"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-red-500/30 focus:border-red-500"
                  required
                />

                {/* Quick Suggestion Pills */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-slate-400 font-bold">Gợi ý:</span>
                  {profile?.emailAddress && (
                    <button
                      type="button"
                      onClick={() => setRecipient(profile.emailAddress)}
                      className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-medium cursor-pointer"
                    >
                      Gửi lưu trữ cho chính tôi ({profile.emailAddress})
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setRecipient('totruongchuyenmon@thcs.edu.vn')}
                    className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-medium cursor-pointer"
                  >
                    Tổ trưởng chuyên môn
                  </button>
                </div>
              </div>

              {/* CC Input (Optional) */}
              {showCc && (
                <div className="space-y-1.5 animate-in fade-in">
                  <label htmlFor="gmail-cc" className="block text-xs font-bold text-slate-700">
                    Đồng kính gửi (Cc):
                  </label>
                  <input
                    id="gmail-cc"
                    type="text"
                    value={cc}
                    onChange={(e) => setCc(e.target.value)}
                    placeholder="dongnghiep1@edu.vn, dongnghiep2@edu.vn"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-red-500/30 focus:border-red-500"
                  />
                </div>
              )}

              {/* Subject Input */}
              <div className="space-y-1.5">
                <label htmlFor="gmail-subject" className="block text-xs font-bold text-slate-700">
                  Tiêu đề email:
                </label>
                <input
                  id="gmail-subject"
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-red-500/30 focus:border-red-500 font-semibold"
                  required
                />
              </div>

              {/* Custom Message Note */}
              <div className="space-y-1.5">
                <label htmlFor="gmail-custom-message" className="block text-xs font-bold text-slate-700">
                  Lời nhắn / Nội dung gửi kèm:
                </label>
                <textarea
                  id="gmail-custom-message"
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  rows={4}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-red-500/30 focus:border-red-500"
                  placeholder="Nhập ghi chú gửi đến Tổ trưởng..."
                />
              </div>

              {/* Docx Attachment Checkbox */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
                    <Paperclip className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">
                      Đính kèm file Word Giáo án (.docx)
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Tự động chuyển đổi thành file đính kèm chuẩn CV 5512 trong email
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={attachDocx}
                  onChange={(e) => setAttachDocx(e.target.checked)}
                  className="w-4 h-4 text-red-600 rounded-md border-slate-300 focus:ring-red-500"
                />
              </div>

              {/* Submit Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  disabled={isSavingDraft || isSending || !currentPlan}
                  className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-98 text-slate-700 font-bold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSavingDraft ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
                      <span>Đang lưu nháp...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 text-slate-500" />
                      <span>Lưu Bản Nháp Vào Gmail</span>
                    </>
                  )}
                </button>

                <button
                  type="submit"
                  disabled={isSending || isSavingDraft || !currentPlan}
                  className="py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 active:scale-98 text-white font-extrabold text-xs flex items-center justify-center space-x-2 shadow-md shadow-red-200 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Đang gửi qua Gmail...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 text-white" />
                      <span>Gửi Giáo Án Ngay</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: RECENT MESSAGES */}
          {isSignedIn && activeTab === 'history' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                  Hộp Thư Gmail Của Thầy/Cô
                </h3>
                <button
                  type="button"
                  onClick={loadRecentMessages}
                  disabled={isLoadingMessages}
                  className="text-xs font-bold text-red-600 hover:text-red-700 cursor-pointer"
                >
                  Làm mới
                </button>
              </div>

              {isLoadingMessages ? (
                <div className="py-8 text-center space-y-2 text-slate-400">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-red-600" />
                  <p className="text-xs font-medium">Đang tải hộp thư Gmail...</p>
                </div>
              ) : recentMessages.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-slate-50 border border-dashed border-slate-200 space-y-2">
                  <Inbox className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="text-xs font-bold text-slate-600">
                    Không có email nào gần đây hoặc chưa có quyền đọc hòm thư
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {recentMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className="p-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl space-y-1 transition-colors shadow-2xs"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-extrabold text-slate-900 truncate max-w-xs">
                          {msg.from || 'Không rõ người gửi'}
                        </span>
                        <span className="text-[10px] text-slate-400 shrink-0">
                          {msg.date ? new Date(msg.date).toLocaleDateString('vi-VN') : ''}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-700 truncate">
                        {msg.subject}
                      </p>
                      {msg.snippet && (
                        <p className="text-[11px] text-slate-500 truncate">
                          {msg.snippet}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>Gmail API v1 • RFC 2822 Multipart/Mixed</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white hover:bg-slate-200 text-slate-700 font-bold border border-slate-200 transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
