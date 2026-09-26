import { ScrollView, StyleSheet } from 'react-native';
import { EVENT_CATEGORIES } from '../services/types';
import { spacing } from '../theme/spacing';
import { CATEGORY_ICONS } from '../utils/categoryIcons';
import type { CategoryFilter } from '../utils/filterEvents';
import CategoryChip from './CategoryChip';

type CategoryFilterBarProps = {
  selected: CategoryFilter;
  onSelect: (category: CategoryFilter) => void;
};

export default function CategoryFilterBar({ selected, onSelect }: CategoryFilterBarProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      keyboardShouldPersistTaps="handled"
    >
      <CategoryChip label="All" icon="apps-outline" isSelected={selected === 'All'} onPress={() => onSelect('All')} />
      {EVENT_CATEGORIES.map((category) => (
        <CategoryChip
          key={category}
          label={category}
          icon={CATEGORY_ICONS[category]}
          isSelected={selected === category}
          onPress={() => onSelect(category)}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { gap: spacing.sm, paddingVertical: spacing.md },
});
