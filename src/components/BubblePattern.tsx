// BubblePatternLayout.tsx - Consistent 3-per-row grid (1st & 3rd aligned, center 50% down) with dynamic sizing
import React, { useMemo } from 'react';
import {
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ViewStyle,
  ScrollView,
} from 'react-native';
import { useTheme } from '../theme';
import { hp, wp } from '../utils/size';
import { fontFamilies } from '../utils/fontFamilies';
import GlassView from './GlassWrapper';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface BubbleItem {
  id: string;
  label: string;
}

interface BubblePatternLayoutProps {
  items: BubbleItem[];
  onSelect?: (item: BubbleItem) => void;
  selectedId?: string;
  bubbleStyle?: ViewStyle;
  textStyle?: object;
  minSize?: number;
  maxSize?: number;
  containerPadding?: number;
  containerWidth?: number;
}

const BUBBLES_PER_ROW = 3;
const CENTER_OFFSET_RATIO = 0.5; // Center bubble down 50% of row height
const BUBBLE_GAP = wp(2); // Horizontal gap between bubbles (responsive)
const BUBBLE_ROW_GAP = hp(1.5); // Vertical gap between rows (responsive)
const H_PADDING = wp(4); // Horizontal padding inside container
const V_PADDING = hp(2); // Vertical padding inside container

// Calculate dynamic size based on text length
const getBubbleSize = (text: string, minSize: number, maxSize: number) => {
  const length = text.length;
  // Base size + increment per character (increased for padding)
  const estimatedSize = minSize + (length > 5 ? (length - 5) * hp(0.6) : 0);
  return Math.min(estimatedSize, maxSize);
};

export const AdvancedBubblePatternLayout: React.FC<BubblePatternLayoutProps> = ({
  items,
  onSelect,
  selectedId,
  bubbleStyle,
  textStyle,
  minSize = hp(8),
  maxSize = hp(16),
  containerPadding,
  containerWidth = SCREEN_WIDTH,
}) => {
  const { theme } = useTheme();

  const { bubbleData, containerHeight, bottomPadding } = useMemo(() => {
    const hPad = typeof containerPadding === 'number' ? containerPadding : H_PADDING;
    const vPad = typeof containerPadding === 'number' ? containerPadding : V_PADDING;
    const availableWidth = Math.max(0, containerWidth - hPad * 2);

    // Calculate max possible size for a bubble in a 3-column grid
    const maxGridSize = (availableWidth - 2 * BUBBLE_GAP) / BUBBLES_PER_ROW;

    // We use the largest size required by any item in the row to determine the row height/width
    // But since this is a strict grid, we simply enforce a standard size for the grid cells
    // proportional to the max text length in the set? Or we just use a consistent size for alignment?
    // The user wants dynamic size BUT consistent pattern. 
    // To keep the pattern consistent (centers aligned), we should probably use the computed size
    // for the bubble dimensions but center it within its grid cell.

    // Actually, user said: "size should be according to the text length... and fit"
    // AND "pattern same... three in one row and center one down".
    // So we calculate the size for each bubble individually.

    // Let's determine the "Grid Cell Size" based on the maximum allowed size or the container width
    const cellSize = Math.min(maxSize, maxGridSize);
    const rowHeight = cellSize + BUBBLE_ROW_GAP;

    const totalRowWidth = 3 * cellSize + 2 * BUBBLE_GAP;
    const startX = hPad + Math.max(0, (availableWidth - totalRowWidth) / 2);

    const data = items.map((item, index) => {
      const row = Math.floor(index / BUBBLES_PER_ROW);
      const col = index % BUBBLES_PER_ROW;

      // Calculate dynamic size for this specific item
      const itemSize = getBubbleSize(item.label, minSize, cellSize);

      const rowTop = vPad + row * rowHeight;

      let cellLeft: number;
      let cellTop: number;

      if (col === 0) {
        cellLeft = startX;
        cellTop = rowTop;
      } else if (col === 1) {
        cellLeft = startX + cellSize + BUBBLE_GAP;
        cellTop = rowTop + cellSize * CENTER_OFFSET_RATIO;
      } else {
        cellLeft = startX + 2 * (cellSize + BUBBLE_GAP);
        cellTop = rowTop;
      }

      // Center the bubble within the cell
      const left = cellLeft + (cellSize - itemSize) / 2;
      const top = cellTop + (cellSize - itemSize) / 2;

      return {
        ...item,
        size: itemSize,
        left,
        top,
      };
    });

    const numRows = Math.ceil(items.length / BUBBLES_PER_ROW);
    const contentHeight = vPad + numRows * rowHeight + (cellSize * CENTER_OFFSET_RATIO) + vPad;

    return {
      bubbleData: data,
      containerHeight: contentHeight,
      bottomPadding: vPad,
    };
  }, [items, minSize, maxSize, containerPadding, containerWidth]);

  const dynamicStyles = StyleSheet.create({
    bubbleText: {
      color: theme.white,
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.4),
      textAlign: 'center',
      padding: wp(1.5), // Equal padding on all sides
      lineHeight: hp(2),
    },
    selectedText: {
      fontFamily: fontFamilies.semiBold,
    },
  });

  return (
    <ScrollView
      style={styles.scrollContainer}
      contentContainerStyle={[
        styles.container,
        { minHeight: containerHeight, paddingBottom: bottomPadding },
      ]}
      showsVerticalScrollIndicator={false}
      bounces={false}
    >
      {bubbleData.map((bubble) => {
        const isSelected = selectedId === bubble.id;

        return (
          <GlassView
            key={bubble.id}
            radius={bubble.size / 2}
            opacity={0.03}
            style={[{
              width: bubble.size,
              height: bubble.size,
              position: 'absolute',
              left: bubble.left,
              top: bubble.top,

              ...bubbleStyle,
            }, selectedId === bubble.id && { backgroundColor: theme.selectedOption, }] as any}
          >
            <TouchableOpacity
              style={{
                width: bubble.size,
                height: bubble.size,
                borderRadius: bubble.size / 2,
                justifyContent: 'center',
                alignItems: 'center',
              }}
              onPress={() => onSelect?.(bubble)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  dynamicStyles.bubbleText,
                  textStyle,
                  isSelected && dynamicStyles.selectedText,
                ] as any}
                numberOfLines={2}
                adjustsFontSizeToFit
                minimumFontScale={0.5}
              >
                {bubble.label}
              </Text>
            </TouchableOpacity>
          </GlassView>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    position: 'relative',
    width: '100%',
  },
});