import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import Colors from '@/constants/colors';

interface AppBarProps {
  title: string;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  testID?: string;
}

export default function AppBar({
  title,
  onBack,
  rightAction,
  testID,
}: AppBarProps) {
  const insets = useSafeAreaInsets();

  const rightActionNode =
    typeof rightAction === 'string' || typeof rightAction === 'number'
      ? <Text style={styles.rightActionText}>{String(rightAction)}</Text>
      : rightAction || null;

  return (
    <View
      testID={testID}
      style={[styles.container, { paddingTop: insets.top + 12 }]}
    >
      <View style={styles.content}>
        {onBack ? (
          <TouchableOpacity
            onPress={onBack}
            style={styles.backButton}
            testID={`${testID}-back`}
          >
            <ArrowLeft size={24} color={Colors.text.primary} />
          </TouchableOpacity>
        ) : (
          <View style={styles.backButton} />
        )}
        <Text style={styles.title}>{title}</Text>
        <View style={styles.rightAction}>{rightActionNode}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.cream,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    flex: 1,
    textAlign: 'center',
  },
  rightAction: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightActionText: {
    fontSize: 16,
    color: Colors.text.primary,
  },
});
