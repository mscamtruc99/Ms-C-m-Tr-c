export interface GuidelineDoc {
  id: string;
  code: string;
  title: string;
  issuedBy: string;
  summary: string;
  keyPoints: string[];
}

export const OFFICIAL_GUIDELINES: GuidelineDoc[] = [
  {
    id: 'cv-5512',
    code: 'Công văn 5512/BGDĐT-GDTrH',
    title: 'Xây dựng và tổ chức thực hiện kế hoạch giáo dục của nhà trường (THCS & THPT)',
    issuedBy: 'Bộ Giáo dục và Đào tạo',
    summary: 'Quy định khung cấu trúc Kế hoạch bài dạy (Giáo án) chuẩn gồm 4 mục chính và 4 bước tổ chức cho mỗi hoạt động.',
    keyPoints: [
      'Khung cấu trúc KHBD: I. Mục tiêu (Phẩm chất, Năng lực), II. Thiết bị dạy học & học liệu, III. Tiến trình dạy học, IV. Phụ lục/Đánh giá.',
      'Cấu trúc 4 Hoạt động: 1. Khởi động / Mở đầu -> 2. Hình thành kiến thức mới -> 3. Luyện tập -> 4. Vận dụng.',
      'Mỗi hoạt động phải rõ 4 thành phần: a) Mục tiêu, b) Nội dung, c) Sản phẩm học tập, d) Tổ chức thực hiện.',
      'Tổ chức thực hiện gồm 4 bước bắt buộc: Bước 1: Chuyển giao nhiệm vụ; Bước 2: Thực hiện nhiệm vụ; Bước 3: Báo cáo, thảo luận; Bước 4: Kết luận, nhận định.',
    ],
  },
  {
    id: 'tt-22-2021',
    code: 'Thông tư 22/2021/BGDĐT',
    title: 'Quy định về đánh giá học sinh trung học cơ sở và trung học phổ thông (THCS & THPT)',
    issuedBy: 'Bộ Giáo dục và Đào tạo',
    summary: 'Quy định phương pháp đánh giá thường xuyên, đánh giá định kỳ, đánh giá bằng nhận xét và xây dựng công cụ đánh giá (Rubric) cho học sinh THCS & THPT.',
    keyPoints: [
      'Đánh giá thường xuyên được thực hiện thông qua: hỏi - đáp, viết, thuyết trình, thực hành, thí nghiệm, sản phẩm học tập.',
      'Khuyến khích sử dụng bảng tiêu chí (Rubric) để đánh giá năng lực và sự tiến bộ của học sinh trong từng hoạt động học.',
      'Kết hợp linh hoạt giữa đánh giá của giáo viên, tự đánh giá của học sinh và đánh giá đồng đẳng (nhóm).',
      'Gắn kết chặt chẽ kết quả đánh giá với yêu cầu cần đạt theo Chương trình GDPT 2018.',
    ],
  },
  {
    id: 'digcomp-2018',
    code: 'Khung Năng lực số GDPT 2018',
    title: 'Định hướng Phát triển Năng lực số & AI Literacy cho học sinh phổ thông',
    issuedBy: 'Bộ GD&ĐT & Tham chiếu DigComp 2.2',
    summary: 'Xác định 5 miền năng lực số cốt lõi mà học sinh THCS cần đạt khi tốt nghiệp.',
    keyPoints: [
      '1. Vận hành & Tra cứu: Biết tìm kiếm thông tin bằng bộ lọc và từ khóa nâng cao.',
      '2. Đánh giá & An toàn: Phân biệt tin giả, bảo vệ dữ liệu cá nhân, tuân thủ an toàn mạng.',
      '3. Sáng tạo nội dung số: Thiết kế slide, sơ đồ, bài viết đa phương tiện.',
      '4. AI Literacy & Đạo đức: Biết đặt câu hỏi (Prompt) cho AI, kiểm chứng thông tin AI, không gian lận academic.',
      '5. Giải quyết vấn đề số: Sử dụng phần mềm chuyên ngành (Bảng tính, phần mềm vẽ hình, lập trình).',
    ],
  },
  {
    id: 'stem-2018',
    code: 'Định hướng Giáo dục STEM GDPT 2018',
    title: 'Tích hợp STEM/STEAM trong các môn Tự nhiên & Công nghệ THCS',
    issuedBy: 'Bộ Giáo dục và Đào tạo',
    summary: '3 hình thức tổ chức STEM: Bài học STEM, Trải nghiệm STEM, Dự án NCKH Kỹ thuật.',
    keyPoints: [
      'Quy trình thiết kế kỹ thuật 8 bước: Xác định vấn đề -> Tìm hiểu kiến thức nền -> Đề xuất giải pháp -> Lựa chọn giải pháp -> Chế tạo thử nghiệm -> Kiểm thử đánh giá -> Chia sẻ thảo luận -> Hoàn thiện.',
      'Sử dụng nguyên vật liệu tái chế, chi phí thấp, gắn với thực tiễn địa phương.',
      'Đánh giá theo Rubric quá trình sáng tạo và khả năng vận dụng kiến thức liên môn.',
    ],
  },
];
