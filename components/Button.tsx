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

  return (
    <TouchableOpacity
      testID={testID}
      style={[
        styles.button,
        styles[variant],
        styles[size],
        isDisabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.75}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' ? Colors.orange : '#FFFFFF'}
          size="small"
        />
      ) : (
        <Text
          style={[
            styles.text,
            styles[`${variant}Text` as keyof typeof styles] as TextStyle,
            styles[`${size}Text` as keyof typeof styles] as TextStyle,
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
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    minHeight: 48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  primary: {
    backgroundColor: Colors.orange,
    shadowColor: Colors.orange,
    shadowOpacity: 0.25,
  },
  secondary: {
    backgroundColor: Colors.yellow,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.orange,
    shadowOpacity: 0,
    elevation: 0,
  },
  small: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    minHeight: 40,
  },
  medium: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    minHeight: 48,
  },
  large: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    minHeight: 54,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontWeight: '700' as const,
    color: '#FFFFFF',
    letterSpacing: 0.3,
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
    fontSize: 14,
  },
  mediumText: {
    fontSize: 16,
  },
  largeText: {
    fontSize: 17,
  },
});
