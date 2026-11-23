import React from "react";
import { View, TouchableOpacity, StyleSheet, ScrollView, Text } from "react-native";
import { hp, wp } from "../../utils/size";
import { fontFamilies } from "../../utils/fontFamilies";
import { useTheme } from "../../theme";

interface CustomTabsProps {
  tabs: string[];
  activeTab: string;
  onTabPress: (tab: string) => void;
  getLabel?: (tab: string, index: number) => string;
}

const CustomTabs: React.FC<CustomTabsProps> = ({ tabs, activeTab, onTabPress, getLabel }) => {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    tabsContainer: {
      marginBottom: hp(2.5),
      overflow: "hidden",
    },
    scrollContent: {
      flexGrow: 1,
      alignItems: "center",
    },
    tabItem: {
      paddingHorizontal: wp(6),
      paddingVertical: hp(1),
      borderBottomWidth: 0.5,
      borderBottomColor: theme.white20,
      justifyContent: "center",
      alignItems: "center",
      flex: 1,
    },
    activeTab: {
      borderBottomWidth: 2,
      borderBottomColor: theme.white,
    },
    tabText: {
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.8),
      color: theme.white,
      opacity: 0.6,
      alignSelf: "center",
    },
    tabTextActive: {
      fontFamily: fontFamilies.semiBold,
      opacity: 1,
    },
  });

  return (
    <View style={styles.tabsContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {
            // borderBottomColor: theme.white + "60",
            // borderBottomWidth: 1,
          },
        ]}
      >
        {tabs.map((tab, index) => {
          const isActive = activeTab === tab;
          const label = getLabel ? getLabel(tab, index) : tab;
          return (
            <TouchableOpacity
              key={`${tab}-${index}`}
              style={[
                styles.tabItem,
                isActive && styles.activeTab,
              ]}
              onPress={() => onTabPress(tab)}
            >
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default CustomTabs;

