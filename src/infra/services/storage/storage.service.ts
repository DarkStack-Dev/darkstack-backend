// src/infra/services/storage/storage.service.ts

export type UploadFileInput = {
  buffer: Buffer;
  filename: string;
  mimeType: string;
  folder?: string;
};

export type UploadFileOutput = {
  url: string;
  filename: string;
  size: number;
};

export abstract class StorageService {
  abstract uploadFile(input: UploadFileInput): Promise<UploadFileOutput>;
  abstract deleteFile(filename: string, folder?: string): Promise<void>;
  abstract getFileUrl(filename: string, folder?: string): string;
}