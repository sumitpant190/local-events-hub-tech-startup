import { StyleSheet, Text, View } from 'react-native';
import type { EventComment } from '../services/types';
import { useThemeColors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { formatRelativeTime } from '../utils/date';
import { toJSDate } from '../utils/firestoreDates';
import Avatar from './Avatar';

type CommentItemProps = {
  comment: EventComment;
  authorName: string;
  isOwn: boolean;
};

const AVATAR_SIZE = 36;

export default function CommentItem({ comment, authorName, isOwn }: CommentItemProps) {
  const colors = useThemeColors();

  return (
    <View style={styles.row}>
      <Avatar name={authorName} size={AVATAR_SIZE} isHighlighted={isOwn} />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[typography.bodyStrong, { color: colors.textPrimary }]} numberOfLines={1}>
            {isOwn ? 'You' : authorName}
          </Text>
          <Text style={[typography.caption, { color: colors.textSecondary }]}>
            · {formatRelativeTime(toJSDate(comment.createdAt))}
          </Text>
        </View>
        <Text style={[typography.body, { color: colors.textSecondary }]}>{comment.text}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.md, paddingVertical: spacing.md },
  content: { flex: 1, gap: spacing.xxs },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
});
