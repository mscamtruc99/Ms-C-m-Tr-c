import React, { useState, useEffect } from 'react';
import {
  Cloud,
  X,
  CheckCircle2,
  ExternalLink,
  Trash2,
  RefreshCw,
  FileText,
  Upload,
  AlertTriangle,
  LogOut,
  Folder,
  Loader2,
  HardDrive,
} from 'lucide-react';
import {
  signInWithGoogleDrive,
  signOutGoogleDrive,
  listDriveLessonPlans,
  deleteDriveFile,
  uploadLessonPlanToGoogleDrive,
  getDriveAccessToken,
  DriveFileItem,
  auth,
} from '../services/googleDriveService';
import { LessonPlan } from '../types';

interface GoogleDriveModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan?: LessonPlan | null;
  onPlanSavedToDrive?: (planId: string, driveFileLink: string) => void;
}

export const GoogleDriveModal: React.FC<GoogleDriveModalProps> = ({
  isOpen,
  onClose,
  currentPlan,
  onPlanSavedToDrive,
}) => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [files, setFiles] = useState<DriveFileItem[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Destructive Action: File deletion confirmation state (Mandatory per Skill guidelines)
  const [fileToDelete, setFileToDelete] = useState<DriveFileItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      checkAuthStatus();
    }
  }, [isOpen]);

  const checkAuthStatus = async () => {
    const token = getDriveAccessToken();
    const user = auth.currentUser;
    if (token && user) {
      setIsSignedIn(true);
      setCurrentUser(user);
      loadDriveFiles();
    } else {
      setIsSignedIn(false);
      setCurrentUser(null);
      setFiles([]);
    }
  };

  const loadDriveFiles = async () => {
    setIsLoadingFiles(true);
    setErrorMessage(null);
    try {
      const items = await listDriveLessonPlans();
      setFiles(items);
    } catch (err: any) {
      setErrorMessage(err.message || 'Không thể tải danh sách file từ Google Drive.');
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const handleSignIn = async () => {
    setIsAuthenticating(true);
    setErrorMessage(null);
    try {
      const result = await signInWithGoogleDrive();
      setIsSignedIn(true);
      setCurrentUser(result.user);
      await loadDriveFiles();
    } catch (err: any) {
      console.error('Sign in failed:', err);
      setErrorMessage(err.message || 'Đăng nhập Google Drive không thành công.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutGoogleDrive();
      setIsSignedIn(false);
      setCurrentUser(null);
      setFiles([]);
    } catch (err: any) {
      console.error('Sign out failed:', err);
    }
  };

  const handleUploadCurrentPlan = async () => {
    if (!currentPlan) return;
    setIsUploading(true);
    setUploadSuccessMsg(null);
    setErrorMessage(null);
    try {
      const uploaded = await uploadLessonPlanToGoogleDrive(currentPlan);
      setUploadSuccessMsg(`Đã tải thành công giáo án lên Google Drive: "${uploaded.name}"`);
      if (onPlanSavedToDrive) {
        onPlanSavedToDrive(currentPlan.id, uploaded.webViewLink);
      }
      await loadDriveFiles();
    } catch (err: any) {
      setErrorMessage(err.message || 'Lỗi khi lưu bài giảng lên Google Drive.');
    } finally {
      setIsUploading(false);
    }
  };

  // Explicit confirmation modal flow for deleting files
  const confirmDeleteFile = async () => {
    if (!fileToDelete) return;
    setIsDeleting(true);
    try {
      await deleteDriveFile(fileToDelete.id);
      setFiles((prev) => prev.filter((f) => f.id !== fileToDelete.id));
      setFileToDelete(null);
    } catch (err: any) {
      alert(`Không thể xóa file: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-rose-50/50 via-white to-sky-50/50">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center shadow-xs border border-sky-200">
              <Cloud className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <span>Google Drive Đồng Bộ Giáo Án</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-sky-100 text-sky-800 border border-sky-200">
                  Workspace
                </span>
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Lưu trữ và đồng bộ file Word (.docx) trực tiếp lên tài khoản Google Drive của Giáo viên
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

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Section 1: Authentication Card */}
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
                  Kết nối Google Drive của Thầy/Cô
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Đăng nhập để cấp quyền lưu file giáo án (.docx) vào thư mục riêng biệt &quot;KHBD Chuẩn GDPT 2018&quot; trên Google Drive cá nhân của Thầy/Cô.
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
                    <span>Đang kết nối Google Drive...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
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
                    <span>Đăng nhập với Google Drive</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-200/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                {currentUser?.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'Google User'}
                    className="w-10 h-10 rounded-full border border-sky-300"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-sky-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                    {currentUser?.displayName ? currentUser.displayName.charAt(0) : 'G'}
                  </div>
                )}
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="font-extrabold text-sm text-slate-900">
                      {currentUser?.displayName || 'Tài khoản Google'}
                    </span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <p className="text-xs text-slate-500 font-medium">{currentUser?.email}</p>
                  <p className="text-[11px] text-sky-700 font-bold flex items-center gap-1 mt-0.5">
                    <Folder className="w-3 h-3 text-sky-600" />
                    <span>Thư mục: Google Drive &gt; KHBD Chuẩn GDPT 2018</span>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSignOut}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-600 hover:text-red-600 border border-slate-200 text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Đăng xuất</span>
              </button>
            </div>
          )}

          {/* Feedback Alerts */}
          {uploadSuccessMsg && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center space-x-2.5 text-xs text-emerald-900 font-semibold animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{uploadSuccessMsg}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-center space-x-2.5 text-xs text-red-800 font-semibold animate-in fade-in">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Section 2: Upload Current Plan Card (If a plan is active) */}
          {isSignedIn && currentPlan && (
            <div className="p-4 bg-emerald-50/70 border-2 border-emerald-200 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-emerald-900 uppercase tracking-wide flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-emerald-700" />
                  <span>Giáo án đang mở</span>
                </span>
                <span className="text-xs font-bold text-slate-600">
                  {currentPlan.generalInfo.subject} • {currentPlan.generalInfo.grade}
                </span>
              </div>
              <p className="text-sm font-extrabold text-slate-900">
                {currentPlan.generalInfo.lessonTitle}
              </p>
              <button
                type="button"
                onClick={handleUploadCurrentPlan}
                disabled={isUploading}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-extrabold text-xs flex items-center justify-center space-x-2 shadow-md shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Đang tải file Word lên Google Drive...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 text-white" />
                    <span>Lưu Kế Hoạch Này Vào Google Drive (.docx)</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Section 3: File List on Google Drive */}
          {isSignedIn && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <HardDrive className="w-4 h-4 text-slate-600" />
                  <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                    Các File Giáo Án Trên Google Drive ({files.length})
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={loadDriveFiles}
                  disabled={isLoadingFiles}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 text-xs font-bold flex items-center space-x-1 cursor-pointer"
                  title="Làm mới danh sách"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingFiles ? 'animate-spin' : ''}`} />
                  <span>Làm mới</span>
                </button>
              </div>

              {isLoadingFiles ? (
                <div className="py-8 text-center space-y-2 text-slate-400">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-sky-600" />
                  <p className="text-xs font-medium">Đang tải danh sách file từ Google Drive...</p>
                </div>
              ) : files.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-slate-50 border border-dashed border-slate-200 space-y-2">
                  <Cloud className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="text-xs font-bold text-slate-600">
                    Chưa có file giáo án nào trong thư mục Google Drive
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Bấm nút &quot;Lưu Kế Hoạch Này Vào Google Drive&quot; ở trên để tự động tải lên bản Word chuẩn.
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {files.map((file) => (
                    <div
                      key={file.id}
                      className="p-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3 transition-colors shadow-2xs"
                    >
                      <div className="flex items-center space-x-3 overflow-hidden">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="truncate">
                          <p className="font-bold text-xs text-slate-800 truncate" title={file.name}>
                            {file.name}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {file.createdTime
                              ? new Date(file.createdTime).toLocaleString('vi-VN')
                              : 'Vừa xong'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1 shrink-0">
                        {file.webViewLink && (
                          <a
                            href={file.webViewLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-bold flex items-center space-x-1 transition-colors"
                            title="Mở trên Google Drive"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span className="text-[11px] hidden sm:inline">Mở Drive</span>
                          </a>
                        )}

                        <button
                          type="button"
                          onClick={() => setFileToDelete(file)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                          title="Xóa khỏi Drive"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span className="font-medium">
            Google Drive API v3 • Khung GDPT 2018 & CV 5512
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white hover:bg-slate-200 text-slate-700 font-bold border border-slate-200 transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>

      {/* Mandatory Destructive Action Confirmation Dialog */}
      {fileToDelete && (
        <div className="fixed inset-0 z-60 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-red-100 space-y-4 text-slate-800">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-extrabold text-base text-slate-900">
                Xác Nhận Xóa File Trên Google Drive?
              </h3>
              <p className="text-xs text-slate-500">
                Thầy/Cô có chắc chắn muốn xóa file:
              </p>
              <p className="text-xs font-bold text-slate-800 bg-slate-100 p-2 rounded-xl break-all">
                {fileToDelete.name}
              </p>
              <p className="text-[11px] text-red-600 font-medium pt-1">
                Lưu ý: Thao tác này sẽ xóa vĩnh viễn file khỏi Google Drive của bạn.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setFileToDelete(null)}
                disabled={isDeleting}
                className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={confirmDeleteFile}
                disabled={isDeleting}
                className="py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs transition-all shadow-md shadow-red-200 cursor-pointer flex items-center justify-center space-x-1.5"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Đang xóa...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Xác Nhận Xóa</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
