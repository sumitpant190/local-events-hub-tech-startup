import type { Coordinates } from '../types';

// Placeholder coordinates around Market St, San Francisco, keyed by mock venue name.
// Swap for real geocoded venues when the backend supplies location.coordinates.
export const VENUE_COORDINATES: Record<string, Coordinates> = {
  'The Foundry Co-working': { latitude: 37.7897, longitude: -122.4011 },
  'Grindhouse Café': { latitude: 37.7861, longitude: -122.4078 },
  'Innovation Hall': { latitude: 37.7823, longitude: -122.3995 },
  'NeuralForge Lab': { latitude: 37.7765, longitude: -122.4163 },
  'Launchpad HQ': { latitude: 37.7917, longitude: -122.3903 },
  'City Library Auditorium': { latitude: 37.7786, longitude: -122.4156 },
  'Engineering Building, Lab 204': { latitude: 37.7811, longitude: -122.4021 },
  'Greenworks Studio': { latitude: 37.7743, longitude: -122.4089 },
  'Student Union, Main Hall': { latitude: 37.7809, longitude: -122.4038 },
};
