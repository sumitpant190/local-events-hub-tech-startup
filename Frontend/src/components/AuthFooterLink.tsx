import { StyleSheet, Text } from 'react-native';
import { useThemeColors } from '../theme/colors';
import { typography } from '../theme/typography';
import PressableScale from './PressableScale';

type AuthFooterLinkProps = {
  prompt: string;
  action: string;
  onPress: () => void;
};

export default function AuthFooterLink({ prompt, action, onPress }: AuthFooterLinkProps) {
  const colors = useThemeColors();

  return (
    <PressableScale onPress={onPress} accessibilityLabel={action}>
      <Text style={[typography.body, { color: colors.textSecondary }]}>
        {prompt} <Text style={[styles.action, { color: colors.primary }]}>{action}</Text>
      </Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  action: typography.bodyStrong,
});
