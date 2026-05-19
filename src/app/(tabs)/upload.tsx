import React, { useState } from 'react';
import { View, TextInput, StyleSheet, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Typography } from '@/components/Typography';
import { useAppContext } from '@/context/AppContext';

export default function UploadScreen() {
  const router = useRouter();
  const { setUploadedText } = useAppContext();
  
  const [textInput, setTextInput] = useState('');
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const [pdfMessage, setPdfMessage] = useState('');
  const [validationError, setValidationError] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);

  const handlePdfUpload = async () => {
    try {
      setIsUploadingPdf(true);
      setPdfMessage('');
      
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedFile(result.assets[0]);
        setPdfMessage('PDF uploaded successfully');
        setValidationError('');
      }
    } catch (error) {
      console.error('Error selecting file:', error);
      Alert.alert('Error', 'Failed to pick a document');
    } finally {
      setIsUploadingPdf(false);
    }
  };

  const handleSubmit = () => {
    if (!textInput.trim() && !selectedFile) {
      setValidationError('Please enter content first');
      return;
    }

    setValidationError('');
    setIsAnalyzing(true);
    
    // Save to global context
    setUploadedText(textInput.trim() || (selectedFile ? `File: ${selectedFile.name}` : ''));

    setTimeout(() => {
      setIsAnalyzing(false);
      router.push('/analysis');
    }, 2000);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Typography variant="h1" style={styles.title}>Upload Content</Typography>
          <Typography variant="body" style={styles.subtitle}>
            Paste reports, articles, or upload files for AI analysis.
          </Typography>
        </View>

        <Card style={styles.card}>
          <TextInput
            style={styles.textInput}
            placeholder="Paste your content here..."
            placeholderTextColor="#64748B"
            multiline
            textAlignVertical="top"
            value={textInput}
            onChangeText={(text) => {
              setTextInput(text);
              if (text.trim()) setValidationError('');
            }}
          />

          <View style={styles.uploadRow}>
            <Button 
              title="Upload PDF"
              variant="outline"
              onPress={handlePdfUpload}
              disabled={isUploadingPdf || isAnalyzing}
              isLoading={isUploadingPdf}
              style={styles.uploadBtn}
            />
            
            <View style={styles.fileInfo}>
              {selectedFile ? (
                <Typography variant="body" style={styles.fileName} numberOfLines={1} ellipsizeMode="middle">
                  {selectedFile.name}
                </Typography>
              ) : null}
              {pdfMessage ? <Typography variant="caption" style={styles.successMessage}>{pdfMessage}</Typography> : null}
            </View>
          </View>

          {validationError ? (
            <Typography variant="body" style={styles.errorText}>{validationError}</Typography>
          ) : null}

          <Button 
            title={isAnalyzing ? "Analyzing..." : "Start AI Analysis"}
            onPress={handleSubmit}
            disabled={isAnalyzing}
            isLoading={isAnalyzing}
            style={styles.submitBtn}
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
  textInput: {
    backgroundColor: '#0A0A0F',
    borderColor: 'rgba(100, 116, 139, 0.5)',
    borderWidth: 1,
    borderRadius: 16,
    color: '#FFFFFF',
    padding: 16,
    fontSize: 16,
    minHeight: 180,
    marginBottom: 24,
  },
  uploadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  uploadBtn: {
    marginRight: 16,
    minWidth: 120,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  fileInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  fileName: {
    fontWeight: '500',
    marginBottom: 4,
  },
  successMessage: {
    color: '#10B981',
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
  }
});
