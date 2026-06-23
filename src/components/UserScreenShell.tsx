import { PropsWithChildren, type ReactNode } from 'react';
import {
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { PertaminaLogo } from './PertaminaLogo';

type UserScreenShellProps = PropsWithChildren<{
  title: string;
  subtitle?: string;
  left?: ReactNode;
  right?: ReactNode;
  scrollable?: boolean;
}>;

export function UserScreenShell({ title, subtitle, left, right, scrollable = true, children }: UserScreenShellProps) {
  const { height } = useWindowDimensions();

  return (
    <ImageBackground
      source={require('../../assets/login-background-pag.png')}
      resizeMode="cover"
      style={styles.flex}
    >
      <View style={styles.overlay} />
      <LinearGradient
        colors={['rgba(255,255,255,0.78)', 'rgba(248,249,251,0.92)', 'rgba(242,244,247,0.98)']}
        style={StyleSheet.absoluteFill}
      />
      <View pointerEvents="none" style={styles.decorWrap}>
        <View style={styles.decorBlue} />
        <View style={styles.decorGreen} />
        <View style={styles.decorRed} />
      </View>

      {scrollable ? (
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[styles.content, { minHeight: height }]}
        >
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              {left ? <View style={styles.left}>{left}</View> : null}
              <PertaminaLogo size="sm" framed={false} />
            </View>
            {right ? <View style={styles.right}>{right}</View> : null}
          </View>

          {title.trim() ? (
            <View style={styles.titleWrap}>
              <Text selectable style={styles.title}>
                {title}
              </Text>
              {subtitle ? (
                <Text selectable style={styles.subtitle}>
                  {subtitle}
                </Text>
              ) : null}
            </View>
          ) : null}

          {children}
        </ScrollView>
      ) : (
        <View style={[styles.content, styles.contentNoScroll, { minHeight: height }]}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              {left ? <View style={styles.left}>{left}</View> : null}
              <PertaminaLogo size="sm" framed={false} />
            </View>
            {right ? <View style={styles.right}>{right}</View> : null}
          </View>

          {title.trim() ? (
            <View style={styles.titleWrap}>
              <Text selectable style={styles.title}>
                {title}
              </Text>
              {subtitle ? (
                <Text selectable style={styles.subtitle}>
                  {subtitle}
                </Text>
              ) : null}
            </View>
          ) : null}

          <View style={styles.bodyNoScroll}>{children}</View>
        </View>
      )}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: '#FAFBFC',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.72)',
  },
  decorWrap: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  decorBlue: {
    backgroundColor: 'rgba(128,144,166,0.07)',
    borderRadius: 999,
    height: 232,
    right: -96,
    position: 'absolute',
    top: 92,
    width: 232,
  },
  decorGreen: {
    backgroundColor: 'rgba(148,163,184,0.05)',
    borderRadius: 999,
    bottom: 100,
    height: 176,
    left: -64,
    position: 'absolute',
    width: 176,
  },
  decorRed: {
    backgroundColor: 'rgba(203,213,225,0.06)',
    borderRadius: 999,
    bottom: 84,
    height: 184,
    position: 'absolute',
    right: -80,
    width: 184,
  },
  content: {
    flexGrow: 1,
    gap: 18,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 168,
  },
  contentNoScroll: {
    flex: 1,
    gap: 14,
    paddingBottom: 18,
  },
  bodyNoScroll: {
    flex: 1,
    gap: 10,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerLeft: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    flex: 1,
    minWidth: 0,
  },
  left: {
    flexShrink: 0,
  },
  right: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleWrap: {
    gap: 8,
    paddingTop: 4,
  },
  title: {
    color: '#173260',
    fontSize: 29,
    fontWeight: '900',
    letterSpacing: -1,
    lineHeight: 32,
  },
  subtitle: {
    color: '#5E6A80',
    fontSize: 13.5,
    fontWeight: '600',
    lineHeight: 19,
  },
});
