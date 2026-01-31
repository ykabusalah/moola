// ============================================
// THEME COLORS
// ============================================

/**
 * theme.js - Color themes and accent colors
 * Light/dark themes and 5 accent color options
 */

export const themes = {
  light: {
    bg: '#faf9f6',
    card: '#ffffff',
    text: '#2a251c',
    sub: '#8a8070',
    muted: '#e8e4dc',
    accent: '#2a251c',
    border: '#d4cfc4',
    soul: '#5a7c4a',
    soulDim: '#e8f0e4',
    void: '#2a251c',
    ink: '#3a3428',
  },
  dark: {
    bg: '#0f1114',
    card: '#181b20',
    text: '#e8e4dc',
    sub: '#6b7280',
    muted: '#2a2f38',
    accent: '#e8e4dc',
    border: '#3a3f4a',
    soul: '#4a9eff',
    soulDim: '#1a3a5c',
    void: '#050608',
    ink: '#e8e4dc',
  },
};

export const ACCENT_COLORS = [
  { id: 'sage', name: 'Sage', color: '#5a7c4a', dim: '#e8f0e4', darkColor: '#6b9b54', darkDim: '#1a2e14' },
  { id: 'ocean', name: 'Ocean', color: '#4a7c9b', dim: '#e4f0f4', darkColor: '#4a9eff', darkDim: '#1a3a5c' },
  { id: 'lavender', name: 'Lavender', color: '#7c5a8a', dim: '#f0e4f4', darkColor: '#a87cb8', darkDim: '#2e1a3a' },
  { id: 'ember', name: 'Ember', color: '#9b6a4a', dim: '#f4ece4', darkColor: '#d4956a', darkDim: '#3a2414' },
  { id: 'slate', name: 'Slate', color: '#5a6a7c', dim: '#e8ecf0', darkColor: '#8a9eb4', darkDim: '#1a2430' },
];
