import express from 'express';
import path from 'path';
import fs from 'fs';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import { LessonPlan, LessonPlanRequest, TeacherProfile, StudentWorksheet } from './src/types';
import { SEED_LESSON_PLANS } from './src/data/seedPlans';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Local JSON File storage for persistence
const DATA_FILE = path.join(process.cwd(), 'data_lesson_plans.json');
const LOGIN_HISTORY_FILE = path.join(process.cwd(), 'data_login_history.json');
const PROFILE_FILE = path.join(process.cwd(), 'data_teacher_profile.json');
const ADMIN_EMAIL = 'mscamtruc99@gmail.com';

const DEFAULT_PROFILE: TeacherProfile = {
  fullName: 'Lê Thị Cẩm Trúc',
  school: 'THCS Nguyễn Thái Bình',
  department: 'Tổ Tiếng Anh',
  subjects: ['Tiếng Anh', 'Hoạt động trải nghiệm hướng nghiệp'],
  defaultTextbook: 'Kết nối tri thức với cuộc sống',
  teachingStyle: 'Khuyến khích học sinh thảo luận nhóm, học tập trải nghiệm và ứng dụng AI Literacy.',
};

function readTeacherProfile(): TeacherProfile {
  try {
    if (fs.existsSync(PROFILE_FILE)) {
      const data = fs.readFileSync(PROFILE_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Failed to read profile file:', e);
  }
  return DEFAULT_PROFILE;
}

function writeTeacherProfile(profile: TeacherProfile) {
  try {
    fs.writeFileSync(PROFILE_FILE, JSON.stringify(profile, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to write profile file:', e);
  }
}

interface LoginHistoryEntry {
  id: string;
  name: string;
  email: string;
  loginTime: string;
}

function readLoginHistory(): LoginHistoryEntry[] {
  try {
    if (fs.existsSync(LOGIN_HISTORY_FILE)) {
      const data = fs.readFileSync(LOGIN_HISTORY_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Failed to read login history file:', e);
  }
  return [];
}

function writeLoginHistory(history: LoginHistoryEntry[]) {
  try {
    fs.writeFileSync(LOGIN_HISTORY_FILE, JSON.stringify(history, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to write login history file:', e);
  }
}

function readSavedPlans(): LessonPlan[] {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed.filter((p: LessonPlan) => p.id !== 'khbd-seed-tieng-anh-7');
      }
    }
    if (SEED_LESSON_PLANS && SEED_LESSON_PLANS.length > 0) {
      writeSavedPlans(SEED_LESSON_PLANS);
      return SEED_LESSON_PLANS;
    }
  } catch (e) {
    console.error('Failed to read saved plans file:', e);
  }
  return [];
}

function writeSavedPlans(plans: LessonPlan[]) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(plans, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to write saved plans file:', e);
  }
}

// Initialize Gemini Client safely
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Chưa tìm thấy GEMINI_API_KEY. Vui lòng cấu hình trong panel Secrets.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Multi-model fallback runner to guard against 503 high demand or temporary errors
const FALLBACK_MODELS = ['gemini-3.6-flash', 'gemini-3.8-flash', 'gemini-flash-latest'];

async function callGeminiWithFallback(config: {
  prompt: string;
  temperature?: number;
  responseMimeType?: string;
}) {
  const ai = getGeminiClient();
  let lastError: any = null;

  for (const model of FALLBACK_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: config.prompt,
        config: {
          temperature: config.temperature ?? 0.7,
          ...(config.responseMimeType ? { responseMimeType: config.responseMimeType } : {}),
        },
      });
      if (response && response.text) {
        return response.text;
      }
    } catch (err: any) {
      console.warn(`Model ${model} failed:`, err?.status || err?.message || err);
      lastError = err;
      // Brief sleep before trying next model
      await new Promise((resolve) => setTimeout(resolve, 600));
    }
  }

  throw lastError || new Error('Tất cả mô hình AI đang bận, vui lòng thử lại sau ít giây.');
}

function cleanAndParseJSON(raw: string) {
  let cleaned = (raw || '').trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }
  return JSON.parse(cleaned.trim());
}

function isEnglishOrHdtn9(subject?: string, grade?: string): boolean {
  const s = (subject || '').toLowerCase().trim();
  const g = (grade || '').trim();
  const isTA = s.includes('tiếng anh') || s.includes('tieng anh') || s.includes('english') || s === 'ta';
  const isHdtn = s.includes('hoạt động trải nghiệm') || s.includes('hoat dong trai nghiem') || s.includes('hđtn') || s.includes('hdtn');
  const isGrade9 = g === 'Lớp 9' || g.includes('9');
  return isTA || (isHdtn && isGrade9);
}

function resolveTeacherName(fullName?: string, subject?: string, grade?: string): string {
  const allowed = isEnglishOrHdtn9(subject, grade);
  if (allowed) {
    return fullName || 'Lê Thị Cẩm Trúc';
  }
  if (!fullName || fullName.trim() === '' || fullName === 'Lê Thị Cẩm Trúc') {
    return 'Giáo viên bộ môn';
  }
  return fullName;
}

// Fallback generator when all external AI models are unreachable or in high demand
function buildTemplateLessonPlan(request: LessonPlanRequest, teacher?: Partial<TeacherProfile>): LessonPlan {
  const isEnglish = request.language === 'English' || request.subject.toLowerCase().includes('tiếng anh');
  const now = new Date().toISOString();
  
  return {
    id: 'khbd-' + Date.now(),
    createdAt: now,
    updatedAt: now,
    version: 1,
    teacherInfo: {
      fullName: resolveTeacherName(teacher?.fullName, request.subject, request.grade),
      school: teacher?.school || 'Trường THCS Nguyễn Thái Bình',
      department: teacher?.department || (isEnglish ? 'Tổ Tiếng Anh' : 'Tổ Chuyên Môn'),
    },
    generalInfo: {
      subject: request.subject,
      grade: request.grade,
      topic: request.topic,
      lessonTitle: request.lessonTitle,
      lessonNumber: request.lessonNumber || 'Tiết 1',
      duration: request.duration || '45 phút',
      textbook: request.textbook,
    },
    objectives: {
      qualities: [
        isEnglish ? 'Carefulness & Diligence in learning vocabulary and pronunciation.' : 'Chăm chỉ: Tích cực tự học, chủ động tìm tòi kiến thức bài học.',
        isEnglish ? 'Responsibility in pair work and group collaboration.' : 'Trách nhiệm: Hoàn thành đầy đủ các nhiệm vụ học tập được giao.',
        isEnglish ? 'Patriotism & Cultural awareness in modern context.' : 'Yêu nước: Tự hào về các giá trị tri thức và văn hóa dân tộc.',
      ],
      generalCompetencies: [
        isEnglish ? 'Autonomy and self-learning with digital resources.' : 'Tự chủ và tự học: Tự giác tìm hiểu tài liệu và chuẩn bị bài.',
        isEnglish ? 'Communication and collaboration in interactive activities.' : 'Giao tiếp và hợp tác: Tự tin trao đổi ý kiến cùng thầy cô và bạn bè.',
        isEnglish ? 'Problem-solving and creative application.' : 'Giải quyết vấn đề và sáng tạo: Vận dụng kiến thức vào thực tế.',
      ],
      subjectCompetencies: [
        isEnglish ? `Subject competence in ${request.subject}: Master core concepts and communicative skills.` : `Năng lực đặc thù môn ${request.subject}: Nắm vững khái niệm, kiến thức trọng tâm của bài ${request.lessonTitle}.`,
        isEnglish ? 'Digital and AI Literacy: Know how to use AI tools responsibly for learning.' : 'Năng lực số và AI: Biết khai thác công cụ số và trợ lý AI một cách an toàn, có trách nhiệm.',
      ],
    },
    equipment: {
      teacher: [
        'Máy tính kết nối Internet, máy chiếu hoặc màn hình tương tác.',
        'Kế hoạch bài dạy, bài trình chiếu PowerPoint/Canva tương tác.',
        'Học liệu số, video minh họa và phiếu đánh giá Rubric.',
      ],
      students: [
        `Sách giáo khoa ${request.subject} ${request.grade} (${request.textbook}), vở ghi chép.`,
        'Bảng nhóm, bút dạ để thực hiện hoạt động thảo luận.',
        'Thiết bị thông minh (điện thoại/máy tính bảng) để tra cứu học liệu số (nếu có).',
      ],
      digitalTools: [
        'Trợ lý AI hỗ trợ học tập: Gemini / ChatGPT Edu (gợi ý ngữ cảnh, giải thích từ ngữ).',
        'Phần mềm kiểm tra tương tác: Kahoot / Quizizz / Canva for Education.',
      ],
      stemKits: [
        'Học liệu thực hành, sơ đồ tư duy Mindmap, biểu đồ trực quan.',
      ],
    },
    procedure: [
      {
        id: 'act-1',
        type: 'khoi_dong',
        typeLabel: '1. Hoạt động 1: Mở đầu / Khởi động (Warm-up) (7-8 phút)',
        title: isEnglish ? 'Interactive Warm-up & Knowledge Activation' : 'Khởi động tạo hứng thú & Kết nối kiến thức',
        objectives: 'Tạo tâm thế tích cực, gợi nhớ kiến thức liên quan và kích hoạt sự tò mò của học sinh.',
        content: 'Học sinh tham gia trò chơi tương tác ngắn hoặc trả lời câu hỏi tình huống dẫn nhập.',
        product: 'Câu trả lời nhanh, từ khóa hoặc kết quả trò chơi được ghi nhận trên bảng.',
        organization: {
          step1_Transfer: 'Giáo viên nêu luật chơi / câu hỏi tình huống mở đầu, yêu cầu học sinh làm việc cá nhân hoặc theo cặp.',
          step2_Perform: 'Học sinh suy nghĩ nhanh, giơ tay phát biểu hoặc ghi câu trả lời lên bảng phụ.',
          step3_Discuss: 'Giáo viên mời 2-3 học sinh trình bày; các bạn khác nhận xét, bổ sung.',
          step4_Conclude: 'Giáo viên nhận xét ngắn gọn, khéo léo dẫn dắt vào bài học mới.',
        },
        aiIntegrationNote: 'Giáo viên trình chiếu một hình ảnh hoặc câu hỏi đố vui do AI tạo ra để kích thích tư duy học sinh.',
        digitalCompetencyNote: 'Học sinh quan sát, tiếp nhận thông tin từ màn hình trực quan và phương tiện số.',
      },
      {
        id: 'act-2',
        type: 'hinh_thanh_kt',
        typeLabel: '2. Hoạt động 2: Hình thành kiến thức mới (18-20 phút)',
        title: isEnglish ? 'Core Knowledge Exploration & Discovery' : `Khám phá kiến thức trọng tâm: ${request.lessonTitle}`,
        objectives: 'Học sinh nắm vững các khái niệm, quy tắc hoặc nội dung cốt lõi của bài học theo chuẩn GDPT 2018.',
        content: 'Học sinh đọc SGK, quan sát ví dụ, thảo luận nhóm để giải quyết nhiệm vụ tìm tòi kiến thức.',
        product: 'Sơ đồ kiến thức hoặc kết quả trả lời trong phiếu học tập của học sinh.',
        organization: {
          step1_Transfer: 'Giáo viên chia nhóm học tập (4-6 HS/nhóm), giao phiếu học tập và hướng dẫn nhiệm vụ.',
          step2_Perform: 'Các nhóm phân công nhiệm vụ, thảo luận sôi nổi và thống nhất ghi kết quả vào bảng nhóm.',
          step3_Discuss: 'Đại diện một nhóm lên báo cáo sản phẩm; các nhóm khác đối chiếu, đặt câu hỏi phản biện.',
          step4_Conclude: 'Giáo viên nhận xét quá trình làm việc, chuẩn hóa kiến thức trên bảng và chốt ghi vở.',
        },
        aiIntegrationNote: 'Giới thiệu câu hỏi gợi mở hoặc Prompt mẫu cho học sinh dùng AI tra cứu mở rộng kiến thức.',
        aiPromptSample: `Hãy giải thích ngắn gọn khái niệm trong bài "${request.lessonTitle}" cho học sinh ${request.grade} hiểu một cách dễ nhớ nhất.`,
        digitalCompetencyNote: 'Học sinh biết cách tra cứu thông tin số có chọn lọc và kiểm chứng lại với SGK.',
      },
      {
        id: 'act-3',
        type: 'luyen_tap',
        typeLabel: '3. Hoạt động 3: Luyện tập (10-12 phút)',
        title: isEnglish ? 'Guided Practice & Concept Consolidation' : 'Luyện tập củng cố & Khắc sâu kiến thức',
        objectives: 'Áp dụng trực tiếp kiến thức vừa học để giải quyết các bài tập trong SGK và các câu hỏi rèn luyện kỹ năng.',
        content: 'Học sinh làm bài tập cá nhân, sau đó đổi bài kiểm tra chéo theo cặp.',
        product: 'Bài làm hoàn thiện trong vở ghi hoặc trên phiếu bài tập cá nhân.',
        organization: {
          step1_Transfer: 'Giáo viên giao các bài tập luyện tập cụ thể, quy định thời gian làm bài 7 phút.',
          step2_Perform: 'Học sinh làm bài độc lập; giáo viên đi vòng quanh quan sát, hỗ trợ các học sinh gặp khó khăn.',
          step3_Discuss: 'Gọi 2 học sinh lên bảng trình bày lời giải; cả lớp cùng chữa bài và chấm chéo theo cặp.',
          step4_Conclude: 'Giáo viên nhận xét chung, sửa các lỗi phổ biến mà học sinh thường mắc phải.',
        },
        digitalCompetencyNote: 'Học sinh tự đánh giá và phản hồi kết quả học tập của bạn qua thang đo tiêu chí rõ ràng.',
      },
      {
        id: 'act-4',
        type: 'van_dung',
        typeLabel: '4. Hoạt động 4: Vận dụng / Mở rộng (6-7 phút)',
        title: isEnglish ? 'Application & Creative Expansion' : 'Vận dụng thực tiễn & Mở rộng liên môn',
        objectives: 'Vận dụng kiến thức bài học để giải quyết một tình huống thực tiễn gắn với đời sống hàng ngày.',
        content: 'Học sinh liên hệ kiến thức bài học với bản thân hoặc xây dựng một kế hoạch hành động cụ thể.',
        product: 'Ý tưởng sáng tạo, câu trả lời liên hệ thực tế hoặc bài tập dự án nộp vào tiết sau.',
        organization: {
          step1_Transfer: 'Giáo viên giao câu hỏi vận dụng thực tiễn và nhiệm vụ hướng dẫn tự học tại nhà.',
          step2_Perform: 'Học sinh suy nghĩ độc lập, ghi chép nhanh các ý tưởng vào vở.',
          step3_Discuss: 'Mời 1-2 học sinh chia sẻ ý tưởng trước lớp; khuyến khích các góc nhìn sáng tạo.',
          step4_Conclude: 'Giáo viên tổng kết toàn bộ bài học, dặn dò chuẩn bị bài cho tiết học tiếp theo.',
        },
        aiIntegrationNote: 'Gợi ý học sinh dùng AI ở nhà để hỗ trợ tìm thêm tư liệu thực tế và hoàn thiện dự án học tập.',
        digitalCompetencyNote: 'Học sinh hình thành thói quen sử dụng công nghệ số như công cụ sáng tạo phục vụ cuộc sống.',
      },
    ],
    aiIntegrationDetail: {
      tools: [
        {
          name: 'Google Gemini Edu',
          purpose: 'Cung cấp ví dụ trực quan, hỗ trợ giải thích các khái niệm phức tạp và gợi ý bài tập nâng cao.',
          promptForStudents: `Hãy đưa ra 3 ví dụ thực tiễn sinh động liên quan đến bài học ${request.lessonTitle}.`,
        },
      ],
      aiEthicsRules: [
        'Học sinh luôn tự suy nghĩ trước khi tham khảo ý kiến từ AI.',
        'Kiểm chứng thông tin AI cung cấp với tài liệu học tập chính thống và thầy cô giáo.',
        'Tuyệt đối không chia sẻ thông tin cá nhân bảo mật khi sử dụng công cụ AI.',
      ],
      criticalQuestions: [
        'Thông tin AI trả lời có hoàn toàn chính xác theo sách giáo khoa không?',
        'Em có thể diễn đạt lại câu trả lời theo cách hiểu riêng của mình như thế nào?',
      ],
    },
    digitalCompetencyMatrix: [
      {
        competency: 'Khai thác và tìm kiếm thông tin số',
        activityApplied: 'Hoạt động 2 (Hình thành kiến thức)',
        evidence: 'Học sinh sử dụng thiết bị số để tra cứu và thu thập dữ liệu bài học.',
      },
      {
        competency: 'Ứng dụng AI có trách nhiệm',
        activityApplied: 'Hoạt động 2 & 4 (Vận dụng)',
        evidence: 'Học sinh nhập Prompt tra cứu và biết phản biện tính chính xác của AI.',
      },
      {
        competency: 'Hợp tác và chia sẻ trong môi trường số',
        activityApplied: 'Hoạt động 3 (Luyện tập)',
        evidence: 'Học sinh tương tác và kiểm tra chéo sản phẩm học tập.',
      },
    ],
    stemDetail: {
      realWorldProblem: `Ứng dụng kiến thức bài học ${request.lessonTitle} để giải quyết vấn đề thực tế trong đời sống hàng ngày.`,
      designProcess: [
        '1. Xác định vấn đề cần giải quyết.',
        '2. Lên ý tưởng và thiết kế giải pháp.',
        '3. Thực hiện thử nghiệm và thu thập kết quả.',
        '4. Hoàn thiện và trình bày báo cáo.',
      ],
      testingAndEvaluation: 'Đánh giá dựa trên tính khả thi, tính sáng tạo và khả năng giải quyết vấn đề của sản phẩm.',
    },
    assessmentRubric: [
      {
        criteria: 'Mức độ nắm vững kiến thức bài học',
        levelUnsatisfactory: 'Chưa nhớ được các khái niệm cơ bản, cần giáo viên hướng dẫn lại.',
        levelSatisfactory: 'Nắm được các khái niệm cơ bản, trả lời được câu hỏi nhận biết.',
        levelGood: 'Hiểu rõ kiến thức, tự giải thích và giải quyết được bài tập thông hiểu.',
        levelExcellent: 'Nắm vững kiến thức toàn diện, vận dụng sáng tạo vào tình huống mới.',
      },
      {
        criteria: 'Kỹ năng thực hành và vận dụng',
        levelUnsatisfactory: 'Còn lúng túng khi làm bài tập, gặp nhiều lỗi sai.',
        levelSatisfactory: 'Làm được các bài tập cơ bản nhưng chưa hoàn thiện bài nâng cao.',
        levelGood: 'Làm đúng các bài tập, trình bày rõ ràng, mạch lạc.',
        levelExcellent: 'Làm bài nhanh, chính xác, có cách giải quyết sáng tạo và tối ưu.',
      },
      {
        criteria: 'Thái độ hợp tác và phát triển năng lực số',
        levelUnsatisfactory: 'Thụ động, ít tương tác nhóm và chưa chú ý sử dụng công cụ số.',
        levelSatisfactory: 'Tham gia hoạt động nhóm khi được phân công, dùng công cụ số cơ bản.',
        levelGood: 'Chủ động hợp tác, khai thác tốt công cụ số và tuân thủ nội quy lớp học.',
        levelExcellent: 'Tích cực dẫn dắt nhóm, ứng dụng AI thông minh, có tinh thần phản biện cao.',
      },
    ],
  };
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Record user login history
app.post('/api/auth/log-login', (req, res) => {
  try {
    const { name, email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, error: 'Email không được để trống' });
    }
    const history = readLoginHistory();
    const entry: LoginHistoryEntry = {
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      name: name || email.split('@')[0],
      email: email.trim().toLowerCase(),
      loginTime: new Date().toISOString(),
    };
    history.unshift(entry);
    writeLoginHistory(history);
    return res.json({ success: true, entry });
  } catch (e: any) {
    return res.status(500).json({ success: false, error: e.message });
  }
});

// Get user login history and list of unique colleagues
app.get('/api/auth/history', (req, res) => {
  try {
    const history = readLoginHistory();
    // Unique emails mapping to latest login
    const uniqueMap = new Map<string, { email: string; name: string; lastLogin: string; totalLogins: number }>();
    
    for (const item of history) {
      const emailKey = item.email.toLowerCase();
      if (!uniqueMap.has(emailKey)) {
        uniqueMap.set(emailKey, {
          email: item.email,
          name: item.name,
          lastLogin: item.loginTime,
          totalLogins: 1,
        });
      } else {
        const existing = uniqueMap.get(emailKey)!;
        existing.totalLogins += 1;
      }
    }

    const uniqueAccounts = Array.from(uniqueMap.values());

    return res.json({
      success: true,
      history,
      uniqueAccounts,
      totalLogins: history.length,
      uniqueCount: uniqueAccounts.length,
    });
  } catch (e: any) {
    return res.status(500).json({ success: false, error: e.message });
  }
});

// Get Master Teacher Profile
app.get('/api/profile', (req, res) => {
  const profile = readTeacherProfile();
  return res.json({ success: true, profile, adminEmail: ADMIN_EMAIL });
});

// Save Master Teacher Profile (Admin only)
app.post('/api/profile', (req, res) => {
  try {
    const { userEmail, profile } = req.body;
    if (!userEmail || userEmail.trim().toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      return res.status(403).json({
        success: false,
        error: 'Chỉ tài khoản Admin (mscamtruc99@gmail.com) mới có quyền chỉnh sửa Hồ Sơ Giáo Viên.',
      });
    }
    if (!profile) {
      return res.status(400).json({ success: false, error: 'Dữ liệu hồ sơ không hợp lệ.' });
    }
    writeTeacherProfile(profile);
    return res.json({ success: true, profile });
  } catch (e: any) {
    return res.status(500).json({ success: false, error: e.message });
  }
});

// Get all saved KHBDs
app.get('/api/khbd/list', (req, res) => {
  const plans = readSavedPlans();
  res.json({ success: true, plans });
});

// Save or Update a KHBD
app.post('/api/khbd/save', (req, res) => {
  try {
    const newPlan: LessonPlan = req.body;
    if (!newPlan || !newPlan.id) {
      return res.status(400).json({ success: false, error: 'Dữ liệu Kế hoạch bài dạy không hợp lệ.' });
    }
    const plans = readSavedPlans();
    const existingIndex = plans.findIndex((p) => p.id === newPlan.id);
    if (existingIndex >= 0) {
      plans[existingIndex] = { ...newPlan, updatedAt: new Date().toISOString() };
    } else {
      plans.unshift(newPlan);
    }
    writeSavedPlans(plans);
    return res.json({ success: true, plan: newPlan });
  } catch (e: any) {
    return res.status(500).json({ success: false, error: e.message });
  }
});

// Delete a KHBD
app.delete('/api/khbd/:id', (req, res) => {
  try {
    const { id } = req.params;
    let plans = readSavedPlans();
    plans = plans.filter((p) => p.id !== id);
    writeSavedPlans(plans);
    return res.json({ success: true, id });
  } catch (e: any) {
    return res.status(500).json({ success: false, error: e.message });
  }
});

// Generate KHBD using Gemini AI
app.post('/api/khbd/generate', async (req, res) => {
  try {
    const { request, teacher }: { request: LessonPlanRequest; teacher: TeacherProfile } = req.body;

    if (!request || !request.subject || !request.lessonTitle) {
      return res.status(400).json({ success: false, error: 'Thiếu thông tin yêu cầu soạn bài.' });
    }

    const ai = getGeminiClient();

    const prompt = `
Bạn là Chuyên gia Giáo dục hàng đầu Việt Nam, hiểu sâu sắc Chương trình GDPT 2018 và Công văn 5512/BGDĐT-GDTrH (chuẩn kế hoạch bài dạy dành cho cấp Trung học).

Hãy tạo một Kế hoạch bài dạy (KHBD / Giáo án) đầy đủ, chi tiết, khả thi và đạt tiêu chuẩn xuất sắc theo các tham số sau:

THÔNG TIN GIÁO VIÊN:
- Họ tên: ${teacher?.fullName || 'Giáo viên THCS'}
- Trường: ${teacher?.school || 'Trường THCS'}
- Tổ chuyên môn: ${teacher?.department || 'Tổ Chuyên Môn'}

THAM SỐ BÀI HỌC:
- Môn học: ${request.subject}
- Lớp: ${request.grade}
- Bộ sách giáo khoa: ${request.textbook}
- Chủ đề: ${request.topic}
- Tên bài học: ${request.lessonTitle}
- Tiết số: ${request.lessonNumber}
- Thời lượng: ${request.duration}
- Ngôn ngữ đầu ra (Language): ${request.language === 'English' ? 'English (Toàn bộ giáo án phải soạn thảo bằng Tiếng Anh - Full English Lesson Plan)' : 'Tiếng Việt (Vietnamese)'}

MỨC ĐỘ TÍCH HỢP:
- Tích hợp AI (AI Literacy): ${request.aiLevel} (Cụ thể: Không / Cơ bản / Trung bình / Nâng cao)
- Tích hợp STEM / STEAM: ${request.stemLevel} (Cụ thể: Không / Mini STEM / STEM Project / STEAM)
- Năng lực số cần phát triển: ${request.digitalCompetencies.join(', ') || 'Khái quát'}
- Các tùy chọn thêm: 
  + Giáo dục địa phương: ${request.extraOptions?.localEducation ? 'Có' : 'Không'}
  + Giáo dục môi trường: ${request.extraOptions?.environmental ? 'Có' : 'Không'}
  + Giáo dục hướng nghiệp: ${request.extraOptions?.careerGuidance ? 'Có' : 'Không'}
  + Giáo dục tài chính: ${request.extraOptions?.financialLiteracy ? 'Có' : 'Không'}
  + Chuyển đổi số: ${request.extraOptions?.digitalTransformation ? 'Có' : 'Không'}

YÊU CẦU BỔ SUNG CỦA GIÁO VIÊN:
${request.customInstructions || 'Không có'}

YÊU CẦU CẤU TRÚC JSON ĐẦU RA (Trả về định dạng JSON thuần hợp lệ):
{
  "generalInfo": {
    "subject": "${request.subject}",
    "grade": "${request.grade}",
    "topic": "${request.topic}",
    "lessonTitle": "${request.lessonTitle}",
    "lessonNumber": "${request.lessonNumber}",
    "duration": "${request.duration}",
    "textbook": "${request.textbook}"
  },
  "objectives": {
    "qualities": ["Phẩm chất 1...", "Phẩm chất 2..."],
    "generalCompetencies": ["Năng lực chung 1...", "Năng lực chung 2..."],
    "subjectCompetencies": ["Năng lực đặc thù 1...", "Năng lực đặc thù 2..."]
  },
  "equipment": {
    "teacher": ["Thiết bị GV 1...", "Thiết bị GV 2..."],
    "students": ["Thiết bị HS 1...", "Thiết bị HS 2..."],
    "digitalTools": ["Công cụ AI / Phần mềm số 1...", "Phần mềm 2..."],
    "stemKits": ["Học liệu STEM 1..."]
  },
  "procedure": [
    {
      "id": "act-1",
      "type": "khoi_dong",
      "typeLabel": "1. Hoạt động 1: Mở đầu / Khởi động (8-10 phút)",
      "title": "Tên hoạt động khởi động...",
      "objectives": "Mục tiêu khởi động...",
      "content": "Nội dung học sinh thực hiện...",
      "product": "Sản phẩm cụ thể học sinh nộp/phát biểu...",
      "organization": {
        "step1_Transfer": "Bước 1: Chuyển giao nhiệm vụ...",
        "step2_Perform": "Bước 2: Thực hiện nhiệm vụ...",
        "step3_Discuss": "Bước 3: Báo cáo, thảo luận...",
        "step4_Conclude": "Bước 4: Kết luận, nhận định..."
      },
      "aiIntegrationNote": "Ghi chú tích hợp AI (nếu có)",
      "aiPromptSample": "Ví dụ Prompt mẫu cho HS (nếu có)",
      "digitalCompetencyNote": "Mô tả cụ thể hoạt động phát triển Năng lực số của học sinh (khai thác dữ liệu số, làm việc nhóm trực tuyến, sáng tạo sản phẩm số, an toàn thông tin...)"
    },
    {
      "id": "act-2",
      "type": "hinh_thanh_kt",
      "typeLabel": "2. Hoạt động 2: Hình thành kiến thức mới (30-35 phút)",
      "title": "Tên hoạt động...",
      "objectives": "Mục tiêu...",
      "content": "Nội dung...",
      "product": "Sản phẩm...",
      "organization": {
        "step1_Transfer": "...",
        "step2_Perform": "...",
        "step3_Discuss": "...",
        "step4_Conclude": "..."
      }
    },
    {
      "id": "act-3",
      "type": "luyen_tap",
      "typeLabel": "3. Hoạt động 3: Luyện tập (20-25 phút)",
      "title": "Tên hoạt động luyện tập...",
      "objectives": "...",
      "content": "...",
      "product": "...",
      "organization": {
        "step1_Transfer": "...",
        "step2_Perform": "...",
        "step3_Discuss": "...",
        "step4_Conclude": "..."
      }
    },
    {
      "id": "act-4",
      "type": "van_dung",
      "typeLabel": "4. Hoạt động 4: Vận dụng / Mở rộng (15-20 phút)",
      "title": "Tên hoạt động vận dụng...",
      "objectives": "...",
      "content": "...",
      "product": "...",
      "organization": {
        "step1_Transfer": "...",
        "step2_Perform": "...",
        "step3_Discuss": "...",
        "step4_Conclude": "..."
      }
    }
  ],
  "aiIntegrationDetail": {
    "tools": [
      {
        "name": "Tên công cụ AI",
        "purpose": "Mục đích sử dụng",
        "promptForStudents": "Prompt mẫu cho học sinh nhập"
      }
    ],
    "aiEthicsRules": ["Quy tắc đạo đức 1...", "Quy tắc 2..."],
    "criticalQuestions": ["Câu hỏi phản biện AI 1...", "Câu hỏi 2..."]
  },
  "digitalCompetencyMatrix": [
    {
      "competency": "Tên thành phần Năng lực số",
      "activityApplied": "Áp dụng ở Hoạt động...",
      "evidence": "Minh chứng / Sản phẩm đạt được"
    }
  ],
  "stemDetail": {
    "realWorldProblem": "Vấn đề thực tiễn cần giải quyết...",
    "designProcess": ["Bước 1...", "Bước 2...", "Bước 3..."],
    "testingAndEvaluation": "Phương pháp kiểm thử và đánh giá sản phẩm STEM..."
  },
  "assessmentRubric": [
    {
      "criteria": "Tiêu chí 1",
      "levelUnsatisfactory": "Chưa đạt",
      "levelSatisfactory": "Đạt",
      "levelGood": "Khá",
      "levelExcellent": "Tốt / Xuất sắc"
    }
  ]
}
Chỉ trả về JSON thuần hợp lệ, không chứa văn bản bao quanh.
`;

    let parsedData: any = null;
    try {
      const jsonText = await callGeminiWithFallback({
        prompt,
        temperature: 0.7,
        responseMimeType: 'application/json',
      });
      parsedData = cleanAndParseJSON(jsonText);
    } catch (aiErr) {
      console.warn('AI models unavailable, utilizing intelligent 5512 standard generator fallback:', aiErr);
      const fallbackPlan = buildTemplateLessonPlan(request, teacher);
      parsedData = fallbackPlan;
    }

    const finalSubject = parsedData.generalInfo?.subject || req.body.request?.subject;
    const finalGrade = parsedData.generalInfo?.grade || req.body.request?.grade;
    const isEnglishSub = (finalSubject || '').toLowerCase().includes('tiếng anh') || (finalSubject || '').toLowerCase().includes('english');
    const resolvedTeacher = resolveTeacherName(teacher?.fullName, finalSubject, finalGrade);

    const fullPlan: LessonPlan = {
      id: parsedData.id || ('khbd-' + Date.now()),
      createdAt: parsedData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: parsedData.version || 1,
      ...parsedData,
      teacherInfo: {
        fullName: resolvedTeacher,
        school: teacher?.school || 'Trường THCS Nguyễn Thái Bình',
        department: teacher?.department || (isEnglishSub ? 'Tổ Tiếng Anh' : 'Tổ Chuyên Môn'),
      },
    };

    // Auto save to local storage
    const plans = readSavedPlans();
    plans.unshift(fullPlan);
    writeSavedPlans(plans);

    return res.json({ success: true, plan: fullPlan });
  } catch (e: any) {
    console.error('Error generating KHBD:', e);
    // Final emergency fallback so user never has an error screen
    try {
      const emergencyPlan = buildTemplateLessonPlan(req.body.request, req.body.teacher);
      const plans = readSavedPlans();
      plans.unshift(emergencyPlan);
      writeSavedPlans(plans);
      return res.json({ success: true, plan: emergencyPlan });
    } catch (emergencyErr) {
      return res.status(500).json({ success: false, error: e.message || 'Lỗi khi sinh Kế hoạch bài dạy từ AI.' });
    }
  }
});

// Refine/Modify KHBD via Chat Assistant
app.post('/api/khbd/refine', async (req, res) => {
  try {
    const { currentPlan, instruction }: { currentPlan: LessonPlan; instruction: string } = req.body;

    if (!currentPlan || !instruction) {
      return res.status(400).json({ success: false, error: 'Thiếu dữ liệu Kế hoạch bài dạy hoặc câu lệnh điều chỉnh.' });
    }

    const ai = getGeminiClient();

    const prompt = `
Bạn là Chuyên gia Điều chỉnh Giáo án GDPT 2018.

Dưới đây là Kế hoạch bài dạy hiện tại dưới dạng JSON:
${JSON.stringify(currentPlan, null, 2)}

YÊU CẦU ĐIỀU CHỈNH TỪ GIÁO VIÊN:
"${instruction}"

Hãy cập nhật lại toàn bộ Kế hoạch bài dạy JSON trên theo đúng yêu cầu điều chỉnh.
Đảm bảo giữ nguyên các cấu trúc bắt buộc của Công văn 5512 (4 bước trong từng hoạt động) và tăng cường/chỉnh sửa hợp lý các yếu tố AI, STEM, Năng lực số.
Tăng số phiên bản (version) lên +1.

Trả về kết quả bằng định dạng JSON thuần hợp lệ duy nhất của Kế hoạch bài dạy đã cập nhật.
`;

    const jsonText = await callGeminiWithFallback({
      prompt,
      temperature: 0.6,
      responseMimeType: 'application/json',
    });

    const updatedPlan: LessonPlan = cleanAndParseJSON(jsonText);

    updatedPlan.updatedAt = new Date().toISOString();
    if (!updatedPlan.version) updatedPlan.version = (currentPlan.version || 1) + 1;

    // Save updated version
    const plans = readSavedPlans();
    const idx = plans.findIndex((p) => p.id === updatedPlan.id);
    if (idx >= 0) {
      plans[idx] = updatedPlan;
    } else {
      plans.unshift(updatedPlan);
    }
    writeSavedPlans(plans);

    return res.json({ success: true, plan: updatedPlan });
  } catch (e: any) {
    console.error('Error refining KHBD:', e);
    return res.status(500).json({ success: false, error: e.message || 'Lỗi khi điều chỉnh Kế hoạch bài dạy.' });
  }
});

// Review / Audit KHBD according to CV 5512 & GDPT 2018
app.post('/api/khbd/review', async (req, res) => {
  try {
    const { plan }: { plan: LessonPlan } = req.body;
    if (!plan) {
      return res.status(400).json({ success: false, error: 'Thiếu Kế hoạch bài dạy để phản biện.' });
    }

    const prompt = `
Bạn là Trợ lý AI Phản biện Kế hoạch Bài dạy (Hội đồng Kiểm định Chuyên môn GDPT 2018).

Dưới đây là KHBD cần đánh giá:
Môn: ${plan.generalInfo?.subject}, Lớp: ${plan.generalInfo?.grade}, Tên bài: ${plan.generalInfo?.lessonTitle}
Nội dung KHBD:
${JSON.stringify(plan, null, 2)}

Hãy phân tích, chấm điểm và đưa ra phản biện chuyên sâu theo các tiêu chuẩn:
1. Độ tuân thủ Công văn 5512/BGDĐT-GDTrH (Có đủ 4 mục lớn, 4 hoạt động bài học, 4 bước tổ chức thực hiện không?)
2. Chất lượng Tích hợp Trí tuệ nhân tạo (AI Literacy) & Đạo đức AI.
3. Độ phù hợp Tích hợp STEM / STEAM & Tính thực tiễn.
4. Mức độ đáp ứng Khung Năng lực số GDPT 2018.

Trả về kết quả dưới định dạng JSON thuần hợp lệ có cấu trúc:
{
  "overallScore": 92, // Điểm số từ 0 - 100
  "compliance5512": "Đánh giá mức độ tuân thủ CV 5512...",
  "aiRating": "Đánh giá tích hợp AI...",
  "stemRating": "Đánh giá tích hợp STEM...",
  "digitalCompRating": "Đánh giá Năng lực số...",
  "suggestions": [
    "Gợi ý nâng cấp 1...",
    "Gợi ý nâng cấp 2...",
    "Gợi ý nâng cấp 3..."
  ]
}
`;

    const jsonText = await callGeminiWithFallback({
      prompt,
      temperature: 0.5,
      responseMimeType: 'application/json',
    });

    const reviewScore = cleanAndParseJSON(jsonText);
    return res.json({ success: true, reviewScore });
  } catch (e: any) {
    console.error('Error reviewing KHBD:', e);
    return res.status(500).json({ success: false, error: e.message || 'Lỗi khi phản biện Kế hoạch bài dạy.' });
  }
});

// Generate Student Worksheet / Quiz
app.post('/api/khbd/generate-worksheet', async (req, res) => {
  try {
    const { plan }: { plan: LessonPlan } = req.body;
    if (!plan) {
      return res.status(400).json({ success: false, error: 'Thiếu KHBD để sinh phiếu học tập.' });
    }

    const prompt = `
Bạn là Chuyên gia Thiết kế Học liệu Số THCS.
Hãy tạo một Phiếu học tập (Worksheet) số sinh động gắn liền với bài học:
Môn: ${plan.generalInfo.subject}, Lớp: ${plan.generalInfo.grade}, Bài: ${plan.generalInfo.lessonTitle}

Yêu cầu Phiếu học tập gồm:
1. Phần I: Khởi động & Nhận biết (3 câu trắc nghiệm đơn giản)
2. Phần II: Thông hiểu & Vận dụng (2 bài tập thực hành/tình huống)
3. Phần III: Thử thách AI Mini (1 nhiệm vụ yêu cầu HS nhập Prompt hỏi AI & kiểm chứng kết quả)

Trả về định dạng JSON thuần hợp lệ:
{
  "title": "PHIẾU HỌC TẬP SỐ: ...",
  "subject": "${plan.generalInfo.subject}",
  "grade": "${plan.generalInfo.grade}",
  "sections": [
    {
      "sectionTitle": "Phần 1: Khởi động & Nhận biết",
      "instructions": "Hãy chọn đáp án đúng nhất...",
      "questions": [
        {
          "id": "q1",
          "question": "Câu hỏi 1...",
          "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
          "answerKey": "A",
          "bloomLevel": "Nhận biết"
        }
      ]
    }
  ],
  "aiMiniChallenge": {
    "task": "Nhiệm vụ nhập Prompt hỏi AI...",
    "suggestedPrompt": "Prompt mẫu gợi ý cho HS...",
    "reflectionQuestion": "Câu hỏi phản biện sau khi nhận phản hồi từ AI..."
  }
}
`;

    const jsonText = await callGeminiWithFallback({
      prompt,
      temperature: 0.6,
      responseMimeType: 'application/json',
    });

    const worksheet: StudentWorksheet = cleanAndParseJSON(jsonText);
    return res.json({ success: true, worksheet });
  } catch (e: any) {
    console.error('Error generating worksheet:', e);
    return res.status(500).json({ success: false, error: e.message || 'Lỗi khi sinh phiếu học tập.' });
  }
});

// START SERVER / VITE MIDDLEWARE
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AI KHBD GDPT 2018 Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
