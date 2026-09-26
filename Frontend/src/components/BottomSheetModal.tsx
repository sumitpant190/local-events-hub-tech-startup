import { MotiView } from 'moti';
import { useEffect, useState, type ReactNode } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

type BottomSheetModalProps = {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
};

const SHEET_OFFSET = 600;
const BACKDROP_MS = 220;
const SHEET_SPRING = { type: 'spring', damping: 22, stiffness: 220 } as const;
const HANDLE_WIDTH = 40;

// Custom sheet instead of Modal's built-in slide so open and close both use our spring,
// and the Modal stays mounted until the close animation has finished.
export default function BottomSheetModal({ visible, onClose, title, children }: BottomSheetModalProps) {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const [isMounted, setIsMounted] = useState(visible);

  useEffect(() => {
    if (visible) setIsMounted(true);
  }, [visible]);

  return (
    <Modal visible={isMounted} transparent animationType="none" statusBarTranslucent onRequestClose={onClose}>
      <MotiView
        from={{ opacity: 0 }}
        animate={{ opacity: visible ? 1 : 0 }}
        transition={{ type: 'timing', duration: BACKDROP_MS }}
        style={[StyleSheet.absoluteFill, { backgroundColor: colors.scrim }]}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close" />
      </MotiView>

      <KeyboardAvoidingView style={styles.anchor} behavior={Platform.OS === 'ios' ? 'padding' : undefined} pointerEvents="box-none">
        <MotiView
          from={{ translateY: SHEET_OFFSET }}
          animate={{ translateY: visible ? 0 : SHEET_OFFSET }}
          transition={SHEET_SPRING}
          onDidAnimate={(key, finished) => {
            if (key === 'translateY' && finished && !visible) setIsMounted(false);
          }}
          style={[
            styles.sheet,
            { backgroundColor: colors.surface, borderColor: colors.border, paddingBottom: insets.bottom + spacing.xl },
          ]}
          accessibilityViewIsModal
        >
          <View style={[styles.handle, { backgroundColor: colors.border }]} />
          <Text style={[typography.h2, styles.title, { color: colors.textPrimary }]}>{title}</Text>
          {children}
        </MotiView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  anchor: { flex: 1, justifyContent: 'flex-end' },
  sheet: {
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
  },
  handle: {
    alignSelf: 'center',
    width: HANDLE_WIDTH,
    height: 4,
    borderRadius: radius.pill,
    marginBottom: spacing.lg,
  },
  title: { marginBottom: spacing.lg },
});
