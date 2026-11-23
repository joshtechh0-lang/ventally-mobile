import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Theme } from './types';

const lightTheme: Theme = {
  primary: '#007AFF',
  secondary: '#5856D6',
  background: '#FFFFFF',
  surface: '#F2F2F7',
  text: '#000000',
  textSecondary: '#8E8E93',
  border: '#C6C6C8',
  red: "#FF5757",
  error: '#FF3B30',
  success: '#34C759',
  white: '#FFFFFF',
  white20: '#FFFFFF20',
  white60: '#FFFFFF60',
  white10: '#FFFFFF10',
  white05: '#FFFFFF05',
  yellow: "#D1AC8D",
  black: '#000000',
  green: '#204845',
  magenda: "#C2AEBF",
  optionsBg: "gray",
  overlay: 'rgba(0,0,0,0.3)',
  chart1: '#2D3282',
  chart2: '#4E54C8',
  chart3: '#6A1B9A',
  chart4: '#9575CD',
  moodHappyBG: '#CFEDE3',
  moodHappyText: '#68BDA1',
  moodNeutralBG: '#E7EEF4',
  moodNeutralText: '#75BFFF',
  moodSadBG: '#DCE8FF',
  moodSadText: '#85AFFF',
  moodAnxiousBG: '#FFF4CC',
  moodAnxiousText: '#FFD746',
  moodMadBG: '#FFD6D6',
  moodMadText: '#EA7B7B',

  selectedOption: "#C6B2C4",
};

const darkTheme: Theme = {

  primary: '#0A84FF',
  secondary: '#5E5CE6',
  background: '#000000',
  surface: '#1C1C1E',
  text: '#FFFFFF',
  textSecondary: '#8E8E93',
  border: '#38383A',
  red: "#FF5757",

  error: '#FF453A',
  success: '#32D74B',
  white: '#FFFFFF',
  white20: '#FFFFFF20',
  white60: '#FFFFFF60',
  white10: '#FFFFFF10',
  white05: '#FFFFFF05',
  yellow: "#D1AC8D",

  black: '#000000',
  green: '#204845',
  magenda: "#C2AEBF",
  optionsBg: "gray",
  overlay: "rgba(0,0,0,0.6)",
  chart1: '#2D3282',
  chart2: '#4E54C8',
  chart3: '#6A1B9A',
  chart4: '#9575CD',
  moodHappyBG: '#CFEDE3',
  moodHappyText: '#68BDA1',
  moodNeutralBG: '#E7EEF4',
  moodNeutralText: '#75BFFF',
  moodSadBG: '#DCE8FF',
  moodSadText: '#85AFFF',
  moodAnxiousBG: '#FFF4CC',
  moodAnxiousText: '#FFD746',
  moodMadBG: '#FFD6D6',
  moodMadText: '#EA7B7B',
  selectedOption: "#C6B2C4",

};

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  toggleTheme: (value?: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [isDark, setIsDark] = useState(systemColorScheme === 'dark');
  const [hasUserPreference, setHasUserPreference] = useState(false);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const stored = await AsyncStorage.getItem('theme:isDark');
        if (!isMounted) return;

        if (stored === 'true' || stored === 'false') {
          setIsDark(stored === 'true');
          setHasUserPreference(true);
        }
      } catch {
        // ignore
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (hasUserPreference) return;
    setIsDark(systemColorScheme === 'dark');
  }, [systemColorScheme, hasUserPreference]);

  const toggleTheme = (value?: boolean) => {
    const next = typeof value === 'boolean' ? value : !isDark;
    setIsDark(next);
    setHasUserPreference(true);
    AsyncStorage.setItem('theme:isDark', String(next)).catch(() => {
      // ignore
    });
  };

  const theme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};


