import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { hp, WINDOW_WIDTH, wp } from '../../utils/size';
import { fontFamilies } from '../../utils/fontFamilies';
import { useTheme } from '../../theme';
import GlassWrapper from '../GlassWrapper';

interface MoodOption {
  id: string;
  icon: any;
  label: string;
}

interface MoodSelectorProps {
  moodOptions: MoodOption[];
  selectedMood: string | null;
  onMoodSelect: (moodId: string) => void;
  title?: string;
  containerStyle?: any;
}

const MoodSelector: React.FC<MoodSelectorProps> = ({
  moodOptions,
  selectedMood,
  onMoodSelect,
  title = "How are you feeling today?",
  containerStyle,
}) => {
  const { theme } = useTheme();

  const handleMoodSelect = (moodId: string) => {
    // If the same mood is selected again, deselect it
    if (selectedMood === moodId) {
      onMoodSelect(''); // Pass empty string to deselect
    } else {
      onMoodSelect(moodId); // Select the new mood
    }
  };

  const styles = StyleSheet.create({
    container: {
      width: '100%',
    },
    title: {
      fontFamily: fontFamilies.medium,
      fontSize: hp(2),
      color: theme.white,
      textAlign: 'center',
      marginBottom: hp(3),
    },
    moodGrid: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: wp(1),
      marginBottom: hp(2)
    },
    moodItem: {
      flex: 1,
      height: hp(8.5),
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: hp(.1),
      borderColor: theme.white60,
      borderRadius: hp(1.4),
    },
    moodContent: {
      padding: hp(0.3),
      alignItems: 'center',
      width: '100%',
      height: '100%',
      justifyContent: 'center',
    },
    moodIcon: {
      width: hp(3),
      height: hp(3),
      marginBottom: hp(0.5),
      tintColor: theme.white,
    },
    moodLabel: {
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.4),
      color: theme.white,
      textAlign: 'center',
    },
  });

  const getMoodStyles = (moodId: string) => {
    if (selectedMood !== moodId) return {};

    switch (moodId) {
      case 'happy':
        return { bg: theme.moodHappyBG, text: theme.moodHappyText };
      case 'neutral':
        return { bg: theme.moodNeutralBG, text: theme.moodNeutralText };
      case 'sad':
        return { bg: theme.moodSadBG, text: theme.moodSadText };
      case 'anxious':
        return { bg: theme.moodAnxiousBG, text: theme.moodAnxiousText };
      case 'mad':
        return { bg: theme.moodMadBG, text: theme.moodMadText };
      default:
        return { bg: '#D1F2E2', text: theme.green };
    }
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {title && <Text style={styles.title}>{title}</Text>}
      <View style={styles.moodGrid}>
        {moodOptions.map((mood) => {
          const moodStyles = getMoodStyles(mood.id);
          const isSelected = selectedMood === mood.id;

          return (
            <TouchableOpacity
              key={mood.id}
              style={[
                styles.moodItem,
                isSelected && {
                  backgroundColor: moodStyles.bg,
                  borderColor: moodStyles.bg,
                },
              ]}
              onPress={() => handleMoodSelect(mood.id)}
            >
              <View style={styles.moodContent}>
                <Image
                  source={mood.icon}
                  style={[
                    styles.moodIcon,
                    isSelected && { tintColor: moodStyles.text },
                  ]}
                />
                <Text
                  style={[
                    styles.moodLabel,
                    isSelected && { color: moodStyles.text },
                  ]}
                >
                  {mood.label}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default MoodSelector;