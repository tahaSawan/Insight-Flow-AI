import React, { useState, useEffect } from 'react';
import { useLocalSearchParams } from 'expo-router';
import {
  View,
  TextInput,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
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
import { UseCasePicker } from '@/components/UseCasePicker';
import { INDUSTRY_OPTIONS, type IndustryType } from '@/types/analysis';
import { UI, looksLikeResume } from '@/constants/plainLanguage';
import { ScreenHeader } from '@/components/ScreenHeader';
import { DemoStepBar } from '@/components/DemoStepBar';
import { colors, spacing } from '@/constants/designTokens';

export default function UploadScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    setUploadedText,
    setAnalysisResults,
    setSourceFileName,
    industry,
    setIndustry,
    analysisMode,
    setAnalysisMode,
    useCase,
    setUseCase,
  } = useAppContext();

  const [textInput, setTextInput] = useState('');
  const [validationError, setValidationError] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [sampleLoaded, setSampleLoaded] = useState(false);
  const { demo } = useLocalSearchParams<{ demo?: string }>();

  const charCount = textInput.trim().length;
  const canSubmit = charCount >= MIN_CONTENT_LENGTH;
  const showResumeTip = canSubmit && looksLikeResume(textInput);

  const handleLoadSample = () => {
    setTextInput(SAMPLE_REPORT);
    setFileName(null);
    setSourceFileName(null);
    setValidationError('');
    setSampleLoaded(true);
  };

  useEffect(() => {
    if (demo !== 'judge') return;
    setIndustry('technology');
    setUseCase('board');
    setAnalysisMode('full');
    setTextInput(SAMPLE_REPORT);
    setFileName(null);
    setSourceFileName(null);
    setValidationError('');
    setSampleLoaded(true);
    setShowAdvanced(false);
  }, [demo, setIndustry, setUseCase, setAnalysisMode]);

  const handlePickFile = async () => {
    setValidationError('');
    setIsExtracting(true);
    try {
      const doc = await pickAndExtractDocument();
      setTextInput(doc.text);
      setFileName(doc.name);
      setSourceFileName(doc.name);
      setSampleLoaded(false);
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
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <DemoStepBar current="document" />

          <ScreenHeader title={UI.upload.title} subtitle={UI.upload.subtitle} />

          <Card style={styles.card}>
            <Typography variant="h3" style={styles.blockTitle}>
              1. Your document
            </Typography>

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
                <Typography style={styles.fileDropTitle}>{UI.upload.fileTitle}</Typography>
                <Typography variant="caption">
                  {fileName ? UI.upload.fileLoaded(fileName) : UI.upload.fileTap}
                </Typography>
              </>
            )}
          </Pressable>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Typography variant="caption" style={styles.dividerText}>
              {UI.upload.pasteDivider}
            </Typography>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.toolbar}>
            <Button
              title={UI.upload.sampleBtn}
              variant="outline"
              onPress={handleLoadSample}
              style={styles.sampleBtn}
            />
            <Typography variant="caption" style={styles.charCount}>
              {charCount} / {MIN_CONTENT_LENGTH}+
            </Typography>
          </View>

          {sampleLoaded ? (
            <Typography style={styles.sampleLoadedText}>{UI.upload.sampleLoaded}</Typography>
          ) : null}

          <TextInput
            style={styles.textInput}
            placeholder={UI.upload.placeholder}
            placeholderTextColor="#64748B"
            multiline
            textAlignVertical="top"
            value={textInput}
            onChangeText={(text) => {
              setTextInput(text);
              setSampleLoaded(false);
              if (validationError && text.trim().length >= MIN_CONTENT_LENGTH) {
                setValidationError('');
              }
            }}
          />

          {showResumeTip ? (
            <Typography variant="body" style={styles.resumeTip}>
              {UI.upload.resumeWarning}
            </Typography>
          ) : null}

          {validationError ? (
            <Typography variant="body" style={styles.errorText}>
              {validationError}
            </Typography>
          ) : null}
          </Card>

          <Card style={styles.card}>
            <Pressable
              onPress={() => setShowAdvanced((v) => !v)}
              style={({ pressed }) => [styles.advancedToggle, pressed && styles.chipPressed]}
            >
              <Typography style={styles.blockTitle}>2. Options</Typography>
              <Typography variant="caption" style={styles.advancedHint}>
                {showAdvanced ? 'Hide' : 'Show'} mode, scenario, industry
              </Typography>
            </Pressable>

            {showAdvanced ? (
              <View style={styles.advancedBody}>
                <AnalysisModePicker value={analysisMode} onChange={setAnalysisMode} />
                <UseCasePicker value={useCase} onChange={setUseCase} />
                <Typography variant="caption" style={styles.industryLabel}>
                  {UI.upload.industryLabel}
                </Typography>
                <View style={styles.industryRow}>
                  {INDUSTRY_OPTIONS.map((opt) => {
                    const selected = industry === opt.id;
                    return (
                      <Pressable
                        key={opt.id}
                        onPress={() => setIndustry(opt.id as IndustryType)}
                        style={({ pressed }) => [
                          styles.industryChip,
                          selected && styles.industryChipSelected,
                          pressed && styles.chipPressed,
                        ]}
                      >
                        <Typography
                          style={[
                            styles.industryChipText,
                            selected && styles.industryChipTextSelected,
                          ]}
                        >
                          {opt.label}
                        </Typography>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            ) : (
              <Typography variant="caption" style={styles.advancedSummary}>
                {analysisMode === 'full' ? 'Step by step (5 helpers)' : 'Quick mode'} · {industry}
              </Typography>
            )}
          </Card>
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: Math.max(spacing.md, insets.bottom) }]}>
          <Button
            title={UI.upload.submit}
            onPress={handleSubmit}
            disabled={!canSubmit}
            style={[styles.submitBtn, !canSubmit && styles.submitBtnDisabled]}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  card: { padding: spacing.lg, marginBottom: spacing.md },
  blockTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  advancedToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  advancedHint: { color: colors.accentText },
  advancedBody: { gap: spacing.md, marginTop: spacing.sm },
  advancedSummary: { color: colors.textMuted, marginTop: 4 },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
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
  sampleLoadedText: {
    color: colors.success,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 12,
  },
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
  resumeTip: {
    color: '#FCD34D',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 12,
    fontSize: 14,
  },
  errorText: { color: '#EF4444', textAlign: 'center', fontWeight: '500', marginBottom: 16 },
  submitBtn: { width: '100%', paddingVertical: 16, marginTop: 8 },
  submitBtnDisabled: { opacity: 0.45 },
  chipPressed: { opacity: 0.85 },
});
