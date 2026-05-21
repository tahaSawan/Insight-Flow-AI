import { Platform, type ViewStyle } from 'react-native';

export type NativeShadow = {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation?: number;
};

function shadowColorToRgba(color: string, opacity: number): string {
  const trimmed = color.trim();
  if (trimmed.startsWith('#')) {
    const hex = trimmed.slice(1);
    const full =
      hex.length === 3 ? hex.split('').map((c) => c + c).join('') : hex.slice(0, 6);
    const n = parseInt(full, 16);
    const r = (n >> 16) & 255;
    const g = (n >> 8) & 255;
    const b = n & 255;
    return `rgba(${r},${g},${b},${opacity})`;
  }
  const rgb = trimmed.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (rgb) {
    return `rgba(${rgb[1]},${rgb[2]},${rgb[3]},${opacity})`;
  }
  return `rgba(0,0,0,${opacity})`;
}

/** Native shadow props on iOS/Android; `boxShadow` on web (avoids RN Web deprecation warnings). */
export function platformShadow(shadow: NativeShadow): ViewStyle {
  if (Platform.OS !== 'web') {
    return shadow;
  }
  const { shadowColor, shadowOffset, shadowOpacity, shadowRadius } = shadow;
  const rgba = shadowColorToRgba(shadowColor, shadowOpacity);
  const { width, height } = shadowOffset;
  return {
    boxShadow: `${width}px ${height}px ${shadowRadius}px ${rgba}`,
  };
}
