import { StyleSheet, ViewStyle } from 'react-native';

/**
 * Glassmorphism style presets
 * Use these styles on any View component to create glass effects
 */
export const glassStyles = StyleSheet.create({
  // Base glass effect - most commonly used
  glass: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },

  // Light glass - more transparent
  glassLight: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
  },

  // Dark glass - less transparent
  glassDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
  },

  // Frosted glass - more opaque
  glassFrosted: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },

  // Subtle glass - very transparent
  glassSubtle: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },

  // Glass with shadow - includes elevation
  glassWithShadow: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },

  // Rounded glass - with border radius
  glassRounded: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 20,
  },

  // Button glass - optimized for buttons
  glassButton: {
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },

  // Card glass - for containers
  glassCard: {
    // backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },

  // Input glass - for text inputs
  glassInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
  },

  // Header glass - for top bars
  glassHeader: {
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.25)',
  },
});

/**
 * Dark mode glass styles
 * Use these on dark backgrounds
 */
export const darkGlassStyles = StyleSheet.create({
  glass: {
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },

  glassLight: {
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },

  glassDark: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },

  glassButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
  },
});

/**
 * Custom glass style generator
 * Create your own glass effect with custom parameters
 */
export const createGlassStyle = (options: {
  opacity?: number;
  borderOpacity?: number;
  borderWidth?: number;
  borderRadius?: number;
  shadowEnabled?: boolean;
  dark?: boolean;
}): ViewStyle => {
  const {
    opacity = 0.15,
    borderOpacity = 0.25,
    borderWidth = 1,
    borderRadius = 0,
    shadowEnabled = false,
    dark = false,
  } = options;

  const baseColor = dark ? '0, 0, 0' : '255, 255, 255';
  const borderColor = dark ? '255, 255, 255' : '255, 255, 255';

  const style: ViewStyle = {
    backgroundColor: `rgba(${baseColor}, ${opacity})`,
    borderWidth,
    borderColor: `rgba(${borderColor}, ${borderOpacity})`,
  };

  if (borderRadius > 0) {
    style.borderRadius = borderRadius;
  }

  if (shadowEnabled) {
    style.shadowColor = '#000';
    style.shadowOffset = { width: 0, height: 8 };
    style.shadowOpacity = 0.3;
    style.shadowRadius = 16;
    style.elevation = 8;
  }

  return style;
};