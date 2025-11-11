import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import Colors from '@/constants/colors';
import { scaleFontSize, scaleSpacing } from '@/utils/responsive';
import { useResponsive } from '@/hooks/useResponsive';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  testID?: string;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
  testID,
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const { isSmallDevice } = useResponsive();

  // Adjust size for small devices
  const effectiveSize = isSmallDevice && size === 'large' ? 'medium' : size;

  return (
    <TouchableOpacity
      testID={testID}
      style={[
        styles.button,
        styles[variant],
        styles[effectiveSize],
        isDisabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' ? Colors.orange : '#FFFFFF'}
        />
      ) : (
        <Text
          style={[
            styles.text,
            styles[`${variant}Text` as keyof typeof styles] as TextStyle,
            styles[`${effectiveSize}Text` as keyof typeof styles] as TextStyle,
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: scaleSpacing(12),
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    minHeight: scaleSpacing(48), // Minimum touch target
  },
  primary: {
    backgroundColor: Colors.orange,
  },
  secondary: {
    backgroundColor: Colors.yellow,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.orange,
  },
  small: {
    paddingVertical: scaleSpacing(8),
    paddingHorizontal: scaleSpacing(16),
  },
  medium: {
    paddingVertical: scaleSpacing(14),
    paddingHorizontal: scaleSpacing(24),
  },
  large: {
    paddingVertical: scaleSpacing(18),
    paddingHorizontal: scaleSpacing(32),
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  primaryText: {
    color: '#FFFFFF',
  },
  secondaryText: {
    color: Colors.text.primary,
  },
  outlineText: {
    color: Colors.orange,
  },
  smallText: {
    fontSize: scaleFontSize(14),
  },
  mediumText: {
    fontSize: scaleFontSize(16),
  },
  largeText: {
    fontSize: scaleFontSize(18),
  },
});
