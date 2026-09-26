import Ionicons from '@expo/vector-icons/Ionicons';
import { Linking, Platform, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, type MapStyleElement } from 'react-native-maps';
import type { Coordinates } from '../services/types';
import { useThemeColors, type ColorPalette } from '../theme/colors';
import { CARD_PRESSED_SCALE } from '../theme/motion';
import { radius, spacing } from '../theme/spacing';
import { useThemeScheme } from '../theme/themeContext';
import { typography } from '../theme/typography';
import PressableScale from './PressableScale';

type EventMapProps = {
  coordinates: Coordinates;
  venue: string;
};

const MAP_HEIGHT = 160;
const REGION_DELTA = 0.008;
const ICON_SIZE = 16;

// Google map style built from the palette so the map matches both themes (Android; iOS uses
// userInterfaceStyle). Points of interest and transit are hidden to keep the pin the focus.
function buildMapStyle(colors: ColorPalette): MapStyleElement[] {
  return [
    { elementType: 'geometry', stylers: [{ color: colors.surface }] },
    { elementType: 'labels.text.fill', stylers: [{ color: colors.textSecondary }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: colors.background }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: colors.surfaceElevated }] },
    { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: colors.border }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: colors.border }] },
    { featureType: 'poi', stylers: [{ visibility: 'off' }] },
    { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  ];
}

function openInMaps({ latitude, longitude }: Coordinates, venue: string): void {
  const label = encodeURIComponent(venue);
  const url = Platform.select({
    ios: `maps:0,0?q=${label}@${latitude},${longitude}`,
    default: `geo:${latitude},${longitude}?q=${latitude},${longitude}(${label})`,
  });
  // No maps app installed is not worth an error dialog; the address is already shown above the map.
  Linking.openURL(url).catch(() => undefined);
}

/** Static map preview; tapping it opens the device's maps app at the venue. */
export default function EventMap({ coordinates, venue }: EventMapProps) {
  const colors = useThemeColors();
  const { scheme } = useThemeScheme();

  return (
    <PressableScale
      onPress={() => openInMaps(coordinates, venue)}
      pressedScale={CARD_PRESSED_SCALE}
      accessibilityLabel={`Open ${venue} in Maps`}
      style={[styles.card, { borderColor: colors.border, backgroundColor: colors.surface }]}
    >
      {/* The map is display-only; the whole card is the tap target. */}
      <View pointerEvents="none">
        <MapView
          style={styles.map}
          initialRegion={{ ...coordinates, latitudeDelta: REGION_DELTA, longitudeDelta: REGION_DELTA }}
          customMapStyle={buildMapStyle(colors)}
          userInterfaceStyle={scheme}
          liteMode
          toolbarEnabled={false}
          scrollEnabled={false}
          zoomEnabled={false}
          rotateEnabled={false}
          pitchEnabled={false}
        >
          <Marker coordinate={coordinates} pinColor={colors.primary} />
        </MapView>
      </View>
      <View style={styles.footer}>
        <Ionicons name="navigate-outline" size={ICON_SIZE} color={colors.primary} />
        <Text style={[typography.label, { color: colors.primary }]}>Open in Maps</Text>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  map: { height: MAP_HEIGHT },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
});
