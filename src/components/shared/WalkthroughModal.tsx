/**
 * WalkthroughModal
 * First-use in-app walkthrough shown once per user after login.
 * Renders a full-screen overlay with step cards, pagination dots,
 * and Next / Done navigation. Dismissed via AsyncStorage flag.
 */
import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { hp, wp } from '../../utils/size';
import { fontFamilies } from '../../utils/fontFamilies';
import { useTheme } from '../../theme';
import GlassWrapper from '../GlassWrapper';

export interface WalkthroughStep {
  emoji: string;
  title: string;
  body: string;
}

interface WalkthroughModalProps {
  visible: boolean;
  steps: WalkthroughStep[];
  onDone: () => void;
}

const WalkthroughModal: React.FC<WalkthroughModalProps> = ({ visible, steps, onDone }) => {
  const { theme } = useTheme();
  const [index, setIndex] = useState(0);
  const isLast = index === steps.length - 1;
  const step = steps[index];

  const handleNext = () => {
    if (isLast) {
      setIndex(0);
      onDone();
    } else {
      setIndex(prev => prev + 1);
    }
  };

  const handleSkip = () => {
    setIndex(0);
    onDone();
  };

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.75)',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: wp(5),
    },
    card: {
      width: '100%',
      paddingVertical: hp(4),
      paddingHorizontal: wp(5),
      alignItems: 'center',
    },
    emoji: {
      fontSize: hp(5),
      marginBottom: hp(2),
    },
    stepCounter: {
      color: 'rgba(170,120,255,0.8)',
      fontSize: hp(1.3),
      fontFamily: fontFamilies.semiBold,
      letterSpacing: 1.5,
      textTransform: 'uppercase',
      marginBottom: hp(1.5),
    },
    title: {
      color: theme.white,
      fontSize: hp(2.4),
      fontFamily: fontFamilies.bold,
      textAlign: 'center',
      marginBottom: hp(1.5),
    },
    body: {
      color: 'rgba(255,255,255,0.65)',
      fontSize: hp(1.7),
      fontFamily: fontFamilies.normal,
      textAlign: 'center',
      lineHeight: hp(2.6),
      marginBottom: hp(3.5),
    },
    dotsRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: wp(2),
      marginBottom: hp(3),
    },
    dot: {
      width: hp(0.8),
      height: hp(0.8),
      borderRadius: hp(0.4),
    },
    nextButton: {
      width: '100%',
      paddingVertical: hp(1.8),
      borderRadius: hp(1.5),
      alignItems: 'center',
      backgroundColor: 'rgba(136,80,255,0.3)',
      borderWidth: 0.5,
      borderColor: 'rgba(170,120,255,0.5)',
      marginBottom: hp(1.5),
    },
    nextText: {
      color: theme.white,
      fontSize: hp(1.9),
      fontFamily: fontFamilies.semiBold,
    },
    skipButton: {
      paddingVertical: hp(0.8),
    },
    skipText: {
      color: 'rgba(255,255,255,0.3)',
      fontSize: hp(1.5),
      fontFamily: fontFamilies.normal,
    },
  });

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View style={styles.overlay}>
        <GlassWrapper
          bordered
          glassStyles={{ backgroundColor: 'rgba(20,10,40,0.85)' }}
          style={styles.card}
        >
          <Text style={styles.emoji}>{step.emoji}</Text>
          <Text style={styles.stepCounter}>
            {index + 1} of {steps.length}
          </Text>
          <Text style={styles.title}>{step.title}</Text>
          <Text style={styles.body}>{step.body}</Text>

          {/* Pagination dots */}
          <View style={styles.dotsRow}>
            {steps.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  {
                    backgroundColor:
                      i === index ? 'rgba(170,120,255,1)' : 'rgba(255,255,255,0.2)',
                    width: i === index ? hp(2) : hp(0.8),
                  },
                ]}
              />
            ))}
          </View>

          <TouchableOpacity style={styles.nextButton} onPress={handleNext} activeOpacity={0.75}>
            <Text style={styles.nextText}>{isLast ? 'Get started →' : 'Next'}</Text>
          </TouchableOpacity>

          {!isLast && (
            <TouchableOpacity style={styles.skipButton} onPress={handleSkip} activeOpacity={0.7}>
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
          )}
        </GlassWrapper>
      </View>
    </Modal>
  );
};

export default WalkthroughModal;
