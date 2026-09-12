/**
 * Khung Năng lực số GDPT 2018 cho Học sinh THCS (DigComp & Bộ GD&ĐT)
 */
export interface DigitalCompetencyGroup {
  category: string;
  items: {
    id: string;
    name: string;
    description: string;
  }[];
}

export const DIGITAL_COMPETENCY_GROUPS: DigitalCompetencyGroup[] = [
  {
    category: '1. Vận hành thiết bị & Khai thác dữ liệu',
    items: [
      {
        id: 'search_info',
        name: 'Tìm kiếm thông tin số',
        description: 'Sử dụng công cụ tìm kiếm, từ khóa thông minh và bộ lọc dữ liệu trực tuyến.',
      },
      {
        id: 'eval_info',
        name: 'Đánh giá & Trích dẫn thông tin',
        description: 'Phân biệt thông tin tin cậy, thông tin sai lệch (fake news) và trích dẫn nguồn số hợp lệ.',
      },
      {
        id: 'data_literacy',
        name: 'Phân tích dữ liệu số (Data Literacy)',
        description: 'Đọc bảng biểu, vẽ biểu đồ số và trích xuất tri thức từ dữ liệu.',
      },
    ],
  },
  {
    category: '2. Giao tiếp, Hợp tác & Văn hóa số',
    items: [
      {
        id: 'digital_comm',
        name: 'Giao tiếp số (Digital Communication)',
        description: 'Sử dụng email, nhóm thảo luận trực tuyến đúng văn hóa mạng (Netiquette).',
      },
      {
        id: 'digital_collab',
        name: 'Hợp tác số (Digital Collaboration)',
        description: 'Cùng chỉnh sửa tài liệu, bài thuyết trình trực tuyến theo thời gian thực (Google Docs/Slides, Padlet).',
      },
    ],
  },
  {
    category: '3. Sáng tạo nội dung số & AI Literacy',
    items: [
      {
        id: 'content_creation',
        name: 'Tạo nội dung số (Digital Content Creation)',
        description: 'Thiết kế sơ đồ tư duy, infographic, video, bài trình chiếu đa phương tiện (Canva, PowerPoint, CapCut).',
      },
      {
        id: 'ai_literacy',
        name: 'Hiểu biết & Soạn Prompt AI (AI Literacy)',
        description: 'Đặt câu hỏi (Prompt) hiệu quả cho AI, phân tích kết quả do AI sinh ra.',
      },
      {
        id: 'ai_ethics',
        name: 'Đạo đức & Bản quyền AI (AI Ethics)',
        description: 'Tôn trọng bản quyền tác giả, tuân thủ quy tắc không gian mạng và không lạm dụng AI.',
      },
    ],
  },
  {
    category: '4. An toàn số & Giải quyết vấn đề',
    items: [
      {
        id: 'cyber_security',
        name: 'An toàn số & Bảo mật thông tin',
        description: 'Bảo vệ mật khẩu, thông tin cá nhân và phòng tránh lừa đảo trên internet.',
      },
      {
        id: 'prob_solving',
        name: 'Giải quyết vấn đề bằng công nghệ',
        description: 'Sử dụng phần mềm, công cụ tính toán để giải quyết các bài toán môn học.',
      },
    ],
  },
];
