import React, { useState } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { ChevronDown, ChevronRight } from 'lucide-react-native';
import { Typography } from '@/components/Typography';
import { colors, spacing, radius, fontSize } from '@/constants/designTokens';

interface CollapsibleSectionProps {
  title: string;
  hint?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export function CollapsibleSection({
  title,
  hint,
  defaultOpen = false,
  children,
}: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <View style={styles.wrap}>
      <Pressable
        onPress={() => setOpen((v) => !v)}
        style={({ pressed }) => [styles.header, pressed && styles.headerPressed]}
      >
        {open ? (
          <ChevronDown size={18} color={colors.textSecondary} />
        ) : (
          <ChevronRight size={18} color={colors.textSecondary} />
        )}
        <View style={styles.headerText}>
          <Typography style={styles.title}>{title}</Typography>
          {hint && !open ? (
            <Typography variant="caption" style={styles.hint}>
              {hint}
            </Typography>
          ) : null}
        </View>
      </Pressable>
      {open ? <View style={styles.body}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  headerPressed: {
    opacity: 0.85,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: fontSize.subheading,
    fontWeight: '700',
    color: colors.text,
  },
  hint: {
    marginTop: 2,
    color: colors.textMuted,
  },
  body: {
    marginTop: spacing.sm,
    gap: spacing.md,
  },
});
