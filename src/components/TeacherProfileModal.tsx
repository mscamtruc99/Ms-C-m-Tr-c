import React, { useState, useEffect } from 'react';
import { X, Save, UserCheck, BookOpen, School, Sparkles, ShieldAlert, Lock } from 'lucide-react';
import { TeacherProfile, Subject, TextbookSeries } from '../types';

interface TeacherProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: TeacherProfile;
  isAdmin?: boolean;
  onSave: (updatedProfile: TeacherProfile) => void;
}

const ALL_SUBJECTS: Subject[] = [
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

const TEXTBOOKS: TextbookSeries[] = [
  'Kết nối tri thức với cuộc sống',
  'Chân trời sáng tạo',
  'Cánh diều',
];

export const TeacherProfileModal: React.FC<TeacherProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  isAdmin = true,
  onSave,
}) => {
  const [fullName, setFullName] = useState(profile.fullName || 'Lê Thị Cẩm Trúc');
  const [school, setSchool] = useState(profile.school || 'THCS Nguyễn Thái Bình');
  const [department, setDepartment] = useState(profile.department || 'Tổ Tiếng Anh');
  const [defaultTextbook, setDefaultTextbook] = useState<TextbookSeries>(profile.defaultTextbook || 'Kết nối tri thức với cuộc sống');
  const [selectedSubjects, setSelectedSubjects] = useState<Subject[]>(profile.subjects || ['Tiếng Anh', 'Hoạt động trải nghiệm hướng nghiệp']);
  const [customSubjInput, setCustomSubjInput] = useState('');
  const [teachingStyle, setTeachingStyle] = useState(profile.teachingStyle || 'Khuyến khích học sinh thảo luận nhóm, học tập trải nghiệm và ứng dụng AI Literacy.');

  useEffect(() => {
    if (isOpen) {
      setFullName(profile.fullName || 'Lê Thị Cẩm Trúc');
      setSchool(profile.school || 'THCS Nguyễn Thái Bình');
      setDepartment(profile.department || 'Tổ Tiếng Anh');
      setDefaultTextbook(profile.defaultTextbook || 'Kết nối tri thức với cuộc sống');
      setSelectedSubjects(profile.subjects || ['Tiếng Anh', 'Hoạt động trải nghiệm hướng nghiệp']);
      setTeachingStyle(profile.teachingStyle || 'Khuyến khích học sinh thảo luận nhóm, học tập trải nghiệm và ứng dụng AI Literacy.');
    }
  }, [isOpen, profile]);

  if (!isOpen) return null;

  const toggleSubject = (subj: Subject) => {
    if (!isAdmin) return;
    if (selectedSubjects.includes(subj)) {
      setSelectedSubjects(selectedSubjects.filter((s) => s !== subj));
    } else {
      setSelectedSubjects([...selectedSubjects, subj]);
    }
  };

  const handleAddCustomSubject = () => {
    if (!isAdmin) return;
    const trimmed = customSubjInput.trim();
    if (trimmed && !selectedSubjects.includes(trimmed)) {
      setSelectedSubjects([...selectedSubjects, trimmed]);
      setCustomSubjInput('');
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    onSave({
      fullName,
      school,
      department,
      defaultTextbook,
      subjects: selectedSubjects,
      teachingStyle,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl text-slate-800 shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600 border border-rose-200">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-lg text-slate-900">Hồ Sơ Giáo Viên</h3>
                {!isAdmin && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 font-extrabold text-[11px] flex items-center space-x-1">
                    <Lock className="w-3 h-3 text-amber-600" />
                    <span>Chỉ Xem</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                Thông tin này sẽ tự động tích hợp vào các Kế hoạch bài dạy do AI khởi tạo
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Lock Banner for Non-Admins */}
        {!isAdmin && (
          <div className="mx-6 mt-4 p-3.5 bg-amber-50/90 border border-amber-200/90 rounded-2xl flex items-start space-x-3 text-xs text-amber-900 shadow-xs">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-extrabold text-sm text-amber-950">Quyền Chỉnh Sửa Được Bảo Vệ:</p>
              <p className="mt-0.5 leading-relaxed text-amber-900">
                Hồ sơ này là thông tin chính thức của Admin <strong>Ms Cẩm Trúc</strong> (Lê Thị Cẩm Trúc). Các tài khoản dùng chung chỉ có quyền xem và áp dụng hồ sơ này để soạn bài, không được phép thay đổi thông tin cá nhân của Admin.
              </p>
            </div>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Họ và tên Giáo viên</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={!isAdmin}
                required
                className={`w-full px-3.5 py-2 border rounded-xl text-sm font-medium ${
                  !isAdmin
                    ? 'bg-slate-100 text-slate-600 border-slate-200 cursor-not-allowed'
                    : 'bg-slate-50 border-slate-200 text-slate-900 focus:outline-none focus:bg-white focus:border-rose-500'
                }`}
                placeholder="Ví dụ: Lê Thị Cẩm Trúc"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Trường THCS công tác</label>
              <input
                type="text"
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                disabled={!isAdmin}
                required
                className={`w-full px-3.5 py-2 border rounded-xl text-sm font-medium ${
                  !isAdmin
                    ? 'bg-slate-100 text-slate-600 border-slate-200 cursor-not-allowed'
                    : 'bg-slate-50 border-slate-200 text-slate-900 focus:outline-none focus:bg-white focus:border-rose-500'
                }`}
                placeholder="Ví dụ: THCS Nguyễn Thái Bình"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tổ chuyên môn</label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                disabled={!isAdmin}
                required
                className={`w-full px-3.5 py-2 border rounded-xl text-sm font-medium ${
                  !isAdmin
                    ? 'bg-slate-100 text-slate-600 border-slate-200 cursor-not-allowed'
                    : 'bg-slate-50 border-slate-200 text-slate-900 focus:outline-none focus:bg-white focus:border-rose-500'
                }`}
                placeholder="Ví dụ: Tổ Tiếng Anh"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Bộ sách giáo khoa mặc định</label>
              <select
                value={defaultTextbook}
                onChange={(e) => setDefaultTextbook(e.target.value as TextbookSeries)}
                disabled={!isAdmin}
                className={`w-full px-3.5 py-2 border rounded-xl text-sm font-medium ${
                  !isAdmin
                    ? 'bg-slate-100 text-slate-600 border-slate-200 cursor-not-allowed'
                    : 'bg-slate-50 border-slate-200 text-slate-900 focus:outline-none focus:bg-white focus:border-rose-500 cursor-pointer'
                }`}
              >
                {TEXTBOOKS.map((tb) => (
                  <option key={tb} value={tb}>
                    {tb}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Subjects Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">Các Môn Học Giảng Dạy chính</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {ALL_SUBJECTS.map((subj) => {
                const isSelected = selectedSubjects.includes(subj);
                return (
                  <button
                    key={subj}
                    type="button"
                    disabled={!isAdmin}
                    onClick={() => toggleSubject(subj)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-rose-600 text-white border border-rose-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100'
                    } ${!isAdmin ? 'cursor-not-allowed opacity-90' : 'cursor-pointer'}`}
                  >
                    {subj}
                  </button>
                );
              })}

              {/* Display custom subjects */}
              {selectedSubjects
                .filter((s) => !ALL_SUBJECTS.includes(s as any))
                .map((customSubj) => (
                  <button
                    key={customSubj}
                    type="button"
                    disabled={!isAdmin}
                    onClick={() => toggleSubject(customSubj)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold bg-purple-600 text-white border border-purple-600 flex items-center space-x-1 shadow-xs ${
                      !isAdmin ? 'cursor-not-allowed' : 'cursor-pointer'
                    }`}
                  >
                    <span>{customSubj}</span>
                    {isAdmin && <span className="text-purple-200 ml-1">✕</span>}
                  </button>
                ))}
            </div>

            {/* Custom Subject Input Row */}
            {isAdmin && (
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={customSubjInput}
                  onChange={(e) => setCustomSubjInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomSubject();
                    }
                  }}
                  placeholder="Nhập thêm môn học khác (Ví dụ: Tiếng Pháp, GDĐP...)"
                  className="flex-1 px-3.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-rose-500 placeholder-slate-400 font-medium"
                />
                <button
                  type="button"
                  onClick={handleAddCustomSubject}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition-all border border-slate-200 cursor-pointer"
                >
                  + Thêm môn
                </button>
              </div>
            )}
          </div>

          {/* Teaching Style Preference */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Phong cách & Định hướng Giảng dạy (Gợi ý cho AI)
            </label>
            <textarea
              value={teachingStyle}
              onChange={(e) => setTeachingStyle(e.target.value)}
              disabled={!isAdmin}
              rows={3}
              className={`w-full px-3.5 py-2 border rounded-xl text-sm font-medium ${
                !isAdmin
                  ? 'bg-slate-100 text-slate-600 border-slate-200 cursor-not-allowed'
                  : 'bg-slate-50 border-slate-200 text-slate-900 focus:outline-none focus:bg-white focus:border-rose-500'
              }`}
              placeholder="Ví dụ: Khuyến khích học sinh thảo luận nhóm, giải quyết tình huống thực tiễn, ứng dụng công cụ AI."
            />
          </div>

          {/* Buttons */}
          <div className="pt-4 border-t border-slate-100 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              {isAdmin ? 'Hủy' : 'Đóng'}
            </button>
            {isAdmin ? (
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-sm font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-md flex items-center space-x-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Lưu Hồ Sơ</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 rounded-xl text-sm font-bold bg-slate-800 text-slate-200 hover:bg-slate-900 flex items-center space-x-2 cursor-pointer"
              >
                <Lock className="w-4 h-4 text-amber-400" />
                <span>Đã Khóa Chỉnh Sửa (Dành riêng Admin)</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
