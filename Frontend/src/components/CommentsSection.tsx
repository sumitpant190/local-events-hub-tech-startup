import { MotiText } from 'moti';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, LinearTransition } from 'react-native-reanimated';
import type { CommentWithAuthor } from '../services/types';
import { useAuthStore } from '../store/authStore';
import { useCommentsStore } from '../store/commentsStore';
import { useThemeColors } from '../theme/colors';
import { MAX_STAGGERED_ITEMS, STAGGER_MS, timings } from '../theme/motion';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import AnimatedMessage from './AnimatedMessage';
import CommentInput from './CommentInput';
import CommentItem from './CommentItem';

type CommentsSectionProps = {
  eventId: string;
};

// Stable fallback so the store selector doesn't return a fresh [] every render.
const NO_COMMENTS: CommentWithAuthor[] = [];
const SPRING_DAMPING = 16;

export default function CommentsSection({ eventId }: CommentsSectionProps) {
  const colors = useThemeColors();
  const comments = useCommentsStore((state) => state.commentsByEvent[eventId]) ?? NO_COMMENTS;
  const isPosting = useCommentsStore((state) => state.postingEventId === eventId);
  const loadError = useCommentsStore((state) => state.loadErrorByEvent[eventId] ?? null);
  const loadComments = useCommentsStore((state) => state.loadComments);
  const addComment = useCommentsStore((state) => state.addComment);
  const currentUser = useAuthStore((state) => state.currentUser);

  useEffect(() => {
    loadComments(eventId);
  }, [eventId, loadComments]);

  const handleSubmit = (text: string) =>
    currentUser
      ? addComment(eventId, text)
      : Promise.resolve({ ok: false as const, error: 'Log in to comment.' });

  return (
    <View>
      <View style={styles.header}>
        <Text style={[typography.h2, { color: colors.textPrimary }]}>Comments</Text>
        <View style={[styles.count, { backgroundColor: colors.primaryTint }]}>
          <MotiText
            key={comments.length}
            from={{ opacity: 0, translateY: 6 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={timings.textSwap}
            style={[typography.label, { color: colors.primary }]}
          >
            {comments.length}
          </MotiText>
        </View>
      </View>

      {currentUser ? (
        <CommentInput authorName={currentUser.name} isPosting={isPosting} onSubmit={handleSubmit} />
      ) : null}

      <AnimatedMessage message={loadError} />

      {comments.length === 0 ? (
        <Text style={[typography.body, styles.empty, { color: colors.textSecondary }]}>
          No comments yet. Start the conversation.
        </Text>
      ) : (
        // Newest first: a posted comment slides down into the top slot and the rest spring down after it.
        comments.map((comment, index) => (
          <Animated.View
            key={comment.id}
            entering={FadeInDown.delay(index < MAX_STAGGERED_ITEMS ? index * STAGGER_MS : 0)
              .springify()
              .damping(SPRING_DAMPING)}
            layout={LinearTransition.springify().damping(SPRING_DAMPING)}
            style={index > 0 && [styles.divider, { borderTopColor: colors.border }]}
          >
            <CommentItem
              comment={comment}
              authorName={comment.author.name}
              isOwn={comment.author.id === currentUser?.id}
            />
          </Animated.View>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  count: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xxs, borderRadius: radius.pill },
  empty: { marginTop: spacing.md },
  divider: { borderTopWidth: StyleSheet.hairlineWidth },
});
