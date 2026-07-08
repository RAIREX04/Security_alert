import { PropsWithChildren, type ReactNode } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { PertaminaLogo } from './PertaminaLogo';
import { ecrTheme } from '../theme/ecrTheme';

type UserScreenShellProps = PropsWithChildren<{
  title: string;
  subtitle?: string;
  left?: ReactNode;
  right?: ReactNode;
  scrollable?: boolean;
  compact?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
}>;

export function UserScreenShell({
  title,
  subtitle,
  left,
  right,
  scrollable = true,
  compact = false,
  refreshing = false,
  onRefresh,
  children,
}: UserScreenShellProps) {
  const { height } = useWindowDimensions();

  return (
    <View style={styles.flex}>
      {scrollable ? (
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[styles.content, compact && styles.contentCompact, { minHeight: height }]}
          refreshControl={
            onRefresh ? (
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={ecrTheme.colors.pertaminaBlue} />
            ) : undefined
          }
        >
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              {left ? <View style={styles.left}>{left}</View> : null}
              <View style={styles.logoPill}>
                <PertaminaLogo size="sm" framed={false} />
              </View>
            </View>
            {right ? <View style={styles.right}>{right}</View> : null}
          </View>

          {title.trim() ? (
            <View style={[styles.titleWrap, compact && styles.titleWrapCompact]}>
              <Text selectable style={[styles.title, compact && styles.titleCompact]}>
                {title}
              </Text>
              {subtitle ? (
                <Text selectable style={[styles.subtitle, compact && styles.subtitleCompact]}>
                  {subtitle}
                </Text>
              ) : null}
            </View>
          ) : null}

          {children}
        </ScrollView>
      ) : (
        <View style={[styles.content, compact && styles.contentCompact, styles.contentNoScroll, { minHeight: height }]}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              {left ? <View style={styles.left}>{left}</View> : null}
              <View style={styles.logoPill}>
                <PertaminaLogo size="sm" framed={false} />
              </View>
            </View>
            {right ? <View style={styles.right}>{right}</View> : null}
          </View>

          {title.trim() ? (
            <View style={[styles.titleWrap, compact && styles.titleWrapCompact]}>
              <Text selectable style={[styles.title, compact && styles.titleCompact]}>
                {title}
              </Text>
              {subtitle ? (
                <Text selectable style={[styles.subtitle, compact && styles.subtitleCompact]}>
                  {subtitle}
                </Text>
              ) : null}
            </View>
          ) : null}

          <View style={styles.bodyNoScroll}>{children}</View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: ecrTheme.colors.background,
  },
  content: {
    flexGrow: 1,
    gap: ecrTheme.spacing.md,
    paddingHorizontal: ecrTheme.spacing.screenX,
    paddingTop: 14,
    paddingBottom: ecrTheme.spacing.screenBottom,
  },
  contentCompact: {
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 12,
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
    paddingVertical: 4,
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
  logoPill: {
    alignItems: 'center',
    backgroundColor: ecrTheme.colors.surfaceRaised,
    borderColor: ecrTheme.colors.border,
    borderRadius: ecrTheme.radii.md,
    borderWidth: 1,
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 7,
    ...ecrTheme.shadows.soft,
  },
  right: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleWrap: {
    gap: 8,
    paddingTop: 4,
  },
  titleWrapCompact: {
    gap: 5,
    paddingTop: 0,
  },
  title: {
    color: ecrTheme.colors.deepNavy,
    fontSize: ecrTheme.typography.title.fontSize,
    fontWeight: '900',
    lineHeight: ecrTheme.typography.title.lineHeight,
  },
  titleCompact: {
    fontSize: ecrTheme.typography.titleCompact.fontSize,
    lineHeight: ecrTheme.typography.titleCompact.lineHeight,
  },
  subtitle: {
    color: ecrTheme.colors.textSecondary,
    fontSize: ecrTheme.typography.caption.fontSize,
    fontWeight: '600',
    lineHeight: ecrTheme.typography.caption.lineHeight,
  },
  subtitleCompact: {
    fontSize: 12,
    lineHeight: 18,
  },
});
