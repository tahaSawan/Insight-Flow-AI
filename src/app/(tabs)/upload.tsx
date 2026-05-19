import React, { useState } from 'react';
import { View, TextInput, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { FileUp } from 'lucide-react-native';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Typography } from '@/components/Typography';
import { useAppContext } from '@/context/AppContext';
import { SAMPLE_REPORT, MIN_CONTENT_LENGTH } from '@/constants/sampleReport';
import { validateAnalysisInput } from '@/services/gemini';
import { pickAndExtractDocument } from '@/services/document';
import { AnalysisModePicker } from '@/components/AnalysisModePicker';
import { INDUSTRY_OPTIONS, type IndustryType } from '@/types/analysis';

export default function UploadScreen() {
  const router = useRouter();
  const {
    setUploadedText,
    setAnalysisResults,
    setSourceFileName,
    industry,
    setIndustry,
    analysisMode,
    setAnalysisMode,
  } = useAppContext();

  const [textInput, setTextInput] = useState('');
  const [validationError, setValidationError] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);

  const charCount = textInput.trim().length;
  const canSubmit = charCount >= MIN_CONTENT_LENGTH;

  const handleLoadSample = () => {
    setTextInput(SAMPLE_REPORT);
    setFileName(null);
    setSourceFileName(null);
    setValidationError('');
  };

  const handlePickFile = async () => {
    setValidationError('');
    setIsExtracting(true);
    try {
      const doc = await pickAndExtractDocument();
      setTextInput(doc.text);
      setFileName(doc.name);
      setSourceFileName(doc.name);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to read file';
      if (!msg.includes('No file selected')) {
        setValidationError(msg);
      }
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSubmit = () => {
    const error = validateAnalysisInput(textInput);
    if (error) {
      setValidationError(error);
      return;
    }

    setValidationError('');
    setAnalysisResults(null);
    setUploadedText(textInput.trim());
    router.push('/analysis');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Typography variant="h1" style={styles.title}>
            Upload Content
          </Typography>
          <Typography variant="body" style={styles.subtitle}>
            Paste text or upload a .txt / .pdf file. PDFs are read with Gemini AI extraction.
          </Typography>
        </View>

        <Card style={styles.card}>
          <AnalysisModePicker value={analysisMode} onChange={setAnalysisMode} />

          <Typography variant="caption" style={styles.industryLabel}>
            Industry focus
          </Typography>
          <View style={styles.industryRow}>
            {INDUSTRY_OPTIONS.map((opt) => {
              const selected = industry === opt.id;
              return (
                <Pressable
                  key={opt.id}
                  onPress={() => setIndustry(opt.id as IndustryType)}
                  style={[styles.industryChip, selected && styles.industryChipSelected]}
                >
                  <Typography
                    style={[styles.industryChipText, selected && styles.industryChipTextSelected]}
                  >
                    {opt.label}
                  </Typography>
                </Pressable>
              );
            })}
          </View>

          <Pressable
            style={styles.fileDrop}
            onPress={handlePickFile}
            disabled={isExtracting}
          >
            {isExtracting ? (
              <ActivityIndicator color="#6366F1" />
            ) : (
              <>
                <FileUp size={28} color="#6366F1" />
                <Typography style={styles.fileDropTitle}>Upload .txt or .pdf</Typography>
                <Typography variant="caption">
                  {fileName ? `Loaded: ${fileName}` : 'Tap to browse files'}
                </Typography>
              </>
            )}
          </Pressable>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Typography variant="caption" style={styles.dividerText}>
              or paste below
            </Typography>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.toolbar}>
            <Button
              title="Load sample"
              variant="outline"
              onPress={handleLoadSample}
              style={styles.sampleBtn}
            />
            <Typography variant="caption" style={styles.charCount}>
              {charCount} / {MIN_CONTENT_LENGTH}+
            </Typography>
          </View>

          <TextInput
            style={styles.textInput}
            placeholder="Paste your report, article, or business update..."
            placeholderTextColor="#64748B"
            multiline
            textAlignVertical="top"
            value={textInput}
            onChangeText={(text) => {
              setTextInput(text);
              if (validationError && text.trim().length >= MIN_CONTENT_LENGTH) {
                setValidationError('');
              }
            }}
          />

          {validationError ? (
            <Typography variant="body" style={styles.errorText}>
              {validationError}
            </Typography>
          ) : null}

          <Button
            title="Start AI Analysis"
            onPress={handleSubmit}
            disabled={!canSubmit}
            style={[styles.submitBtn, !canSubmit && styles.submitBtnDisabled]}
          />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0A0A0F' },
  scrollContent: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 32, paddingBottom: 40 },
  header: { marginBottom: 28 },
  title: { fontSize: 36, letterSpacing: -0.5, marginBottom: 12 },
  subtitle: { color: '#8A8D98', lineHeight: 24 },
  card: { padding: 24 },
  industryLabel: {
    color: '#8A8D98',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontSize: 11,
  },
  industryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  industryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2D2D44',
    backgroundColor: '#0A0A0F',
  },
  industryChipSelected: {
    borderColor: '#6366F1',
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
  },
  industryChipText: { color: '#94A3B8', fontSize: 13, fontWeight: '500' },
  industryChipTextSelected: { color: '#A5B4FC' },
  fileDrop: {
    borderWidth: 2,
    borderColor: 'rgba(99, 102, 241, 0.35)',
    borderStyle: 'dashed',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
    backgroundColor: 'rgba(99, 102, 241, 0.05)',
  },
  fileDropTitle: { fontWeight: '600', fontSize: 15 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 12 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#2D2D44' },
  dividerText: { color: '#64748B' },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 12,
  },
  sampleBtn: { paddingVertical: 10, paddingHorizontal: 14 },
  charCount: { color: '#64748B' },
  textInput: {
    backgroundColor: '#0A0A0F',
    borderColor: 'rgba(100, 116, 139, 0.5)',
    borderWidth: 1,
    borderRadius: 16,
    color: '#FFFFFF',
    padding: 16,
    fontSize: 16,
    minHeight: 180,
    marginBottom: 16,
  },
  errorText: { color: '#EF4444', textAlign: 'center', fontWeight: '500', marginBottom: 16 },
  submitBtn: { width: '100%', paddingVertical: 16, marginTop: 8 },
  submitBtnDisabled: { opacity: 0.45 },
});
