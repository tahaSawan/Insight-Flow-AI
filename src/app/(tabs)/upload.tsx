import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';

export default function UploadScreen() {
  const router = useRouter();
  
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

    // Simulate analysis loading for 2 seconds
    setTimeout(() => {
      setIsAnalyzing(false);
      router.push('/analysis');
    }, 2000);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>Upload Content</Text>
          <Text style={styles.subtitle}>
            Paste reports, articles, or upload files for AI analysis.
          </Text>
        </View>

        <View style={styles.card}>
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

          <View style={styles.pdfSection}>
            <TouchableOpacity 
              style={styles.pdfButton} 
              onPress={handlePdfUpload}
              disabled={isUploadingPdf || isAnalyzing}
            >
              {isUploadingPdf ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.pdfButtonText}>Upload PDF</Text>
              )}
            </TouchableOpacity>
            
            <View style={styles.pdfInfoContainer}>
              {selectedFile ? (
                <Text style={styles.fileNameText} numberOfLines={1} ellipsizeMode="middle">
                  {selectedFile.name}
                </Text>
              ) : null}
              {pdfMessage ? <Text style={styles.pdfMessage}>{pdfMessage}</Text> : null}
            </View>
          </View>

          {validationError ? (
            <Text style={styles.errorText}>{validationError}</Text>
          ) : null}

          <TouchableOpacity 
            style={[styles.submitButton, isAnalyzing && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isAnalyzing}
            activeOpacity={0.8}
          >
            {isAnalyzing ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color="#FFFFFF" size="small" style={styles.spinner} />
                <Text style={styles.submitButtonText}>Analyzing...</Text>
              </View>
            ) : (
              <Text style={styles.submitButtonText}>Start AI Analysis</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0A0A0F',
  },
  scrollContainer: {
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
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#8A8D98',
    lineHeight: 24,
  },
  card: {
    backgroundColor: '#12121A',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#1F1F2E',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  textInput: {
    backgroundColor: '#0A0A0F',
    borderWidth: 1,
    borderColor: '#1F1F2E',
    borderRadius: 16,
    color: '#FFFFFF',
    padding: 16,
    fontSize: 16,
    minHeight: 180,
    marginBottom: 24,
  },
  pdfSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  pdfButton: {
    backgroundColor: '#1E1E2D',
    borderWidth: 1,
    borderColor: '#2D2D44',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 120,
  },
  pdfButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  pdfInfoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  fileNameText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  pdfMessage: {
    color: '#10B981',
    fontSize: 12,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: '#6366F1',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spinner: {
    marginRight: 8,
  },
});
