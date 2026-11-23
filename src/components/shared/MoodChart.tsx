import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { useTranslation } from 'react-i18next';
import { hp, wp } from '../../utils/size';
import { fontFamilies } from '../../utils/fontFamilies';
import { useTheme } from '../../theme';
import GlassWrapper from '../GlassWrapper';

interface MoodData {
  value: number;
  label: string;
  gradientColor?: string;
  spacing?: number;
  labelWidth?: number;
  labelTextStyle?: TextStyle;
  barWidth?: number;
}

interface MoodChartProps {
  data?: MoodData[];
  title?: string;
  maxValue?: number;
  barWidth?: number;
  spacing?: number;
  containerStyle?: ViewStyle;
  chartStyle?: ViewStyle;
  titleStyle?: TextStyle;
  showGrid?: boolean;
  showYAxisLabels?: boolean;
  showXAxisLabels?: boolean;
  animated?: boolean;
  gradientEnabled?: boolean;
}

const MoodChart: React.FC<MoodChartProps> = ({
  data,
  title,
  maxValue = 5,
  barWidth = wp(9),
  spacing = wp(6),
  containerStyle,
  chartStyle,
  titleStyle,
  showGrid = false,
  showYAxisLabels = true,
  showXAxisLabels = false,
  animated = true,
  gradientEnabled = true,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();

  const defaultMoods = ['happy', 'neutral', 'sad', 'anxious', 'mad'];
  const chartData: MoodData[] = (data && data.length > 0) ? data : defaultMoods.map(m => ({ label: m, value: 0 })) as MoodData[];

  // Calculate dynamic maxValue based on data
  const maxDataValue = chartData.length > 0
    ? Math.max(...chartData.map(item => item.value))
    : 0;

  let dynamicMaxValue = 5;
  if (maxDataValue > 5 && maxDataValue <= 10) {
    dynamicMaxValue = 10;
  } else if (maxDataValue > 10) {
    // Round up to the next multiple of 5
    dynamicMaxValue = Math.ceil(maxDataValue / 5) * 5;
  }

  const moodLabelMap: Record<string, string> = {
    happy: t('VenterHome.moods.happy'),
    neutral: t('VenterHome.moods.neutral'),
    sad: t('VenterHome.moods.sad'),
    anxious: t('VenterHome.moods.anxious'),
    mad: t('VenterHome.moods.mad'),
  };

  // Apply consistent styling to chart data
  const styledData = chartData.map((item) => ({
    ...item,
    label: moodLabelMap[item.label.toLowerCase()] || item.label,
    frontColor: theme.green + "95",
    gradientColor: gradientEnabled ? (item.gradientColor || theme.white60) : undefined,
    spacing: item.spacing || spacing,
    barWidth: item.barWidth || barWidth,

    labelWidth: barWidth,
    labelTextStyle: {
      color: theme.white + "99",
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.6),
      textAlign: 'center' as const,
      ...(item.labelTextStyle || {}),
    },
    topLabelComponent: () => {
      if (item.value === 0) return null;
      return (
        <Text style={{
          color: theme.white,
          fontFamily: fontFamilies.medium,
          fontSize: hp(1.4),
          marginBottom: hp(-2.5), // Position inside the bar
        }}>
          {item.value}
        </Text>
      );
    },
  }));

  const styles = StyleSheet.create({
    container: {
      width: '100%',
    },
    chartWrapper: {
      padding: wp(4),
      alignItems: 'center',
      backgroundColor: theme.black + "40"
    },
    title: {
      fontFamily: fontFamilies.medium,
      fontSize: hp(1.8),
      color: theme.white,
      marginBottom: hp(2),
    },
    chartContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
    },
  });

  const yAxisLabels = Array.from({ length: 6 }, (_, i) =>
    Math.round((dynamicMaxValue / 5) * i).toString()
  );

  return (
    <View style={[styles.container, containerStyle]}>
      <GlassWrapper bordered
        glassStyles={styles.chartWrapper}
      >
        {title && (
          <Text style={[styles.title, titleStyle]}>
            {title}
          </Text>
        )}

        <View style={styles.chartContainer}>
          <BarChart
            key={styledData.map(item => item.value).join('-')}
            data={styledData}
            width={wp(75)}
            height={hp(20)}
            maxValue={dynamicMaxValue}
            noOfSections={5}
            yAxisLabelTexts={yAxisLabels}
            barWidth={barWidth}
            // spacing={spacing}
            roundedTop
            // roundedBottom
            isAnimated={animated}
            animationDuration={1000}

            // Y-axis styling
            hideYAxisText={!showYAxisLabels}
            yAxisThickness={0}
            xAxisColor={theme.white + "30"}
            yAxisTextStyle={{
              color: theme.white + "99",
              fontFamily: fontFamilies.medium,
              fontSize: hp(1.6),
            }}
            rulesColor={theme.white + "30"}
            rulesType="solid"

            // Chart background
            backgroundColor="transparent"
          />
        </View>
      </GlassWrapper>
    </View>
  );
};

export default MoodChart;