import React, { useState } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  Pressable,
  Dimensions,
} from 'react-native';
import { Typography } from '@/components/Typography';
import { Button } from '@/components/Button';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    emoji: '📄',
    title: 'Paste a business report',
    body: 'Upload PDF or text — sales reports, ops updates, anything unstructured.',
  },
  {
    emoji: '🧠',
    title: 'AI finds risk & next steps',
    body: 'Five helpers read your doc: main points, problems, and what to do — not just a summary.',
  },
  {
    emoji: '⚡',
    title: 'Approve & run actions (demo)',
    body: 'Simulate Slack, email, and CRM. See before vs after — ready for your board in minutes.',
  },
];

interface OnboardingModalProps {
  visible: boolean;
  onComplete: () => void;
}

export function OnboardingModal({ visible, onComplete }: OnboardingModalProps) {
  const [page, setPage] = useState(0);
  const slide = SLIDES[page];
  const isLast = page === SLIDES.length - 1;

  const finish = () => {
    setPage(0);
    onComplete();
  };

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Typography style={styles.emoji}>{slide.emoji}</Typography>
          <Typography variant="h2" style={styles.title}>
            {slide.title}
          </Typography>
          <Typography style={styles.body}>{slide.body}</Typography>

          <View style={styles.dots}>
            {SLIDES.map((_, i) => (
              <View key={i} style={[styles.dot, i === page && styles.dotActive]} />
            ))}
          </View>

          <View style={styles.actions}>
            {page > 0 ? (
              <Pressable onPress={() => setPage((p) => p - 1)} style={styles.back}>
                <Typography style={styles.backText}>Back</Typography>
              </Pressable>
            ) : (
              <View style={styles.back} />
            )}
            <Button
              title={isLast ? 'Get started' : 'Next'}
              onPress={() => (isLast ? finish() : setPage((p) => p + 1))}
              style={styles.nextBtn}
            />
          </View>

          <Pressable onPress={finish}>
            <Typography style={styles.skip}>Skip intro</Typography>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#12121A',
    borderRadius: 20,
    padding: 28,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.35)',
    maxWidth: width - 48,
    alignSelf: 'center',
    width: '100%',
  },
  emoji: { fontSize: 48, textAlign: 'center', marginBottom: 16 },
  title: { textAlign: 'center', marginBottom: 12, fontSize: 24 },
  body: {
    textAlign: 'center',
    color: '#94A3B8',
    lineHeight: 24,
    fontSize: 16,
    marginBottom: 24,
  },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 24 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#2D2D44' },
  dotActive: { backgroundColor: '#6366F1', width: 22 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  back: { width: 64 },
  backText: { color: '#818CF8', fontWeight: '600' },
  nextBtn: { flex: 1, paddingVertical: 16 },
  skip: { color: '#64748B', textAlign: 'center', marginTop: 16, fontSize: 14 },
});
