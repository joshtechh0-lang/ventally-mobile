import React, { useRef, useState, useCallback } from "react";
import {
  View,
  FlatList,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from "react-native";
import CustomTabs from "./CustomTabs";
import { wp } from "../../utils/size";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface SwipeableTabsProps {
  tabs: string[];
  renderContent: (tab: string, index: number) => React.ReactNode;
  initialTab?: number;
  onTabChange?: (tab: string, index: number) => void;
  paddingHorizontal?: number;
  getLabel?: (tab: string, index: number) => string;
}

const SwipeableTabs: React.FC<SwipeableTabsProps> = ({
  tabs,
  renderContent,
  initialTab = 0,
  onTabChange,
  paddingHorizontal = 20,
  getLabel,
}) => {
  const [activeIndex, setActiveIndex] = useState(initialTab);
  const [containerWidth, setContainerWidth] = useState(0);
  const contentRef = useRef<FlatList>(null);
  const isScrolling = useRef(false);

  // Fallback width calculation until onLayout triggers
  const initialWidth = SCREEN_WIDTH - paddingHorizontal * 2;
  const currentWidth = containerWidth || initialWidth;

  const handleTabPress = useCallback(
    (tab: string) => {
      const index = tabs.indexOf(tab);
      if (index !== -1 && index !== activeIndex) {
        setActiveIndex(index);
        contentRef.current?.scrollToIndex({ index, animated: true });
        onTabChange?.(tab, index);
      }
    },
    [tabs, activeIndex, onTabChange]
  );

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (!isScrolling.current) {
        return;
      }

      const offsetX = event.nativeEvent.contentOffset.x;
      const index = Math.round(offsetX / currentWidth);

      if (index >= 0 && index < tabs.length && index !== activeIndex) {
        setActiveIndex(index);
        onTabChange?.(tabs[index], index);
      }
    },
    [tabs, activeIndex, onTabChange, currentWidth]
  );

  const handleScrollBeginDrag = useCallback(() => {
    isScrolling.current = true;
  }, []);

  const handleMomentumScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      isScrolling.current = false;
      const offsetX = event.nativeEvent.contentOffset.x;
      const index = Math.round(offsetX / currentWidth);

      if (index !== activeIndex) {
        setActiveIndex(index);
        onTabChange?.(tabs[index], index);
      }
    },
    [tabs, activeIndex, onTabChange, currentWidth]
  );

  const renderItem = useCallback(
    ({ item, index }: { item: string; index: number }) => {
      return (
        <View style={{ width: currentWidth, overflow: 'hidden' }}>
          {renderContent(item, index)}
        </View>
      );
    },
    [renderContent, currentWidth]
  );

  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: currentWidth,
      offset: currentWidth * index,
      index,
    }),
    [currentWidth]
  );

  const onLayout = useCallback((event: any) => {
    const { width } = event.nativeEvent.layout;
    if (width > 0) {
      setContainerWidth(width);
    }
  }, []);

  return (
    <View style={{ flex: 1, overflow: 'hidden' }} onLayout={onLayout}>
      <CustomTabs
        tabs={tabs}
        activeTab={tabs[activeIndex]}
        onTabPress={handleTabPress}
        getLabel={getLabel}
      />

      <View style={{ flex: 1, overflow: 'hidden' }}>
        <FlatList
          ref={contentRef}
          data={tabs}
          renderItem={renderItem}
          keyExtractor={(item, index) => `tab-${index}`}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          onScrollBeginDrag={handleScrollBeginDrag}
          onMomentumScrollEnd={handleMomentumScrollEnd}
          scrollEventThrottle={16}
          getItemLayout={getItemLayout}
          initialScrollIndex={initialTab}
          bounces={false}
          style={{ overflow: 'hidden' }}
          removeClippedSubviews={true}
        />
      </View>
    </View>
  );
};

export default SwipeableTabs;

