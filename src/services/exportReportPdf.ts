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

async function exportReportPdfNative(results: AnalysisResult): Promise<void> {
  const html = formatReportAsHtml(results);
  const { uri } = await Print.printToFileAsync({ html });

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

/** Renders the full text report as a PDF file (download on web, share sheet on phone). */
export async function exportReportPdf(results: AnalysisResult): Promise<void> {
  const filename = buildFilename();

  if (Platform.OS === 'web') {
    if (typeof window === 'undefined') return;
    const { downloadReportPdfWeb } = await import('@/services/exportReportPdfWeb');
    await downloadReportPdfWeb(results, filename);
    return;
  }

  await exportReportPdfNative(results);
}
