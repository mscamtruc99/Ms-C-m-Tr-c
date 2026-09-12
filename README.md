# AI KHBD - Soạn Kế Hoạch Bài Dạy GDPT 2018 (THCS)

Ứng dụng Web AI chuyên nghiệp trợ giúp Giáo viên Trung học cơ sở (Lớp 6–9) khởi tạo và quản lý **Kế hoạch bài dạy (KHBD / Giáo án)** chuẩn **Chương trình Giáo dục phổ thông 2018** (Công văn 5512/BGDĐT-GDTrH và Công văn 2345/BGDĐT), tích hợp **Năng lực số (DigComp / Khung Bộ GD&ĐT)**, **Trí tuệ nhân tạo (AI Literacy & Ethics)** và **STEM / STEAM**.

---

## 🌟 Màn Hình & Tính Năng Nổi Bật

1. **Dashboard Quản Lý & Thống Kê**:
   - Theo dõi số lượng KHBD đã tạo, tỷ lệ tích hợp AI, STEM, năng lực số.
   - Lọc và tìm kiếm nhanh bài giảng theo môn học, khối lớp, bộ sách.

2. **Hồ Sơ Giáo Viên (Teacher Profile)**:
   - Lưu giữ thông tin Họ tên, Trường, Tổ chuyên môn, Môn giảng dạy, Bộ sách giáo khoa (Kết nối tri thức, Chân trời sáng tạo, Cánh diều) và Phong cách sư phạm.
   - Tự động tích hợp thông tin vào mọi bài giảng do AI sinh ra.

3. **Công Cụ Soạn Bài AI chuẩn 5512**:
   - Nhập môn, lớp, thời lượng, tên bài học.
   - Lựa chọn mức độ tích hợp AI (Cơ bản / Trung bình / Nâng cao) và STEM (Mini STEM / Project / STEAM).
   - Chọn các miền Năng lực số DigComp (Tìm kiếm, Đánh giá, Giao tiếp số, Sáng tạo nội dung số, AI Literacy, AI Ethics, Data Literacy).

4. **Trợ Lý Phản Biện & Đánh Giá KHBD**:
   - Chấm điểm và phân tích độ tuân thủ Công văn 5512.
   - Gợi ý nâng cấp giáo án từ mức Khá lên Xuất sắc.

5. **Sinh Phiếu Học Tập & Thử Thách AI Cho Học Sinh**:
   - Tự động sinh phiếu bài tập phân hóa theo thang đo Bloom kèm Thử thách Prompt AI cho học sinh.

6. **Trợ Lý Tinh Chỉnh AI Trực Tiếp (AI Chat Assistant)**:
   - Cửa sổ chat chỉnh sửa KHBD trực tiếp theo thời gian thực (ví dụ: "Sửa Hoạt động 2 để tăng hàm lượng STEM", "Rút ngắn bài giảng còn 1 tiết").

7. **Xuất File Đa Định Dạng**:
   - Xuất file MS Word (.docx) chuẩn định dạng trình bày của Bộ GD&ĐT.
   - In / Xuất PDF, Sao chép Markdown.

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Local

### 1. Yêu cầu hệ thống
- Node.js >= 18.x
- npm / pnpm / yarn

### 2. Cài đặt Dependencies
```bash
npm install
```

### 3. Cấu hình Biến Môi Trường (`.env`)
Tạo file `.env` ở thư mục gốc:
```env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3000
```

### 4. Chạy chế độ Phát triển (Development)
```bash
npm run dev
```
Truy cập ứng dụng tại: `http://localhost:3000`

### 5. Build Sản Phẩm (Production)
```bash
npm run build
npm run start
```

---

## 🐳 Triển Khai Với Docker

Tạo `Dockerfile`:
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
RUN npm ci --only=production
EXPOSE 3000
CMD ["node", "dist/server.cjs"]
```

Build và chạy container:
```bash
docker build -t ai-khbd-gdpt2018 .
docker run -p 3000:3000 -e GEMINI_API_KEY="MY_API_KEY" ai-khbd-gdpt2018
```

---

## 📄 Quy Định & Tài Liệu Tham Chiếu
- **Công văn 5512/BGDĐT-GDTrH**: Khung cấu trúc Kế hoạch bài dạy chuẩn 4 mục và 4 bước tổ chức hoạt động.
- **Công văn 2345/BGDĐT-GDTH**: Hướng dẫn kế hoạch bài dạy phát triển năng lực và tích hợp chuyển đổi số.
- **Khung Năng lực số GDPT 2018 & DigComp 2.2**: 5 miền năng lực số dành cho học sinh THCS.

---

## 📝 Giấy Phép & Bản Quyền
Phát triển bởi **Google AI Studio Agent**. Phát hành dưới giấy phép Apache 2.0.
