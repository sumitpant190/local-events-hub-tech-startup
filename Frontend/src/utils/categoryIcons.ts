import type Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import type { EventCategory } from '../services/types';

export type IconName = ComponentProps<typeof Ionicons>['name'];

export const CATEGORY_ICONS: Record<EventCategory, IconName> = {
  Hackathon: 'code-slash-outline',
  Networking: 'people-outline',
  Workshop: 'construct-outline',
  'Demo Day': 'rocket-outline',
  Panel: 'mic-outline',
  'Pitch Night': 'trending-up-outline',
};
