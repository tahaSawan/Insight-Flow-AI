import React, { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Typography } from '@/components/Typography';
import { askFollowUp } from '@/services/gemini';
import type { AnalysisResult } from '@/types/analysis';

interface Message {
  role: 'user' | 'assistant';
  text: string;
}

interface FollowUpChatProps {
  documentText: string;
  analysis: AnalysisResult;
}

const SUGGESTED_QUESTIONS = [
  'What is the single biggest risk?',
  'What should we do in the next 48 hours?',
  'How confident are you in these recommendations?',
];

export function FollowUpChat({ documentText, analysis }: FollowUpChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const sendQuestion = async (question: string) => {
    const q = question.trim();
    if (!q || isLoading) return;

    setError('');
    setMessages((prev) => [...prev, { role: 'user', text: q }]);
    setInput('');
    setIsLoading(true);

    try {
      const answer = await askFollowUp(documentText, analysis, q);
      setMessages((prev) => [...prev, { role: 'assistant', text: answer }]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Could not get an answer.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card style={styles.card}>
      <Typography variant="h3" style={styles.title}>
        Ask InsightFlow AI
      </Typography>
      <Typography variant="caption" style={styles.subtitle}>
        Follow-up questions grounded in your document and analysis.
      </Typography>

      <View style={styles.suggestions}>
        {SUGGESTED_QUESTIONS.map((q) => (
          <Button
            key={q}
            title={q}
            variant="outline"
            onPress={() => sendQuestion(q)}
            disabled={isLoading}
            style={styles.suggestionBtn}
          />
        ))}
      </View>

      <ScrollView style={styles.messageList} nestedScrollEnabled>
        {messages.map((msg, i) => (
          <View
            key={`msg-${i}`}
            style={[
              styles.bubble,
              msg.role === 'user' ? styles.userBubble : styles.assistantBubble,
            ]}
          >
            <Typography
              style={msg.role === 'user' ? styles.userText : styles.assistantText}
            >
              {msg.text}
            </Typography>
          </View>
        ))}
        {isLoading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color="#6366F1" />
            <Typography variant="caption" style={styles.loadingText}>
              Thinking...
            </Typography>
          </View>
        ) : null}
      </ScrollView>

      {error ? <Typography style={styles.error}>{error}</Typography> : null}

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Ask about risks, priorities, next steps..."
            placeholderTextColor="#64748B"
            value={input}
            onChangeText={setInput}
            editable={!isLoading}
            onSubmitEditing={() => sendQuestion(input)}
          />
          <Button
            title="Ask"
            onPress={() => sendQuestion(input)}
            disabled={isLoading || !input.trim()}
            style={styles.askBtn}
          />
        </View>
      </KeyboardAvoidingView>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    padding: 20,
  },
  title: {
    color: '#818CF8',
    fontSize: 18,
    marginBottom: 4,
  },
  subtitle: {
    marginBottom: 16,
  },
  suggestions: {
    gap: 8,
    marginBottom: 16,
  },
  suggestionBtn: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  messageList: {
    maxHeight: 220,
    marginBottom: 12,
  },
  bubble: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    maxWidth: '95%',
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.35)',
  },
  assistantBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#1A1A24',
    borderWidth: 1,
    borderColor: '#2D2D44',
  },
  userText: {
    color: '#E0E7FF',
    fontSize: 14,
    lineHeight: 20,
  },
  assistantText: {
    color: '#E2E8F0',
    fontSize: 14,
    lineHeight: 20,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  loadingText: {
    color: '#8A8D98',
  },
  error: {
    color: '#F87171',
    marginBottom: 8,
    fontSize: 13,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#0A0A0F',
    borderColor: 'rgba(100, 116, 139, 0.5)',
    borderWidth: 1,
    borderRadius: 12,
    color: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  askBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
});
