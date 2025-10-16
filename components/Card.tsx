import React from 'react';
import { View, StyleSheet, ViewStyle, Text } from 'react-native';
import Colors from '@/constants/colors';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  testID?: string;
}

export default function Card({ children, style, testID }: CardProps) {
  const isTextChild = typeof children === 'string' || typeof children === 'number';

  return (
    <View testID={testID} style={[styles.card, style]}>
      {isTextChild ? <Text>{children}</Text> : children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.background.card,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
});
