import React, { useState } from 'react';
import { Modal, View, StyleSheet, Pressable, Dimensions } from 'react-native';
import { UploadCloud, BrainCircuit, Target } from 'lucide-react-native';
import { Typography } from '@/components/Typography';
import { Button } from '@/components/Button';
import { colors, spacing, radius } from '@/constants/designTokens';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    Icon: UploadCloud,
    color: colors.accent,
    title: '1. Document',
    body: 'Paste text or upload a PDF — sales reports, ops updates, board memos.',
  },
  {
    Icon: BrainCircuit,
    color: colors.info,
    title: '2. Analyze',
    body: 'Five AI helpers read your doc: main points, problems, and next steps.',
  },
  {
    Icon: Target,
    color: colors.success,
    title: '3. Decide & act',
    body: 'One decision, consequence paths, and demo actions (Slack, email, CRM).',
  },
] as const;

interface OnboardingModalProps {
  visible: boolean;
  onComplete: () => void;
}

export function OnboardingModal({ visible, onComplete }: OnboardingModalProps) {
  const [page, setPage] = useState(0);
  const slide = SLIDES[page];
  const SlideIcon = slide.Icon;
  const isLast = page === SLIDES.length - 1;

  const advance = () => {
    if (isLast) {
      onComplete();
      setPage(0);
    } else {
      setPage((p) => p + 1);
    }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={[styles.iconCircle, { borderColor: `${slide.color}55` }]}>
            <SlideIcon size={28} color={slide.color} />
          </View>
          <Typography variant="h2" style={styles.title}>
            {slide.title}
          </Typography>
          <Typography variant="body" style={styles.body}>
            {slide.body}
          </Typography>

          <View style={styles.dots}>
            {SLIDES.map((_, i) => (
              <View key={i} style={[styles.dot, i === page && styles.dotActive]} />
            ))}
          </View>

          <Button title={isLast ? 'Get started' : 'Next'} onPress={advance} style={styles.btn} />

          {!isLast ? (
            <Pressable onPress={onComplete} style={({ pressed }) => [styles.skip, pressed && { opacity: 0.85 }]}>
              <Typography variant="caption" style={styles.skipText}>
                Skip intro
              </Typography>
            </Pressable>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderStrong,
    maxWidth: width - 48,
    alignSelf: 'center',
    width: '100%',
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: { textAlign: 'center', marginBottom: spacing.sm },
  body: { color: colors.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: spacing.lg },
  dots: { flexDirection: 'row', gap: 8, marginBottom: spacing.lg },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.surfaceElevated,
  },
  dotActive: { backgroundColor: colors.accent, width: 20 },
  btn: { width: '100%', paddingVertical: 16 },
  skip: { marginTop: spacing.md },
  skipText: { color: colors.textMuted },
});
