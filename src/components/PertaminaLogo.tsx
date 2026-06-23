import { Image, StyleSheet, Text, View } from 'react-native';

type PertaminaLogoProps = {
  size?: 'sm' | 'md' | 'lg';
  compact?: boolean;
  align?: 'start' | 'end';
  framed?: boolean;
};

export function PertaminaLogo({
  size = 'md',
  compact = false,
  align = 'start',
  framed = true,
}: PertaminaLogoProps) {
  const dims = sizeDims[size];

  return (
    <View
      style={[
        styles.wrap,
        !framed && styles.transparentWrap,
        align === 'end' ? styles.wrapEnd : styles.wrapStart,
        compact ? styles.compactWrap : null,
        dims.wrap,
      ]}
    >
      <Image
        source={require('../../assets/pertamina-mark-cutout.png')}
        resizeMode="contain"
        style={[styles.mark, framed ? dims.mark : dims.heroMark]}
      />
      <View style={[styles.wordmark, framed ? dims.wordmark : dims.heroWordmark]}>
        <Text numberOfLines={1} style={[styles.brandText, framed ? dims.brandText : dims.heroBrandText]}>
          PERTAMINA
        </Text>
        <Text numberOfLines={1} style={[styles.subBrandText, framed ? dims.subBrandText : dims.heroSubBrandText]}>
          PERTA ARUN GAS
        </Text>
      </View>
    </View>
  );
}

const sizeDims = {
  sm: {
    wrap: { paddingHorizontal: 14, paddingVertical: 10 },
    mark: { height: 30, width: 30 },
    wordmark: { marginLeft: 8 },
    brandText: { fontSize: 12.5, letterSpacing: -0.3 },
    subBrandText: { fontSize: 10.5, letterSpacing: 0.8 },
    heroMark: { height: 34, width: 34 },
    heroWordmark: { marginLeft: 10 },
    heroBrandText: { fontSize: 15.5, letterSpacing: -0.4 },
    heroSubBrandText: { fontSize: 12.2, letterSpacing: 1.1 },
  },
  md: {
    wrap: { paddingHorizontal: 16, paddingVertical: 12 },
    mark: { height: 36, width: 36 },
    wordmark: { marginLeft: 10 },
    brandText: { fontSize: 14.5, letterSpacing: -0.5 },
    subBrandText: { fontSize: 12, letterSpacing: 1 },
    heroMark: { height: 40, width: 40 },
    heroWordmark: { marginLeft: 11 },
    heroBrandText: { fontSize: 17.5, letterSpacing: -0.55 },
    heroSubBrandText: { fontSize: 13.5, letterSpacing: 1.2 },
  },
  lg: {
    wrap: { paddingHorizontal: 18, paddingVertical: 13 },
    mark: { height: 42, width: 42 },
    wordmark: { marginLeft: 12 },
    brandText: { fontSize: 17, letterSpacing: -0.7 },
    subBrandText: { fontSize: 13.5, letterSpacing: 1.2 },
    heroMark: { height: 46, width: 46 },
    heroWordmark: { marginLeft: 12 },
    heroBrandText: { fontSize: 19, letterSpacing: -0.7 },
    heroSubBrandText: { fontSize: 14.5, letterSpacing: 1.4 },
  },
} as const;

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderColor: 'rgba(221,229,239,0.98)',
    borderRadius: 22,
    borderWidth: 1,
    flexDirection: 'row',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 2,
  },
  transparentWrap: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
  },
  wrapStart: {
    alignSelf: 'flex-start',
  },
  wrapEnd: {
    alignSelf: 'flex-end',
  },
  compactWrap: {
    borderRadius: 18,
    shadowOpacity: 0.06,
  },
  mark: {
    backgroundColor: 'transparent',
  },
  wordmark: {
    flexDirection: 'column',
    justifyContent: 'center',
    minWidth: 0,
  },
  brandText: {
    color: '#202733',
    fontWeight: '900',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  subBrandText: {
    color: '#EA2135',
    fontWeight: '800',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
});
