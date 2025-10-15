import React from 'react';
import {
  Modal as RNModal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react-native';
import Colors from '@/constants/colors';
import Button from '@/components/Button';

interface BaseModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  message: string;
  testID?: string;
}

interface ModalSuccessProps extends BaseModalProps {
  onConfirm?: () => void;
  confirmText?: string;
}

interface ModalErrorProps extends BaseModalProps {
  onConfirm?: () => void;
  confirmText?: string;
}

interface ModalInfoProps extends BaseModalProps {
  onConfirm?: () => void;
  confirmText?: string;
}

interface ModalConfirmProps extends BaseModalProps {
  onConfirm: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
}

function ModalBase({
  visible,
  onClose,
  children,
  testID,
}: {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  testID?: string;
}) {
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
          {children}
        </Pressable>
      </Pressable>
    </RNModal>
  );
}

export function ModalSuccess({
  visible,
  onClose,
  title,
  message,
  onConfirm,
  confirmText = 'OK',
  testID,
}: ModalSuccessProps) {
  const handleConfirm = () => {
    onConfirm?.();
    onClose();
  };

  return (
    <ModalBase visible={visible} onClose={onClose} testID={testID}>
      <View style={styles.content}>
        <TouchableOpacity
          onPress={onClose}
          style={styles.closeButton}
          testID={`${testID}-close`}
        >
          <X size={24} color={Colors.text.secondary} />
        </TouchableOpacity>

        <View style={[styles.iconContainer, styles.successIcon]}>
          <CheckCircle size={48} color={Colors.success} />
        </View>

        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>

        <Button
          title={confirmText}
          onPress={handleConfirm}
          style={styles.button}
          testID={`${testID}-confirm`}
        />
      </View>
    </ModalBase>
  );
}

export function ModalError({
  visible,
  onClose,
  title,
  message,
  onConfirm,
  confirmText = 'OK',
  testID,
}: ModalErrorProps) {
  const handleConfirm = () => {
    onConfirm?.();
    onClose();
  };

  return (
    <ModalBase visible={visible} onClose={onClose} testID={testID}>
      <View style={styles.content}>
        <TouchableOpacity
          onPress={onClose}
          style={styles.closeButton}
          testID={`${testID}-close`}
        >
          <X size={24} color={Colors.text.secondary} />
        </TouchableOpacity>

        <View style={[styles.iconContainer, styles.errorIcon]}>
          <AlertCircle size={48} color={Colors.error} />
        </View>

        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>

        <Button
          title={confirmText}
          onPress={handleConfirm}
          style={styles.button}
          testID={`${testID}-confirm`}
        />
      </View>
    </ModalBase>
  );
}

export function ModalInfo({
  visible,
  onClose,
  title,
  message,
  onConfirm,
  confirmText = 'Got it',
  testID,
}: ModalInfoProps) {
  const handleConfirm = () => {
    onConfirm?.();
    onClose();
  };

  return (
    <ModalBase visible={visible} onClose={onClose} testID={testID}>
      <View style={styles.content}>
        <TouchableOpacity
          onPress={onClose}
          style={styles.closeButton}
          testID={`${testID}-close`}
        >
          <X size={24} color={Colors.text.secondary} />
        </TouchableOpacity>

        <View style={[styles.iconContainer, styles.infoIcon]}>
          <Info size={48} color={Colors.amber} />
        </View>

        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>

        <Button
          title={confirmText}
          onPress={handleConfirm}
          variant="secondary"
          style={styles.button}
          testID={`${testID}-confirm`}
        />
      </View>
    </ModalBase>
  );
}

export function ModalConfirm({
  visible,
  onClose,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  destructive = false,
  testID,
}: ModalConfirmProps) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const handleCancel = () => {
    onCancel?.();
    onClose();
  };

  return (
    <ModalBase visible={visible} onClose={onClose} testID={testID}>
      <View style={styles.content}>
        <TouchableOpacity
          onPress={onClose}
          style={styles.closeButton}
          testID={`${testID}-close`}
        >
          <X size={24} color={Colors.text.secondary} />
        </TouchableOpacity>

        <View style={[styles.iconContainer, destructive ? styles.warningIcon : styles.infoIcon]}>
          {destructive ? (
            <AlertTriangle size={48} color={Colors.error} />
          ) : (
            <Info size={48} color={Colors.amber} />
          )}
        </View>

        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>

        <View style={styles.buttonRow}>
          <Button
            title={cancelText}
            onPress={handleCancel}
            variant="outline"
            style={styles.buttonHalf}
            testID={`${testID}-cancel`}
          />
          <Button
            title={confirmText}
            onPress={handleConfirm}
            style={styles.buttonHalf}
            testID={`${testID}-confirm`}
          />
        </View>
      </View>
    </ModalBase>
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
    borderRadius: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  content: {
    padding: 24,
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 4,
    zIndex: 1,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  successIcon: {
    backgroundColor: `${Colors.success}15`,
  },
  errorIcon: {
    backgroundColor: `${Colors.error}15`,
  },
  infoIcon: {
    backgroundColor: `${Colors.amber}15`,
  },
  warningIcon: {
    backgroundColor: `${Colors.error}15`,
  },
  title: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  button: {
    width: '100%',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  buttonHalf: {
    flex: 1,
  },
});
