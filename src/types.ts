/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Subject =
  | 'Toán học'
  | 'Ngữ văn'
  | 'Tiếng Anh'
  | 'Khoa học tự nhiên'
  | 'Lịch sử và Địa lí'
  | 'Tin học'
  | 'Công nghệ'
  | 'Giáo dục công dân'
  | 'Hoạt động trải nghiệm, hướng nghiệp'
  | 'Hoạt động trải nghiệm hướng nghiệp'
  | 'Âm nhạc'
  | 'Mỹ thuật'
  | 'Giáo dục thể chất'
  | (string & {});

export type Grade = 'Lớp 6' | 'Lớp 7' | 'Lớp 8' | 'Lớp 9';

export type TextbookSeries =
  | 'Kết nối tri thức với cuộc sống'
  | 'Chân trời sáng tạo'
  | 'Cánh diều';

export type AILevel = 'none' | 'basic' | 'medium' | 'advanced';
export type STEMLevel = 'none' | 'mini_stem' | 'stem_project' | 'steam';

export interface DigitalCompetencyItem {
  id: string;
  category: string;
  name: string;
  description: string;
}

export type AppLanguage = 'Vietnamese' | 'English';

export interface TeacherProfile {
  fullName: string;
  school: string;
  department: string;
  subjects: Subject[];
  defaultTextbook: TextbookSeries;
  teachingStyle: string;
  notes?: string;
}

export interface LessonPlanRequest {
  subject: Subject;
  grade: Grade;
  textbook: TextbookSeries;
  topic: string;
  lessonTitle: string;
  lessonNumber: string; // e.g. "Tiết 1 - 2"
  duration: string; // e.g. "2 tiết (90 phút)"
  language?: AppLanguage; // "Vietnamese" | "English"
  
  // Integration configs
  aiLevel: AILevel;
  stemLevel: STEMLevel;
  digitalCompetencies: string[]; // List of competency names/ids
  
  extraOptions: {
    localEducation: boolean; // Giáo dục địa phương
    environmental: boolean; // Giáo dục môi trường
    careerGuidance: boolean; // Hướng nghiệp
    financialLiteracy: boolean; // Tài chính
    digitalTransformation: boolean; // Chuyển đổi số
  };
  
  customInstructions?: string;
}

export interface ActivityStep {
  step1_Transfer: string; // Bước 1: Chuyển giao nhiệm vụ
  step2_Perform: string;  // Bước 2: Thực hiện nhiệm vụ
  step3_Discuss: string;  // Bước 3: Báo cáo, thảo luận
  step4_Conclude: string; // Bước 4: Kết luận, nhận định
}

export interface Activity {
  id: string;
  type: 'khoi_dong' | 'hinh_thanh_kt' | 'luyen_tap' | 'van_dung' | 'mo_rong';
  typeLabel: string; // e.g., "1. Hoạt động 1: Mở đầu / Khởi động"
  title: string;
  objectives: string;
  content: string;
  product: string;
  organization: ActivityStep;
  aiIntegrationNote?: string;
  aiPromptSample?: string;
  digitalCompetencyNote?: string;
  stemTask?: string;
}

export interface DigitalCompetencyMatrixItem {
  competency: string;
  activityApplied: string;
  evidence: string;
}

export interface AIIntegrationDetail {
  tools: {
    name: string;
    purpose: string;
    promptForStudents: string;
  }[];
  aiEthicsRules: string[];
  criticalQuestions: string[];
}

export interface STEMDetail {
  realWorldProblem: string;
  designProcess: string[];
  testingAndEvaluation: string;
}

export interface RubricCriteria {
  criteria: string;
  levelUnsatisfactory: string; // Chưa đạt
  levelSatisfactory: string;   // Đạt
  levelGood: string;           // Khá
  levelExcellent: string;      // Tốt
}

export interface ReviewScore {
  overallScore: number; // 0-100
  compliance5512: string; // Review CV 5512
  aiRating: string;
  stemRating: string;
  digitalCompRating: string;
  suggestions: string[];
}

export interface LessonPlan {
  id: string;
  createdAt: string;
  updatedAt: string;
  version: number;
  isSample?: boolean;
  sampleBadge?: string;
  
  teacherInfo: {
    fullName: string;
    school: string;
    department: string;
  };
  
  generalInfo: {
    subject: Subject;
    grade: Grade;
    topic: string;
    lessonTitle: string;
    lessonNumber: string;
    duration: string;
    textbook: TextbookSeries;
  };
  
  objectives: {
    qualities: string[]; // Phẩm chất
    generalCompetencies: string[]; // Năng lực chung
    subjectCompetencies: string[]; // Năng lực đặc thù
  };
  
  equipment: {
    teacher: string[];
    students: string[];
    digitalTools: string[];
    stemKits: string[];
  };
  
  procedure: Activity[];
  
  aiIntegrationDetail?: AIIntegrationDetail;
  digitalCompetencyMatrix?: DigitalCompetencyMatrixItem[];
  stemDetail?: STEMDetail;
  assessmentRubric?: RubricCriteria[];
  
  reviewScore?: ReviewScore;
}

export interface PromptItem {
  id: string;
  title: string;
  category: string;
  description: string;
  promptText: string;
  tags: string[];
}

export interface StudentWorksheet {
  title: string;
  subject: string;
  grade: string;
  sections: {
    sectionTitle: string;
    instructions: string;
    questions: {
      id: string;
      question: string;
      options?: string[];
      answerKey?: string;
      bloomLevel: 'Nhận biết' | 'Thông hiểu' | 'Vận dụng' | 'Vận dụng cao';
    }[];
  }[];
  aiMiniChallenge?: {
    task: string;
    suggestedPrompt: string;
    reflectionQuestion: string;
  };
}
