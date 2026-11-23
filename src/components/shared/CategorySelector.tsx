import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { hp, wp } from '../../utils/size';
import { fontFamilies } from '../../utils/fontFamilies';
import { useTheme } from '../../theme';
import GlassWrapper from '../GlassWrapper';

interface CategoryOption {
  id: string;
  label: string;
}

interface CategorySelectorProps {
  categories: CategoryOption[];
  selectedCategories: string[];
  onCategorySelect: (categoryId: string) => void;
  title?: string;
  multiSelect?: boolean;
  containerStyle?: any;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({
  categories,
  selectedCategories,
  onCategorySelect,
  title = "What's Going On?",
  multiSelect = true,
  containerStyle,
}) => {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    container: {
      width: '100%',
    },
    card: {
      width: '100%',
      paddingHorizontal: wp(4),
      paddingVertical: hp(2),
      borderRadius: hp(3),
    },
    title: {
      fontFamily: fontFamilies.medium,
      fontSize: hp(1.8),
      color: theme.white,
      marginBottom: hp(2),
      textAlign: 'center',
    },
    categoriesContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: wp(2.5),
      justifyContent: 'center',
    },
    categoryItem: {
      paddingHorizontal: wp(4),
      paddingVertical: hp(1),
      borderRadius: hp(999),
    },
    categoryText: {
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.4),
      color: theme.white,
    },
  });

  const isSelected = (categoryId: string) => {
    return selectedCategories.includes(categoryId);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <GlassWrapper bordered style={styles.card}>
        {title && <Text style={styles.title}>{title}</Text>}
        <View style={styles.categoriesContainer}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              onPress={() => onCategorySelect(category.id)}
            >
              <GlassWrapper bordered={isSelected(category.id)} style={styles.categoryItem}>
                <Text style={styles.categoryText}>{category.label}</Text>
              </GlassWrapper>
            </TouchableOpacity>
          ))}
        </View>
      </GlassWrapper>
    </View>
  );
};

export default CategorySelector;

