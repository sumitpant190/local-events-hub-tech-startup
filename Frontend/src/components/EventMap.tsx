import Ionicons from '@expo/vector-icons/Ionicons';
import * as Location from 'expo-location';
import { useCallback, useEffect, useState } from 'react';
import { Linking, Platform, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, type MapStyleElement } from 'react-native-maps';
import { useThemeColors, type ColorPalette } from '../theme/colors';
import { CARD_PRESSED_SCALE } from '../theme/motion';
import { radius, spacing } from '../theme/spacing';
import { useThemeScheme } from '../theme/themeContext';
import { typography } from '../theme/typography';
import PressableScale from './PressableScale';

type EventMapProps = {
  /** The event's `location` string; geocoded on the device to place the pin. */
  location: string;
};

type Coordinates = { latitude: number; longitude: number };

// idle: waiting for the user to allow location (Android needs it to geocode); unavailable: denied or not found.
type MapState = { kind: 'idle' } | { kind: 'locating' } | { kind: 'ready'; coordinates: Coordinates } | { kind: 'unavailable' };

const MAP_HEIGHT = 160;
const REGION_DELTA = 0.008;
const ICON_SIZE = 16;

// Geocoding is rate-limited on the device, so each address is looked up at most once per session.
const geocodeCache = new Map<string, Coordinates | null>();

async function geocode(location: string): Promise<Coordinates | null> {
  if (geocodeCache.has(location)) return geocodeCache.get(location) ?? null;
  const [first] = await Location.geocodeAsync(location);
  const coordinates = first ? { latitude: first.latitude, longitude: first.longitude } : null;
  geocodeCache.set(location, coordinates);
  return coordinates;
}

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

// With coordinates the maps app drops a pin; without, it searches the address text (no permission needed).
function openInMaps(location: string, coordinates: Coordinates | null): void {
  const label = encodeURIComponent(location);
  const url = coordinates
    ? Platform.select({
        ios: `maps:0,0?q=${label}@${coordinates.latitude},${coordinates.longitude}`,
        default: `geo:${coordinates.latitude},${coordinates.longitude}?q=${coordinates.latitude},${coordinates.longitude}(${label})`,
      })
    : Platform.select({ ios: `maps:0,0?q=${label}`, default: `geo:0,0?q=${label}` });
  // No maps app installed is not worth an error dialog; the address is already shown above the map.
  Linking.openURL(url).catch(() => undefined);
}

/** Venue map: geocodes the location string, then shows a static preview; tapping opens the maps app. */
export default function EventMap({ location }: EventMapProps) {
  const colors = useThemeColors();
  const { scheme } = useThemeScheme();
  const [state, setState] = useState<MapState>({ kind: 'idle' });

  const locate = useCallback(
    async (isActive: () => boolean = () => true) => {
      setState({ kind: 'locating' });
      try {
        const coordinates = await geocode(location);
        if (isActive()) setState(coordinates ? { kind: 'ready', coordinates } : { kind: 'unavailable' });
      } catch {
        if (isActive()) setState({ kind: 'unavailable' });
      }
    },
    [location],
  );

  // Show the map straight away when location is already allowed; otherwise wait for the user to opt in.
  useEffect(() => {
    let active = true;
    Location.getForegroundPermissionsAsync()
      .then(({ granted }) => {
        if (granted && active) void locate(() => active);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [locate]); // `locate` changes only with the address.

  const requestAndLocate = async () => {
    const { granted } = await Location.requestForegroundPermissionsAsync().catch(() => ({ granted: false }));
    if (granted) await locate();
    else setState({ kind: 'unavailable' });
  };

  const coordinates = state.kind === 'ready' ? state.coordinates : null;
  const cardStyle = [styles.card, { borderColor: colors.border, backgroundColor: colors.surface }];

  if (state.kind === 'idle' || state.kind === 'locating') {
    return (
      <PressableScale
        onPress={requestAndLocate}
        disabled={state.kind === 'locating'}
        pressedScale={CARD_PRESSED_SCALE}
        accessibilityLabel={`Show ${location} on a map`}
        style={cardStyle}
      >
        <View style={styles.footer}>
          <Ionicons name="map-outline" size={ICON_SIZE} color={colors.primary} />
          <Text style={[typography.label, { color: colors.primary }]}>
            {state.kind === 'locating' ? 'Finding the venue…' : 'Show on map'}
          </Text>
        </View>
      </PressableScale>
    );
  }

  return (
    <PressableScale
      onPress={() => openInMaps(location, coordinates)}
      pressedScale={CARD_PRESSED_SCALE}
      accessibilityLabel={`Open ${location} in Maps`}
      style={cardStyle}
    >
      {coordinates ? (
        // The map is display-only; the whole card is the tap target.
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
      ) : null}
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
