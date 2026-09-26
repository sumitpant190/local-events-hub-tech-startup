import { StyleSheet, Text, View } from 'react-native';
import { useThemeColors } from '../theme/colors';
import { fonts } from '../theme/typography';

type AvatarProps = {
  name: string;
  size?: number;
  /** Primary fill, used to mark the current user. */
  isHighlighted?: boolean;
};

const DEFAULT_SIZE = 36;
const RING_WIDTH = 2;
const INITIALS_RATIO = 0.38;

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}

// Initials avatar; the ring matches the surface so overlapping stacks read cleanly.
export default function Avatar({ name, size = DEFAULT_SIZE, isHighlighted = false }: AvatarProps) {
  const colors = useThemeColors();

  return (
    <View
      accessibilityLabel={name}
      style={[
        styles.circle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderColor: colors.surface,
          backgroundColor: isHighlighted ? colors.primary : colors.accentTint,
        },
      ]}
    >
      <Text
        style={{
          fontFamily: fonts.bodySemiBold,
          fontSize: size * INITIALS_RATIO,
          color: isHighlighted ? colors.onPrimary : colors.accentText,
        }}
      >
        {getInitials(name)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: { alignItems: 'center', justifyContent: 'center', borderWidth: RING_WIDTH },
});
