import React, { useState, useEffect } from 'react';
import { TeacherProfile, LessonPlan, AppLanguage } from './types';
import { SAMPLE_LESSON_PLANS } from './data/sampleTemplates';
import { SEED_LESSON_PLANS } from './data/seedPlans';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { GeneratorForm } from './components/GeneratorForm';
import { LessonPlanView } from './components/LessonPlanView';
import { TeacherProfileModal } from './components/TeacherProfileModal';
import { PromptLibraryModal } from './components/PromptLibraryModal';
import { GuidelinesModal } from './components/GuidelinesModal';
import { LoginHistoryModal } from './components/LoginHistoryModal';
import { GoogleDriveModal } from './components/GoogleDriveModal';
import { GmailModal } from './components/GmailModal';
import { getSanitizedTeacherName } from './utils/teacherUtils';

const ADMIN_EMAIL = 'mscamtruc99@gmail.com';

const sanitizePlanTeacher = (p: LessonPlan): LessonPlan => {
  const sanitized = getSanitizedTeacherName(
    p.teacherInfo?.fullName,
    p.generalInfo?.subject,
    p.generalInfo?.grade,
    'Giáo viên bộ môn'
  );
  if (p.teacherInfo?.fullName !== sanitized) {
    return {
      ...p,
      teacherInfo: {
        fullName: sanitized,
        school: p.teacherInfo?.school || 'THCS Nguyễn Thái Bình',
        department: p.teacherInfo?.department || 'Tổ Chuyên Môn',
      },
    };
  }
  return p;
};

export default function App() {
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string }>({
    name: 'Lê Thị Cẩm Trúc',
    email: 'mscamtruc99@gmail.com',
  });

  // Admin check
  const isAdmin = true;

  const [currentView, setCurrentView] = useState<'dashboard' | 'generator' | 'detail'>('dashboard');
  const [plans, setPlans] = useState<LessonPlan[]>(() => {
    try {
      const cached = localStorage.getItem('khbd_saved_plans');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          const cleaned = parsed
            .filter(
              (p: LessonPlan) =>
                p.id !== 'khbd-seed-tieng-anh-7' &&
                !(p.generalInfo?.lessonTitle?.includes('Lesson 2: A Closer Look 1') && p.generalInfo?.grade === 'Lớp 7')
            )
            .map(sanitizePlanTeacher);
          localStorage.setItem('khbd_saved_plans', JSON.stringify(cleaned));
          return cleaned;
        }
      }
    } catch {}
    return [];
  });
  const [activePlan, setActivePlan] = useState<LessonPlan | null>(() => {
    try {
      const cached = localStorage.getItem('khbd_saved_plans');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          const cleaned = parsed
            .filter(
              (p: LessonPlan) =>
                p.id !== 'khbd-seed-tieng-anh-7' &&
                !(p.generalInfo?.lessonTitle?.includes('Lesson 2: A Closer Look 1') && p.generalInfo?.grade === 'Lớp 7')
            )
            .map(sanitizePlanTeacher);
          return cleaned[0] || null;
        }
      }
    } catch {}
    return null;
  });
  const [appLanguage, setAppLanguage] = useState<AppLanguage>('Vietnamese');

  // Master Teacher Profile state (Default: Ms. Lê Thị Cẩm Trúc)
  const [teacherProfile, setTeacherProfile] = useState<TeacherProfile>(() => {
    try {
      const saved = localStorage.getItem('teacher_profile');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse teacher profile:', e);
    }
    return {
      fullName: 'Lê Thị Cẩm Trúc',
      school: 'THCS Nguyễn Thái Bình',
      department: 'Tổ Tiếng Anh',
      subjects: ['Tiếng Anh', 'Hoạt động trải nghiệm hướng nghiệp'],
      defaultTextbook: 'Kết nối tri thức với cuộc sống',
      teachingStyle: 'Khuyến khích học sinh thảo luận nhóm, học tập trải nghiệm và ứng dụng AI Literacy.',
    };
  });

  // Modal States
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
  const [isGuidelinesModalOpen, setIsGuidelinesModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isDriveModalOpen, setIsDriveModalOpen] = useState(false);
  const [isGmailModalOpen, setIsGmailModalOpen] = useState(false);

  // Fetch plans & master profile on mount
  useEffect(() => {
    fetchMasterProfile();
    fetchSavedPlans();
  }, []);

  const fetchMasterProfile = async () => {
    try {
      const res = await fetch('/api/profile');
      const data = await res.json();
      if (data.success && data.profile) {
        setTeacherProfile(data.profile);
        try {
          localStorage.setItem('teacher_profile', JSON.stringify(data.profile));
        } catch {}
      }
    } catch (e) {
      console.error('Error fetching master profile:', e);
    }
  };

  const fetchSavedPlans = async () => {
    try {
      const res = await fetch('/api/khbd/list');
      const data = await res.json();
      if (data.success && Array.isArray(data.plans)) {
        const cleaned = data.plans
          .filter(
            (p: LessonPlan) =>
              p.id !== 'khbd-seed-tieng-anh-7' &&
              !(p.generalInfo?.lessonTitle?.includes('Lesson 2: A Closer Look 1') && p.generalInfo?.grade === 'Lớp 7')
          )
          .map(sanitizePlanTeacher);
        setPlans(cleaned);
        setActivePlan((prev) => (prev && prev.id !== 'khbd-seed-tieng-anh-7' ? prev : cleaned[0] || null));
        try {
          localStorage.setItem('khbd_saved_plans', JSON.stringify(cleaned));
        } catch {}
        return;
      }
    } catch (e) {
      console.warn('Could not fetch plans from server, falling back to local storage:', e);
    }

    // Fallback if server returned empty or error
    try {
      const local = localStorage.getItem('khbd_saved_plans');
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed)) {
          const cleaned = parsed
            .filter(
              (p: LessonPlan) =>
                p.id !== 'khbd-seed-tieng-anh-7' &&
                !(p.generalInfo?.lessonTitle?.includes('Lesson 2: A Closer Look 1') && p.generalInfo?.grade === 'Lớp 7')
            )
            .map(sanitizePlanTeacher);
          setPlans(cleaned);
          setActivePlan((prev) => (prev && prev.id !== 'khbd-seed-tieng-anh-7' ? prev : cleaned[0] || null));
          return;
        }
      }
    } catch {}

    setPlans([]);
    setActivePlan(null);
  };

  const handleSaveTeacherProfile = async (updated: TeacherProfile) => {
    const userEmail = currentUser?.email || ADMIN_EMAIL;
    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userEmail, profile: updated }),
      });
      const data = await res.json();
      if (data.success && data.profile) {
        setTeacherProfile(data.profile);
        try {
          localStorage.setItem('teacher_profile', JSON.stringify(data.profile));
        } catch {}
      } else {
        alert(data.error || 'Chỉ tài khoản Admin (mscamtruc99@gmail.com) mới có quyền chỉnh sửa Hồ Sơ Giáo Viên.');
      }
    } catch (e) {
      console.error('Failed to save teacher profile:', e);
      alert('Không thể kết nối đến máy chủ để lưu hồ sơ.');
    }
  };

  const [justCreatedPlanId, setJustCreatedPlanId] = useState<string | null>(null);

  const handlePlanGenerated = (newPlan: LessonPlan) => {
    setPlans((prev) => {
      const updated = [newPlan, ...prev.filter((p) => p.id !== newPlan.id)];
      try {
        localStorage.setItem('khbd_saved_plans', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    setActivePlan(newPlan);
    setJustCreatedPlanId(newPlan.id);
    setCurrentView('detail');
  };

  const handleUpdatePlan = (updatedPlan: LessonPlan) => {
    setPlans((prev) => {
      const updated = prev.map((p) => (p.id === updatedPlan.id ? updatedPlan : p));
      try {
        localStorage.setItem('khbd_saved_plans', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    setActivePlan(updatedPlan);
  };

  const handleDeletePlan = async (id: string) => {
    try {
      await fetch(`/api/khbd/${id}`, { method: 'DELETE' });
    } catch (e) {
      console.error('Error deleting plan:', e);
    }
    setPlans((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      try {
        localStorage.setItem('khbd_saved_plans', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    if (activePlan?.id === id) {
      setActivePlan(null);
      setCurrentView('dashboard');
    }
  };

  const handleCloneOrUsePlan = (targetPlan: LessonPlan) => {
    const assignedName = getSanitizedTeacherName(
      teacherProfile.fullName,
      targetPlan.generalInfo?.subject,
      targetPlan.generalInfo?.grade,
      'Giáo viên bộ môn'
    );
    const clonedPlan: LessonPlan = {
      ...targetPlan,
      id: 'khbd-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1,
      isSample: false,
      sampleBadge: undefined,
      teacherInfo: {
        fullName: assignedName,
        school: teacherProfile.school,
        department: teacherProfile.department,
      },
    };
    setPlans((prev) => {
      const updated = [clonedPlan, ...prev.filter((p) => p.id !== clonedPlan.id)];
      try {
        localStorage.setItem('khbd_saved_plans', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    // Persist to server
    fetch('/api/khbd/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(clonedPlan),
    }).catch(() => {});

    setActivePlan(clonedPlan);
    setJustCreatedPlanId(clonedPlan.id);
    setCurrentView('detail');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-rose-50/20 to-slate-100 text-slate-800 font-sans selection:bg-rose-600 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        teacherProfile={teacherProfile}
        userEmail={currentUser?.email || 'mscamtruc99@gmail.com'}
        language={appLanguage}
        onLanguageChange={setAppLanguage}
        openTeacherProfile={() => setIsTeacherModalOpen(true)}
        openPromptLibrary={() => setIsPromptModalOpen(true)}
        openGuidelines={() => setIsGuidelinesModalOpen(true)}
        openLoginHistory={() => setIsHistoryModalOpen(true)}
        openGoogleDrive={() => setIsDriveModalOpen(true)}
        openGmail={() => setIsGmailModalOpen(true)}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {currentView === 'dashboard' && (
          <Dashboard
            plans={plans}
            samplePlans={SAMPLE_LESSON_PLANS}
            onSelectPlan={(p) => {
              setActivePlan(p);
              setCurrentView('detail');
            }}
            onNewPlan={() => setCurrentView('generator')}
            onDeletePlan={handleDeletePlan}
            onClonePlan={handleCloneOrUsePlan}
            openPromptLibrary={() => setIsPromptModalOpen(true)}
            openGuidelines={() => setIsGuidelinesModalOpen(true)}
            openGoogleDrive={() => setIsDriveModalOpen(true)}
            onSavePlanToDrive={(plan) => {
              setActivePlan(plan);
              setIsDriveModalOpen(true);
            }}
            openGmail={() => setIsGmailModalOpen(true)}
            onSendPlanViaGmail={(plan) => {
              setActivePlan(plan);
              setIsGmailModalOpen(true);
            }}
          />
        )}

        {currentView === 'generator' && (
          <GeneratorForm
            teacherProfile={teacherProfile}
            appLanguage={appLanguage}
            onSuccessGenerated={handlePlanGenerated}
            onCancel={() => setCurrentView('dashboard')}
            openGmailWithPlan={(plan) => {
              setActivePlan(plan);
              setIsGmailModalOpen(true);
            }}
          />
        )}

        {currentView === 'detail' && activePlan && (
          <LessonPlanView
            plan={activePlan}
            onBack={() => {
              setJustCreatedPlanId(null);
              setCurrentView('dashboard');
            }}
            onUpdatePlan={handleUpdatePlan}
            onDeletePlan={handleDeletePlan}
            onClonePlan={handleCloneOrUsePlan}
            openGmail={() => setIsGmailModalOpen(true)}
            isJustCreated={justCreatedPlanId === activePlan.id}
          />
        )}
      </main>

      {/* Modals */}
      <TeacherProfileModal
        isOpen={isTeacherModalOpen}
        onClose={() => setIsTeacherModalOpen(false)}
        profile={teacherProfile}
        isAdmin={isAdmin}
        onSave={handleSaveTeacherProfile}
      />

      <GoogleDriveModal
        isOpen={isDriveModalOpen}
        onClose={() => setIsDriveModalOpen(false)}
        currentPlan={activePlan}
      />

      <GmailModal
        isOpen={isGmailModalOpen}
        onClose={() => setIsGmailModalOpen(false)}
        currentPlan={activePlan || plans[0] || null}
        teacherProfile={teacherProfile}
      />

      <PromptLibraryModal
        isOpen={isPromptModalOpen}
        onClose={() => setIsPromptModalOpen(false)}
        onUsePrompt={(promptText) => {
          setCurrentView('generator');
        }}
      />

      <GuidelinesModal
        isOpen={isGuidelinesModalOpen}
        onClose={() => setIsGuidelinesModalOpen(false)}
      />

      <LoginHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
      />
    </div>
  );
}
