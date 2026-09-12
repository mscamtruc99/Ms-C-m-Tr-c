import { auth, getCachedAccessToken, signInWithGoogleDrive, signOutGoogleDrive } from './googleDriveService';
import { LessonPlan } from '../types';
import { generateDocxBlob } from '../utils/docxExporter';

export interface GmailProfile {
  emailAddress: string;
  messagesTotal?: number;
  threadsTotal?: number;
  historyId?: string;
}

export interface GmailMessageHeader {
  name: string;
  value: string;
}

export interface GmailMessageItem {
  id: string;
  threadId: string;
  snippet?: string;
  subject?: string;
  from?: string;
  to?: string;
  date?: string;
}

export interface SendLessonPlanEmailParams {
  to: string;
  cc?: string;
  bcc?: string;
  subject: string;
  customMessage?: string;
  lessonPlan: LessonPlan;
  attachDocx?: boolean;
}

// Check if user is connected
export const isGmailConnected = (): boolean => {
  return Boolean(getCachedAccessToken() && auth.currentUser);
};

export const signInWithGmail = async () => {
  return signInWithGoogleDrive();
};

export const signOutGmail = async () => {
  return signOutGoogleDrive();
};

// Helper to convert UTF-8 string to Base64
function utf8ToBase64(str: string): string {
  return btoa(unescape(encodeURIComponent(str)));
}

// Helper to convert ArrayBuffer to Base64
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Convert base64 to base64url
function toBase64Url(base64Str: string): string {
  return base64Str.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Fetch Gmail user profile
 */
export const getGmailProfile = async (): Promise<GmailProfile> => {
  const token = getCachedAccessToken();
  if (!token) throw new Error('Chưa kết nối Gmail. Vui lòng đăng nhập Google!');

  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Không thể lấy thông tin tài khoản Gmail');
  }

  return res.json();
};

/**
 * Build RFC 2822 MIME message for Lesson Plan
 */
async function buildLessonPlanMimeMessage(params: SendLessonPlanEmailParams): Promise<string> {
  const { to, cc, bcc, subject, customMessage, lessonPlan, attachDocx = true } = params;
  const boundary = `====_khbd_boundary_${Date.now()}_====`;

  // Format rich HTML body for teaching plan
  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1e293b; margin: 0; padding: 20px; background-color: #f8fafc; }
  .card { max-width: 680px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
  .header { background: linear-gradient(135deg, #0284c7, #0369a1); color: #ffffff; padding: 24px; text-align: left; }
  .header h1 { margin: 0 0 6px 0; font-size: 20px; font-weight: 800; }
  .header p { margin: 0; font-size: 13px; opacity: 0.9; }
  .content { padding: 24px; }
  .note-box { background: #f0fdf4; border-left: 4px solid #16a34a; padding: 14px 18px; border-radius: 8px; margin-bottom: 20px; font-size: 14px; color: #166534; }
  .table { width: 100%; border-collapse: collapse; margin-top: 14px; font-size: 13px; }
  .table th, .table td { border: 1px solid #e2e8f0; padding: 10px 12px; text-align: left; }
  .table th { background: #f1f5f9; color: #475569; font-weight: 700; width: 30%; }
  .activity-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px; margin-top: 12px; }
  .activity-title { font-weight: 700; color: #0f172a; margin-bottom: 4px; }
  .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px 24px; font-size: 12px; color: #64748b; text-align: center; }
</style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>KẾ HOẠCH BÀI DẠY (KHBD) CHUẨN GDPT 2018</h1>
      <p>Môn: ${lessonPlan.generalInfo.subject} • Khối: ${lessonPlan.generalInfo.grade} • Bộ sách: ${lessonPlan.generalInfo.textbook}</p>
    </div>
    <div class="content">
      ${customMessage ? `<div class="note-box"><strong>Ghi chú từ Giáo viên:</strong><br>${customMessage.replace(/\n/g, '<br>')}</div>` : ''}

      <h2 style="font-size: 16px; color: #0f172a; margin-top: 0;">1. THÔNG TIN BÀI HỌC</h2>
      <table class="table">
        <tr><th>Tên bài dạy</th><td><strong>${lessonPlan.generalInfo.lessonTitle}</strong></td></tr>
        <tr><th>Thời lượng</th><td>${lessonPlan.generalInfo.duration}</td></tr>
        <tr><th>Bộ sách</th><td>${lessonPlan.generalInfo.textbook}</td></tr>
        <tr><th>Giáo viên soạn</th><td>${lessonPlan.teacherInfo?.fullName || 'Giáo viên'} (${lessonPlan.teacherInfo?.school || ''} - ${lessonPlan.teacherInfo?.department || ''})</td></tr>
      </table>

      <h2 style="font-size: 16px; color: #0f172a; margin-top: 24px;">2. TIẾN TRÌNH CÁC HOẠT ĐỘNG (CV 5512)</h2>
      ${(lessonPlan.procedure || []).map((act, idx) => `
        <div class="activity-card">
          <div class="activity-title">${act.typeLabel || `Hoạt động ${idx + 1}`}: ${act.title || ''}</div>
          <p style="margin: 0; font-size: 13px; color: #334155;"><strong>Mục tiêu:</strong> ${act.objectives || 'Theo chuẩn chương trình GDPT 2018'}</p>
        </div>
      `).join('')}

      <div style="margin-top: 20px; font-size: 13px; color: #475569;">
        <em>📎 ${attachDocx ? 'File Word (.docx) đính kèm đầy đủ chi tiết 4 bước chuyển giao, thực hiện, thảo luận, kết luận, ma trận số và bảng rubric.' : 'Xem chi tiết Kế hoạch bài dạy đầy đủ trong hệ thống.'}</em>
      </div>
    </div>
    <div class="footer">
      Email được gửi tự động từ Ứng dụng AI Soạn KHBD GDPT 2018 (ThS. Lê Thị Cẩm Trúc)
    </div>
  </div>
</body>
</html>
`;

  // Headers
  const encodedSubject = `=?UTF-8?B?${utf8ToBase64(subject)}?=`;
  const headers: string[] = [
    `To: ${to}`,
    `Subject: ${encodedSubject}`,
    'MIME-Version: 1.0',
  ];
  if (cc) headers.push(`Cc: ${cc}`);
  if (bcc) headers.push(`Bcc: ${bcc}`);

  let mimeMessage = '';

  if (attachDocx) {
    headers.push(`Content-Type: multipart/mixed; boundary="${boundary}"`);
    mimeMessage = headers.join('\r\n') + '\r\n\r\n';

    // HTML Body part
    mimeMessage += `--${boundary}\r\n`;
    mimeMessage += 'Content-Type: text/html; charset="UTF-8"\r\n';
    mimeMessage += 'Content-Transfer-Encoding: base64\r\n\r\n';
    mimeMessage += utf8ToBase64(htmlBody) + '\r\n\r\n';

    // Attachment part
    const { blob, fileName } = await generateDocxBlob(lessonPlan);
    const arrayBuffer = await blob.arrayBuffer();
    const base64Docx = arrayBufferToBase64(arrayBuffer);

    mimeMessage += `--${boundary}\r\n`;
    mimeMessage += `Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document; name="${fileName}"\r\n`;
    mimeMessage += `Content-Disposition: attachment; filename="${fileName}"\r\n`;
    mimeMessage += 'Content-Transfer-Encoding: base64\r\n\r\n';
    mimeMessage += base64Docx + '\r\n\r\n';

    mimeMessage += `--${boundary}--`;
  } else {
    headers.push('Content-Type: text/html; charset="UTF-8"');
    headers.push('Content-Transfer-Encoding: base64');
    mimeMessage = headers.join('\r\n') + '\r\n\r\n';
    mimeMessage += utf8ToBase64(htmlBody);
  }

  return mimeMessage;
}

/**
 * Send Lesson Plan Email via Gmail API
 */
export const sendLessonPlanEmail = async (
  params: SendLessonPlanEmailParams
): Promise<{ id: string; threadId: string }> => {
  const token = getCachedAccessToken();
  if (!token) throw new Error('Chưa kết nối Gmail. Vui lòng đăng nhập Google!');

  const mimeString = await buildLessonPlanMimeMessage(params);
  const raw = toBase64Url(utf8ToBase64(mimeString));

  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ raw }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Không thể gửi email qua Gmail');
  }

  return res.json();
};

/**
 * Save Lesson Plan as a Draft in Gmail
 */
export const createLessonPlanDraft = async (
  params: SendLessonPlanEmailParams
): Promise<{ id: string; message: { id: string } }> => {
  const token = getCachedAccessToken();
  if (!token) throw new Error('Chưa kết nối Gmail. Vui lòng đăng nhập Google!');

  const mimeString = await buildLessonPlanMimeMessage(params);
  const raw = toBase64Url(utf8ToBase64(mimeString));

  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/drafts', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: { raw },
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Không thể lưu bản nháp vào Gmail');
  }

  return res.json();
};

/**
 * List recent messages sent or received in Gmail
 */
export const listRecentGmailMessages = async (
  query: string = '',
  maxResults: number = 10
): Promise<GmailMessageItem[]> => {
  const token = getCachedAccessToken();
  if (!token) return [];

  try {
    const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}&q=${encodeURIComponent(
      query
    )}`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) return [];

    const data = await res.json();
    if (!data.messages || data.messages.length === 0) return [];

    // Fetch message headers in parallel
    const detailPromises = data.messages.slice(0, 8).map(async (msg: { id: string; threadId: string }) => {
      try {
        const detailRes = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=To&metadataHeaders=Date`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!detailRes.ok) return null;
        const detail = await detailRes.json();
        const headers: GmailMessageHeader[] = detail.payload?.headers || [];
        const subject = headers.find((h) => h.name.toLowerCase() === 'subject')?.value || '(Không có tiêu đề)';
        const from = headers.find((h) => h.name.toLowerCase() === 'from')?.value || '';
        const to = headers.find((h) => h.name.toLowerCase() === 'to')?.value || '';
        const date = headers.find((h) => h.name.toLowerCase() === 'date')?.value || '';

        return {
          id: msg.id,
          threadId: msg.threadId,
          snippet: detail.snippet,
          subject,
          from,
          to,
          date,
        } as GmailMessageItem;
      } catch {
        return null;
      }
    });

    const results = await Promise.all(detailPromises);
    return results.filter((item): item is GmailMessageItem => item !== null);
  } catch (err) {
    console.error('Error fetching Gmail messages:', err);
    return [];
  }
};
