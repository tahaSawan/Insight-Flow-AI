import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';
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
  return name.toLowerCase().endsWith('.pdf') || mimeType === 'application/pdf';
}

/** Read file URI as UTF-8 text (works on native + web). */
async function readUriAsText(uri: string): Promise<string> {
  if (Platform.OS === 'web') {
    const response = await fetch(uri);
    if (!response.ok) {
      throw new Error('Could not read the selected file.');
    }
    return await response.text();
  }

  return FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.UTF8,
  });
}

/** Read file URI as base64 (for PDF → Gemini). */
async function readUriAsBase64(uri: string): Promise<string> {
  if (Platform.OS === 'web') {
    const response = await fetch(uri);
    if (!response.ok) {
      throw new Error('Could not read the selected file.');
    }
    const blob = await response.blob();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        const base64 = dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl;
        resolve(base64);
      };
      reader.onerror = () => reject(new Error('Failed to read PDF data.'));
      reader.readAsDataURL(blob);
    });
  }

  return FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
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
  const uri = asset.uri;

  if (!uri) {
    throw new Error('Could not access the selected file.');
  }

  if (isTextFile(name, mimeType)) {
    const text = await readUriAsText(uri);
    if (text.trim().length < 20) {
      throw new Error('The text file appears empty or too short.');
    }
    return { name, text: text.trim() };
  }

  if (isPdfFile(name, mimeType)) {
    const base64 = await readUriAsBase64(uri);
    const text = await extractTextFromPdf(base64);
    return { name, text };
  }

  throw new Error('Unsupported file type. Please upload a .txt or .pdf file.');
}
