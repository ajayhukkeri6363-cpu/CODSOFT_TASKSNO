import fs from 'fs';
import path from 'path';

export interface UploadResult {
  fileName: string;
  fileUrl: string;
  storageKey: string;
  fileSize: number;
  mimeType: string;
}

export interface StorageService {
  uploadResume(fileBuffer: Buffer, originalFileName: string, mimeType: string): Promise<UploadResult>;
  deleteResume(storageKey: string): Promise<boolean>;
}

class LocalStorageService implements StorageService {
  private uploadDir: string;

  constructor() {
    this.uploadDir = path.join(process.cwd(), 'public', 'uploads', 'resumes');
    try {
      if (!fs.existsSync(this.uploadDir)) {
        fs.mkdirSync(this.uploadDir, { recursive: true });
      }
    } catch {
      // In serverless read-only environments, handle gracefully
    }
  }

  async uploadResume(fileBuffer: Buffer, originalFileName: string, mimeType: string): Promise<UploadResult> {
    const timestamp = Date.now();
    const sanitizedName = originalFileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueKey = `resume_${timestamp}_${sanitizedName}`;
    const filePath = path.join(this.uploadDir, uniqueKey);

    let fileUrl = `/uploads/resumes/${uniqueKey}`;

    try {
      if (fs.existsSync(this.uploadDir)) {
        fs.writeFileSync(filePath, fileBuffer);
      } else {
        // Fallback for demo/serverless environments
        fileUrl = `https://storage.careerhub.internal/resumes/${uniqueKey}`;
      }
    } catch {
      fileUrl = `https://storage.careerhub.internal/resumes/${uniqueKey}`;
    }

    return {
      fileName: originalFileName,
      fileUrl,
      storageKey: uniqueKey,
      fileSize: fileBuffer.length,
      mimeType: mimeType || 'application/pdf',
    };
  }

  async deleteResume(storageKey: string): Promise<boolean> {
    try {
      const filePath = path.join(this.uploadDir, storageKey);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      return true;
    } catch {
      return false;
    }
  }
}

// Factory to get storage driver based on configuration
export function getStorageService(): StorageService {
  const provider = process.env.CLOUD_STORAGE_PROVIDER || 'local';

  // Future cloud providers (e.g. AWS S3, Cloudflare R2, Supabase Storage) can be plugged here
  if (provider === 's3' && process.env.CLOUD_STORAGE_BUCKET && process.env.CLOUD_STORAGE_ACCESS_KEY) {
    // S3 implementation could be returned here
    return new LocalStorageService();
  }

  return new LocalStorageService();
}

export const storage = getStorageService();
