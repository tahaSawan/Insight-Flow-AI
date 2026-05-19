import React, { useState } from 'react';
import { View, TextInput, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Typography } from '@/components/Typography';
import { useAppContext } from '@/context/AppContext';
import { SAMPLE_REPORT, MIN_CONTENT_LENGTH } from '@/constants/sampleReport';
import { validateAnalysisInput } from '@/services/gemini';

export default function UploadScreen() {
  const router = useRouter();
  const { setUploadedText, setAnalysisResults } = useAppContext();

  const [textInput, setTextInput] = useState('');
  const [validationError, setValidationError] = useState('');

  const charCount = textInput.trim().length;
  const canSubmit = charCount >= MIN_CONTENT_LENGTH;

  const handleLoadSample = () => {
    setTextInput(SAMPLE_REPORT);
    setValidationError('');
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
          <Typography variant="h1" style={styles.title}>Upload Content</Typography>
          <Typography variant="body" style={styles.subtitle}>
            Paste reports, articles, or business updates for AI analysis. PDF upload is coming soon — use text for now.
          </Typography>
        </View>

        <Card style={styles.card}>
          <View style={styles.toolbar}>
            <Button
              title="Load sample report"
              variant="outline"
              onPress={handleLoadSample}
              style={styles.sampleBtn}
            />
            <Typography variant="caption" style={styles.charCount}>
              {charCount} / {MIN_CONTENT_LENGTH}+ chars
            </Typography>
          </View>

          <TextInput
            style={styles.textInput}
            placeholder="Paste your content here..."
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
            <Typography variant="body" style={styles.errorText}>{validationError}</Typography>
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
  safeArea: {
    flex: 1,
    backgroundColor: '#0A0A0F',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 36,
    letterSpacing: -0.5,
    marginBottom: 12,
  },
  subtitle: {
    color: '#8A8D98',
    lineHeight: 24,
  },
  card: {
    padding: 24,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 12,
  },
  sampleBtn: {
    flexShrink: 1,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  charCount: {
    color: '#64748B',
  },
  textInput: {
    backgroundColor: '#0A0A0F',
    borderColor: 'rgba(100, 116, 139, 0.5)',
    borderWidth: 1,
    borderRadius: 16,
    color: '#FFFFFF',
    padding: 16,
    fontSize: 16,
    minHeight: 220,
    marginBottom: 16,
  },
  errorText: {
    color: '#EF4444',
    textAlign: 'center',
    fontWeight: '500',
    marginBottom: 16,
  },
  submitBtn: {
    width: '100%',
    paddingVertical: 16,
    marginTop: 8,
  },
  submitBtnDisabled: {
    opacity: 0.45,
  },
});
