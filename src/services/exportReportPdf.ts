import { Platform } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import type { AnalysisResult } from '@/types/analysis';
import { formatReportAsHtml } from '@/utils/formatReportHtml';

function buildFilename(): string {
  const date = new Date().toISOString().slice(0, 10);
  return `InsightFlow-Report-${date}.pdf`;
}

/** Renders the report as PDF and opens the system share sheet (save, email, Drive, etc.). */
export async function exportReportPdf(results: AnalysisResult): Promise<void> {
  const html = formatReportAsHtml(results);
  const { uri } = await Print.printToFileAsync({ html });

  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') {
      const link = document.createElement('a');
      link.href = uri;
      link.download = buildFilename();
      link.click();
    }
    return;
  }

  const filename = buildFilename();
  const destination = `${FileSystem.cacheDirectory}${filename}`;
  await FileSystem.copyAsync({ from: uri, to: destination });

  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) {
    throw new Error('Sharing is not available on this device.');
  }

  await Sharing.shareAsync(destination, {
    mimeType: 'application/pdf',
    UTI: 'com.adobe.pdf',
    dialogTitle: 'Export InsightFlow report',
  });
}
