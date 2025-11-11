import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ViewStyle,
  TextInputProps,
  TouchableOpacity,
} from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import Colors from '@/constants/colors';

interface FormInputProps extends TextInputProps {
  label: string;
  error?: string;
  containerStyle?: ViewStyle;
  testID?: string;
}

export function FormInput({
  label,
  error,
  containerStyle,
  testID,
  secureTextEntry,
  ...props
}: FormInputProps) {
  const [isSecure, setIsSecure] = useState(secureTextEntry);

  return (
    <View style={[styles.container, containerStyle]} testID={testID}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, error && styles.inputError]}
          placeholderTextColor={Colors.text.light}
          secureTextEntry={isSecure}
          testID={`${testID}-input`}
          {...props}
        />
        {secureTextEntry && (
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setIsSecure(!isSecure)}
            testID={`${testID}-toggle-secure`}
          >
            {isSecure ? (
              <EyeOff size={20} color={Colors.text.secondary} />
            ) : (
              <Eye size={20} color={Colors.text.secondary} />
            )}
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <Text style={styles.error} testID={`${testID}-error`}>
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#5C4A3A',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  inputContainer: {
    position: 'relative',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E8DDD0',
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 14,
    fontSize: 15,
    color: Colors.text.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  inputError: {
    borderColor: Colors.error,
  },
  eyeButton: {
    position: 'absolute',
    right: 14,
    top: 13,
    padding: 4,
  },
  error: {
    fontSize: 12,
    color: Colors.error,
    marginTop: 6,
    fontWeight: '500' as const,
  },
});
