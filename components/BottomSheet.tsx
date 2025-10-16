import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Animated,
  Dimensions,
} from 'react-native';
import { X } from 'lucide-react-native';
import Colors from '@/constants/colors';

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  testID?: string;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function BottomSheet({
  visible,
  onClose,
  title,
  children,
  testID,
}: BottomSheetProps) {
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: SCREEN_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, translateY]);

  return (
    <Modal
      testID={testID}
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable onPress={(e) => e.stopPropagation()}>
          <Animated.View
            style={[
              styles.sheet,
              {
                transform: [{ translateY }],
              },
            ]}
          >
            <View style={styles.handle} />
            <View style={styles.header}>
              {title && <Text style={styles.title}>{title}</Text>}
              <TouchableOpacity
                onPress={onClose}
                style={styles.closeButton}
                testID={`${testID}-close`}
              >
                <X size={24} color={Colors.text.secondary} />
              </TouchableOpacity>
            </View>
            <View style={styles.content}>{typeof children === 'string' || typeof children === 'number' ? <Text>{children}</Text> : children}</View>
          </Animated.View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.background.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: SCREEN_HEIGHT * 0.9,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 20,
  },
});
