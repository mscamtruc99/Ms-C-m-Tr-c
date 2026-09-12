import { LessonPlan } from '../types';

/**
 * Checks if a subject/grade qualifies for Ms. Lê Thị Cẩm Trúc:
 * - Must be English (Tiếng Anh / TA) OR
 * - Must be Hoạt động trải nghiệm Lớp 9 (HĐTN 9)
 */
export function isEnglishOrHdtn9(subject?: string, grade?: string): boolean {
  const s = (subject || '').toLowerCase().trim();
  const g = (grade || '').trim();

  const isTA =
    s.includes('tiếng anh') ||
    s.includes('tieng anh') ||
    s.includes('english') ||
    s === 'ta';

  const isHdtn =
    s.includes('hoạt động trải nghiệm') ||
    s.includes('hoat dong trai nghiem') ||
    s.includes('hđtn') ||
    s.includes('hdtn');

  const isGrade9 = g === 'Lớp 9' || g.includes('9');

  const isHdtn9 = isHdtn && isGrade9;

  return isTA || isHdtn9;
}

/**
 * Returns the sanitized teacher name according to the rule:
 * If NOT TA and NOT HĐTN 9, the name 'Lê Thị Cẩm Trúc' must NOT be used.
 */
export function getSanitizedTeacherName(
  teacherName?: string,
  subject?: string,
  grade?: string,
  fallback: string = 'Giáo viên bộ môn'
): string {
  const allowed = isEnglishOrHdtn9(subject, grade);
  if (allowed) {
    return teacherName || 'Lê Thị Cẩm Trúc';
  }

  if (!teacherName || teacherName.trim() === '' || teacherName === 'Lê Thị Cẩm Trúc') {
    return fallback;
  }
  return teacherName;
}

/**
 * Helper to get the teacher display name for a given LessonPlan
 */
export function getPlanTeacherDisplay(plan: LessonPlan): string {
  return getSanitizedTeacherName(
    plan.teacherInfo?.fullName,
    plan.generalInfo?.subject,
    plan.generalInfo?.grade
  );
}
