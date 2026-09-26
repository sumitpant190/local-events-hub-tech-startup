import { MotiText } from 'moti';
import { StyleSheet, View } from 'react-native';
import Animated, { LinearTransition, ZoomIn, ZoomOut } from 'react-native-reanimated';
import type { PublicUser } from '../services/types';
import { useThemeColors } from '../theme/colors';
import { durations, timings } from '../theme/motion';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import Avatar from './Avatar';

type AttendeePreviewProps = {
  attendeeCount: number;
  isGoing: boolean;
  currentUser: PublicUser | null;
  /** Other attendees to show as faces (current user excluded). */
  faces: PublicUser[];
};

const MAX_FACES = 3;
const AVATAR_OVERLAP = 10;
const SPRING_DAMPING = 14;

function getLabel(attendeeCount: number, isGoing: boolean): string {
  if (isGoing) {
    const others = attendeeCount - 1;
    return others > 0 ? `You + ${others} ${others === 1 ? 'other' : 'others'} going` : "You're the first one going!";
  }
  return attendeeCount > 0 ? `${attendeeCount} people going` : 'Be the first to RSVP';
}

export default function AttendeePreview({ attendeeCount, isGoing, currentUser, faces }: AttendeePreviewProps) {
  const colors = useThemeColors();
  const label = getLabel(attendeeCount, isGoing);
  const showSelf = isGoing && currentUser !== null;
  const others = faces.slice(0, showSelf ? MAX_FACES - 1 : MAX_FACES);
  const stack = [
    ...(showSelf ? [{ user: currentUser, isSelf: true }] : []),
    ...others.map((user) => ({ user, isSelf: false })),
  ];

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.stack}>
        {stack.map(({ user, isSelf }, index) => (
          <Animated.View
            key={user.id}
            entering={isSelf ? ZoomIn.springify().damping(SPRING_DAMPING) : undefined}
            exiting={isSelf ? ZoomOut.duration(durations.fast) : undefined}
            layout={LinearTransition.springify().damping(SPRING_DAMPING)}
            style={[index > 0 && styles.overlap, { zIndex: stack.length - index }]}
          >
            <Avatar name={user.name} isHighlighted={isSelf} />
          </Animated.View>
        ))}
      </View>
      {/* Keyed by text so each change fades up instead of swapping instantly. */}
      <MotiText
        key={label}
        from={{ opacity: 0, translateY: 6 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={timings.textSwap}
        style={[typography.bodyStrong, styles.label, { color: colors.textPrimary }]}
        accessibilityLiveRegion="polite"
      >
        {label}
      </MotiText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  stack: { flexDirection: 'row' },
  overlap: { marginLeft: -AVATAR_OVERLAP },
  label: { flex: 1 },
});
