import React from 'react';
import { View, StyleSheet, ViewStyle, Text } from 'react-native';
import Colors from '@/constants/colors';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  testID?: string;
}

function wrapTextChildren(children: React.ReactNode): React.ReactNode {
  if (children === null || children === undefined) return null;
  if (typeof children === 'string' || typeof children === 'number') {
    return <Text>{children}</Text>;
  }
  if (Array.isArray(children)) {
    return children.map((child, idx) =>
      typeof child === 'string' || typeof child === 'number' ? (
        <Text key={`t-${idx}`}>{child}</Text>
      ) : (
        child
      ),
    );
  }
  return children;
}

export default function Card({ children, style, testID }: CardProps) {
  return (
    <View testID={testID} style={[styles.card, style]}>
      {wrapTextChildren(children)}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E8DDD0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
});
