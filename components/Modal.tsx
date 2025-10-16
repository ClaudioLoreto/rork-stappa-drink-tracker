import React from 'react';
import {
  Modal as RNModal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { X } from 'lucide-react-native';
import Colors from '@/constants/colors';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  testID?: string;
}

export default function Modal({
  visible,
  onClose,
  title,
  children,
  testID,
}: ModalProps) {
  const isTextChild = typeof children === 'string' || typeof children === 'number';

  return (
    <RNModal
      testID={testID}
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.modal} onPress={(e) => e.stopPropagation()}>
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
          <View style={styles.content}>{isTextChild ? <Text>{children}</Text> : children}</View>
        </Pressable>
      </Pressable>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: Colors.background.card,
    borderRadius: 20,
    width: '100%',
    maxWidth: 500,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
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
