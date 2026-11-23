import { Theme } from '../theme/types';

/**
 * Convert hex color to rgba format
 */
export const hexToRgba = (hex: string, alpha: number) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

/**
 * Get glass effect colors based on theme
 * These can be used consistently across all components
 */
export const getGlassColors = (theme: Theme, isDark: boolean) => {
  return {
    // Glass base backgrounds (darker, more solid for buttons)
    glassBase: hexToRgba(theme.white, 0.08),
    glassBaseSolid: isDark 
      ? hexToRgba(theme.surface, 0.8) 
      : hexToRgba(theme.surface, 0.6),
    
    // Glass borders
    glassBorder: hexToRgba(theme.white, 0.2),
    glassBorderLight: hexToRgba(theme.white, 0.35),
    glassBorderHighlight: hexToRgba(theme.white, 0.6),
    
    // Border highlights (for top and left edges)
    borderHighlightTop: hexToRgba(theme.white, 0.8),
    borderHighlightLeft: hexToRgba(theme.white, 0.8),
    
    // Inner glass layers
    glassInner: hexToRgba(theme.white, 0.03),
    
    // Highlights and overlays
    glassHighlight: hexToRgba(theme.white, 0.15),
    glassHighlightStrong: hexToRgba(theme.white, 0.25),
    
    // Icons and tints
    glassIconTint: hexToRgba(theme.white, 0.7),
    
    // Text and placeholders
    glassPlaceholder: hexToRgba(theme.white, 0.5),
    
    // Selected/active states
    glassSelected: hexToRgba(theme.white, 0.1),
    
    // Modal backgrounds
    glassModal: hexToRgba(theme.surface, 0.95),
  };
};
