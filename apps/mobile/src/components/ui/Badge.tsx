import React from 'react';
import { View, Text, StyleSheet, type ViewStyle, type TextStyle } from 'react-native';
import { colors, radius, spacing, typography } from '../../theme/tokens';

export type BadgeVariant =
  | 'pending'
  | 'success'
  | 'danger'
  | 'info'
  | 'warning'
  | 'neutral'
  | 'default';

export interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: 'small' | 'large' | 'sm' | 'md' | 'lg' | string;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'info',
  size = 'md',
  style,
  textStyle,
}) => {
  const isSmall = size === 'small' || size === 'sm';

  return (
    <View
      style={[
        styles.badge,
        styles[variant] ?? styles.info,
        isSmall && styles.badgeSmall,
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          styles[`text_${variant}`] ?? styles.text_info,
          isSmall && styles.textSmall,
          textStyle,
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.full,
    alignSelf: 'flex-start',
    borderWidth: 1,
  },
  badgeSmall: {
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  pending: {
    backgroundColor: colors.status.pendingBg,
    borderColor: colors.status.pendingBorder,
  },
  success: {
    backgroundColor: colors.status.successBg,
    borderColor: colors.status.successBorder,
  },
  danger: {
    backgroundColor: colors.status.dangerBg,
    borderColor: colors.status.dangerBorder,
  },
  info: {
    backgroundColor: colors.status.infoBg,
    borderColor: colors.status.infoBorder,
  },
  warning: {
    backgroundColor: colors.status.pendingBg,
    borderColor: colors.status.pendingBorder,
  },
  neutral: {
    backgroundColor: colors.surfaceSubtle,
    borderColor: colors.border,
  },
  default: {
    backgroundColor: colors.surfaceSubtle,
    borderColor: colors.border,
  },

  text: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    textTransform: 'capitalize',
  },
  textSmall: {
    fontSize: 10,
  },
  text_pending: {
    color: colors.status.pendingText,
  },
  text_success: {
    color: colors.status.successText,
  },
  text_danger: {
    color: colors.status.dangerText,
  },
  text_info: {
    color: colors.status.infoText,
  },
  text_warning: {
    color: colors.status.pendingText,
  },
  text_neutral: {
    color: colors.textSecondary,
  },
  text_default: {
    color: colors.textSecondary,
  },
});
