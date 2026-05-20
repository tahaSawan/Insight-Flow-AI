import React from 'react';
import { View, ViewProps, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Typography } from '@/components/Typography';
import { colors, radius, spacing, shadows } from '@/constants/designTokens';
import { textBlock } from '@/constants/typography';

export type CardVariant = 'default' | 'elevated' | 'alert' | 'success' | 'danger';

/** @deprecated `accent` → `alert`, `outline` → `default` */
export type LegacyCardVariant = CardVariant | 'accent' | 'outline';

interface CardProps extends ViewProps {
  variant?: LegacyCardVariant;
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  highlighted?: boolean;
  noPadding?: boolean;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

function resolveVariant(variant: LegacyCardVariant): CardVariant {
  if (variant === 'accent') return 'alert';
  if (variant === 'outline') return 'default';
  return variant;
}

export function Card({
  style,
  children,
  variant = 'default',
  title,
  subtitle,
  icon,
  highlighted = false,
  noPadding = false,
  ...props
}: CardProps) {
  const resolved = resolveVariant(variant);
  const hasHeader = !!(title || subtitle || icon);
  const titleColorStyle =
    resolved === 'danger'
      ? styles.titleDanger
      : resolved === 'success'
        ? styles.titleSuccess
        : resolved === 'alert'
          ? styles.titleAlert
          : undefined;

  return (
    <View
      style={[
        styles.card,
        resolved === 'elevated' && styles.elevated,
        resolved === 'alert' && styles.alert,
        resolved === 'success' && styles.success,
        resolved === 'danger' && styles.danger,
        highlighted && styles.highlighted,
        (resolved === 'elevated' || highlighted) && shadows.card,
        resolved === 'alert' && highlighted && shadows.accent,
        noPadding && styles.noPadding,
        style,
      ]}
      {...props}
    >
      {hasHeader ? (
        <View style={[styles.header, !noPadding && styles.headerWithPadding]}>
          {icon ? <View style={styles.iconWrap}>{icon}</View> : null}
          <View style={styles.headerText}>
            {title ? (
              <Typography variant="cardTitle" style={[titleColorStyle]}>
                {title}
              </Typography>
            ) : null}
            {subtitle ? (
              <Typography variant="cardSubtitle" style={styles.subtitle}>
                {subtitle}
              </Typography>
            ) : null}
          </View>
        </View>
      ) : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  noPadding: {
    padding: 0,
  },
  elevated: {
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.borderStrong,
  },
  alert: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.borderAccent,
  },
  success: {
    backgroundColor: colors.successSoft,
    borderColor: 'rgba(16, 185, 129, 0.35)',
  },
  danger: {
    backgroundColor: colors.dangerSoft,
    borderColor: 'rgba(239, 68, 68, 0.35)',
  },
  highlighted: {
    borderColor: colors.borderAccent,
    borderWidth: 1.5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: textBlock.md,
  },
  headerWithPadding: {},
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceHighlight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
    gap: textBlock.xs,
  },
  titleAlert: {
    color: colors.accentText,
  },
  titleSuccess: {
    color: colors.success,
  },
  titleDanger: {
    color: colors.danger,
  },
  subtitle: {
    marginTop: textBlock.xs,
  },
});
