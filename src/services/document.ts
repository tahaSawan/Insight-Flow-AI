import * as DocumentPicker from 'expo-document-picker';
import { File } from 'expo-file-system';
import { extractTextFromPdf } from '@/services/gemini';

const TEXT_MIME_TYPES = ['text/plain', 'text/markdown', 'application/json'];
const TEXT_EXTENSIONS = ['.txt', '.md', '.json', '.csv'];

export interface PickedDocument {
  name: string;
  text: string;
}

function isTextFile(name: string, mimeType?: string | null): boolean {
  const lower = name.toLowerCase();
  if (TEXT_EXTENSIONS.some((ext) => lower.endsWith(ext))) return true;
  if (mimeType && TEXT_MIME_TYPES.includes(mimeType)) return true;
  return false;
}

function isPdfFile(name: string, mimeType?: string | null): boolean {
  return (
    name.toLowerCase().endsWith('.pdf') ||
    mimeType === 'application/pdf'
  );
}

export async function pickAndExtractDocument(): Promise<PickedDocument> {
  const result = await DocumentPicker.getDocumentAsync({
    type: ['application/pdf', 'text/plain', 'text/*'],
    copyToCacheDirectory: true,
  });

  if (result.canceled || !result.assets?.[0]) {
    throw new Error('No file selected');
  }

  const asset = result.assets[0];
  const name = asset.name || 'document';
  const mimeType = asset.mimeType;

  if (isTextFile(name, mimeType)) {
    const file = new File(asset.uri);
    const text = await file.text();
    if (text.trim().length < 20) {
      throw new Error('The text file appears empty or too short.');
    }
    return { name, text: text.trim() };
  }

  if (isPdfFile(name, mimeType)) {
    const file = new File(asset.uri);
    const base64 = await file.base64();
    const text = await extractTextFromPdf(base64);
    return { name, text };
  }

  throw new Error('Unsupported file type. Please upload a .txt or .pdf file.');
}
