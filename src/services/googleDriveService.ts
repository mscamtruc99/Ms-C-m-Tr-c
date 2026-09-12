import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
  User,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { LessonPlan } from '../types';
import { generateDocxBlob } from '../utils/docxExporter';

// Initialize Firebase App instance safely (prevent duplicate initialization)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Provider with Google Workspace Scopes (Drive & Gmail)
const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/drive');
provider.addScope('https://www.googleapis.com/auth/drive.file');
provider.addScope('https://mail.google.com/');
provider.addScope('https://www.googleapis.com/auth/gmail.send');
provider.addScope('https://www.googleapis.com/auth/gmail.readonly');
provider.addScope('https://www.googleapis.com/auth/gmail.compose');
provider.addScope('https://www.googleapis.com/auth/gmail.modify');
provider.setCustomParameters({
  prompt: 'select_account',
});

// Cache the access token in memory (never localStorage per security rules)
let cachedAccessToken: string | null = null;
let isSigningIn = false;

export const getCachedAccessToken = (): string | null => cachedAccessToken;
export const setCachedAccessToken = (token: string | null) => {
  cachedAccessToken = token;
};

export interface DriveFileItem {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
  webContentLink?: string;
  createdTime?: string;
  size?: string;
  iconLink?: string;
}

/**
 * Initialize Drive Auth listener
 */
export const initDriveAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user && cachedAccessToken) {
      if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
    } else {
      if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    }
  });
};

/**
 * Sign in with Google Popup and obtain access token
 */
export const signInWithGoogleDrive = async (): Promise<{ user: User; accessToken: string }> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Không nhận được Access Token từ Google. Vui lòng thử lại!');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google Sign-In Error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

/**
 * Sign out
 */
export const signOutGoogleDrive = async (): Promise<void> => {
  await signOut(auth);
  cachedAccessToken = null;
};

/**
 * Get current access token
 */
export const getDriveAccessToken = (): string | null => {
  return cachedAccessToken;
};

/**
 * Check if connected to Google Drive
 */
export const isDriveConnected = (): boolean => {
  return Boolean(cachedAccessToken && auth.currentUser);
};

/**
 * Find or create a designated folder in Google Drive for lesson plans
 */
export const getOrCreateDriveFolder = async (
  folderName: string = 'KHBD Chuẩn GDPT 2018'
): Promise<string> => {
  if (!cachedAccessToken) {
    throw new Error('Chưa kết nối Google Drive. Vui lòng đăng nhập Google trước!');
  }

  // 1. Search for existing folder
  const query = `mimeType = 'application/vnd.google-apps.folder' and name = '${folderName}' and trashed = false`;
  const searchUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
    query
  )}&fields=files(id,name)&spaces=drive`;

  const searchRes = await fetch(searchUrl, {
    headers: { Authorization: `Bearer ${cachedAccessToken}` },
  });

  if (!searchRes.ok) {
    const errData = await searchRes.json().catch(() => ({}));
    throw new Error(errData.error?.message || 'Lỗi khi tìm kiếm thư mục trên Google Drive');
  }

  const searchData = await searchRes.json();
  if (searchData.files && searchData.files.length > 0) {
    return searchData.files[0].id;
  }

  // 2. Create new folder if not exists
  const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${cachedAccessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      description: 'Thư mục lưu trữ Kế hoạch bài dạy chuẩn GDPT 2018 và CV 5512',
    }),
  });

  if (!createRes.ok) {
    const errData = await createRes.json().catch(() => ({}));
    throw new Error(errData.error?.message || 'Lỗi khi tạo thư mục trên Google Drive');
  }

  const newFolder = await createRes.json();
  return newFolder.id;
};

/**
 * Upload Lesson Plan Word (.docx) directly to Google Drive
 */
export const uploadLessonPlanToGoogleDrive = async (
  lessonPlan: LessonPlan
): Promise<{ id: string; name: string; webViewLink: string }> => {
  if (!cachedAccessToken) {
    throw new Error('Chưa kết nối Google Drive. Vui lòng đăng nhập Google trước!');
  }

  // Generate Docx blob
  const { blob, fileName } = await generateDocxBlob(lessonPlan);

  // Get or create dedicated folder
  const folderId = await getOrCreateDriveFolder('KHBD Chuẩn GDPT 2018');

  // Prepare multipart upload
  const metadata = {
    name: fileName,
    parents: [folderId],
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    description: `Kế hoạch bài dạy môn ${lessonPlan.generalInfo.subject} - ${lessonPlan.generalInfo.grade}: ${lessonPlan.generalInfo.lessonTitle}`,
  };

  const boundary = '-------khbd_drive_boundary_' + Date.now();
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const metadataPart = `${delimiter}Content-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(
    metadata
  )}`;

  const filePartHeader = `${delimiter}Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document\r\n\r\n`;

  const blobArrayBuffer = await blob.arrayBuffer();

  const multipartBody = new Blob(
    [metadataPart, filePartHeader, blobArrayBuffer, closeDelimiter],
    { type: `multipart/related; boundary=${boundary}` }
  );

  const uploadUrl =
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink,webContentLink';

  const uploadRes = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${cachedAccessToken}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body: multipartBody,
  });

  if (!uploadRes.ok) {
    const errData = await uploadRes.json().catch(() => ({}));
    throw new Error(errData.error?.message || 'Không thể tải file lên Google Drive');
  }

  const result = await uploadRes.json();
  return {
    id: result.id,
    name: result.name,
    webViewLink: result.webViewLink || `https://drive.google.com/file/d/${result.id}/view`,
  };
};

/**
 * List files stored in the teacher's lesson plans folder or matching KHBD files
 */
export const listDriveLessonPlans = async (): Promise<DriveFileItem[]> => {
  if (!cachedAccessToken) {
    return [];
  }

  try {
    const folderId = await getOrCreateDriveFolder('KHBD Chuẩn GDPT 2018');
    const query = `'${folderId}' in parents and trashed = false`;
    const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
      query
    )}&orderBy=createdTime desc&pageSize=50&fields=files(id,name,mimeType,webViewLink,webContentLink,createdTime,size,iconLink)`;

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${cachedAccessToken}` },
    });

    if (!res.ok) {
      console.warn('Drive list files error:', await res.text());
      return [];
    }

    const data = await res.json();
    return data.files || [];
  } catch (error) {
    console.error('Failed to list drive files:', error);
    return [];
  }
};

/**
 * Delete a file from Google Drive (MUST be guarded by user confirmation in UI)
 */
export const deleteDriveFile = async (fileId: string): Promise<boolean> => {
  if (!cachedAccessToken) {
    throw new Error('Chưa kết nối Google Drive.');
  }

  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${cachedAccessToken}` },
  });

  if (!res.ok && res.status !== 204) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error?.message || 'Không thể xóa file trên Google Drive');
  }

  return true;
};
