import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { useThemeColors } from '../theme/colors';
import PressableScale from './PressableScale';

type BackButtonProps = {
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
};

const SIZE = 40;
const ICON_SIZE = 22;

// Floating translucent back button for screens with a full-bleed hero.
export default function BackButton({ onPress, style }: BackButtonProps) {
  const colors = useThemeColors();

  return (
    <PressableScale
      onPress={onPress}
      accessibilityLabel="Go back"
      style={[styles.button, { backgroundColor: colors.surfaceGlass, borderColor: colors.border }, style]}
    >
      <Ionicons name="arrow-back" size={ICON_SIZE} color={colors.textPrimary} />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  button: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
});
