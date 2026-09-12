import { PromptItem } from '../types';

export const PROMPT_LIBRARY_ITEMS: PromptItem[] = [
  {
    id: 'p-1',
    title: 'Soạn 5 câu hỏi Phân hóa theo Thang đo Bloom',
    category: 'Đánh giá & Kiểm tra',
    description: 'Tạo bộ câu hỏi đủ 4 cấp độ Bloom (Nhận biết, Thông hiểu, Vận dụng, Vận dụng cao) cho bất kỳ bài học THCS.',
    promptText: `Bạn là chuyên gia giáo dục GDPT 2018. Hãy tạo 5 câu hỏi trắc nghiệm và 1 câu hỏi tự luận vận dụng cao cho bài học: [TÊN BÀI HỌC], môn [MÔN HỌC], lớp [LỚP].

Yêu cầu:
1. Phân chia rõ 4 mức độ: Nhận biết (2 câu), Thông hiểu (2 câu), Vận dụng (1 câu), Vận dụng cao (1 câu tự luận).
2. Đáp án kèm lời giải chi tiết giải thích tại sao đúng/sai.
3. Tích hợp 1 tình huống thực tế đời sống liên quan đến chủ đề bài học.`,
    tags: ['Bloom', 'Đề kiểm tra', 'Trắc nghiệm', 'GDPT 2018'],
  },
  {
    id: 'p-2',
    title: 'Tạo Trò chơi Trắc nghiệm Kahoot / Quizizz',
    category: 'Hoạt động Khởi động & Trò chơi',
    description: 'Sinh danh sách 10 câu hỏi trò chơi khởi động kèm thời gian và đáp án định dạng bảng sẵn sàng import.',
    promptText: `Hãy đóng vai giáo viên sáng tạo. Hãy tạo 10 câu hỏi trò chơi khởi động cực kỳ sinh động cho môn [MÔN HỌC] [LỚP], bài [TÊN BÀI HỌC].

Định dạng bảng gồm các cột:
| STT | Câu hỏi ngắn (max 120 ký tự) | Tùy chọn A | Tùy chọn B | Tùy chọn C | Tùy chọn D | Đáp án đúng | Thời gian (Giây) |
Yêu cầu câu hỏi ngắn gọn, hài hước, gây tò mò cho học sinh THCS.`,
    tags: ['Kahoot', 'Quizizz', 'Trò chơi', 'Khởi động'],
  },
  {
    id: 'p-3',
    title: 'Thiết kế Prompt Canva AI tạo Slide Bài giảng',
    category: 'Sáng tạo Nội dung số',
    description: 'Tạo danh sách gợi ý Prompt thiết kế hình ảnh, trang trình chiếu và infographic sinh động trên Canva.',
    promptText: `Bạn là Chuyên gia Thiết kế Đồ họa Giáo dục. Hãy gợi ý 5 Prompt bằng Tiếng Anh và Tiếng Việt để nhập vào Canva Magic Media nhằm tạo hình ảnh minh họa cho bài giảng [TÊN BÀI HỌC], môn [MÔN HỌC] [LỚP].

Ví dụ yêu cầu:
- Tải bản vẽ 3D phẳng, màu sắc tươi sáng, phong cách giáo dục THCS.
- Không chứa chữ bị lỗi font.
- Mô tả chi tiết bối cảnh, nhân vật và ánh sáng.`,
    tags: ['Canva', 'AI Image', 'Slide', 'Infographic'],
  },
  {
    id: 'p-4',
    title: 'Tạo Rubric Đánh giá Năng lực Nhóm 4 Mức độ',
    category: 'Đánh giá & Rubric',
    description: 'Tạo tiêu chí chấm điểm hoạt động thảo luận nhóm, sản phẩm STEM hoặc bài thuyết trình theo chuẩn 5512.',
    promptText: `Hãy lập bảng Rubric đánh giá năng lực hoạt động nhóm / sản phẩm STEM cho bài học [TÊN BÀI HỌC], môn [MÔN HỌC].

Bảng gồm 4 mức độ:
1. Chưa đạt (1-4 điểm)
2. Đạt (5-6 điểm)
3. Khá (7-8 điểm)
4. Tốt (9-10 điểm)

Các tiêu chí đánh giá gồm:
- Tinh thần hợp tác & Phân công nhiệm vụ.
- Chất lượng sản phẩm / Nội dung học tập.
- Kỹ năng ứng dụng công nghệ / AI / STEM.
- Kỹ năng thuyết trình & Phản biện.`,
    tags: ['Rubric', 'Đánh giá năng lực', 'STEM', 'Thảo luận nhóm'],
  },
  {
    id: 'p-5',
    title: 'Gợi ý Ý tưởng Thí nghiệm & Dự án STEM Mini',
    category: 'STEM & STEAM',
    description: 'Sinh 3 ý tưởng dự án STEM giá rẻ, dễ tìm nguyên liệu tại địa phương cho môn KHTN / Công nghệ / Toán.',
    promptText: `Hãy đóng vai Chuyên gia STEM Giáo dục THCS. Hãy đề xuất 3 ý tưởng Dự án Mini STEM gắn liền với bài học [TÊN BÀI HỌC], môn [MÔN HỌC] [LỚP].

Mỗi ý tưởng gồm:
1. Tên dự án & Vấn đề thực tiễn cần giải quyết.
2. Nguyên vật liệu dễ tìm, tái chế, chi phí < 20.000đ.
3. Quy trình 5 bước thực hiện của học sinh.
4. Tiêu chí kiểm thử sản phẩm.`,
    tags: ['STEM', 'Dự án Mini', 'Tái chế', 'Thực hành'],
  },
  {
    id: 'p-6',
    title: 'Thêm Câu hỏi Phản biện & Đạo đức AI cho Học sinh',
    category: 'AI Literacy & Đạo đức',
    description: 'Tạo các tình huống giả định rèn luyện tư duy phản biện khi sử dụng AI trong học tập.',
    promptText: `Hãy tạo 3 câu hỏi tình huống thực tế về Đạo đức AI và Tư duy phản biện dành cho học sinh THCS trong giờ học môn [MÔN HỌC].

Ví dụ tình huống: Học sinh nhờ AI viết hộ bài văn/giải bài tập toán và nộp nguyên văn cho giáo viên.
Yêu cầu: Mỗi tình huống kèm câu hỏi gợi mở để giáo viên tổ chức cho học sinh tranh luận trong 5 phút.`,
    tags: ['AI Ethics', 'Tư duy phản biện', 'Đạo đức AI'],
  },
];
