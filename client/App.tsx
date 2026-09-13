import { useState } from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { BudgetScreen } from './src/features/budget';
import { CategoriesScreen } from './src/features/categories';
import { ReportsScreen } from './src/features/reports';
import { TransactionsScreen } from './src/features/transactions';
import { colors, spacing } from './src/features/shared';

const modules = [
  { key: 'transactions', label: 'Transactions', icon: '≡' },
  { key: 'categories', label: 'Categories', icon: '▤' },
  { key: 'budget', label: 'Budgets', icon: '▣' },
  { key: 'reports', label: 'Reports', icon: '▧' },
] as const;

type ModuleKey = (typeof modules)[number]['key'];

export default function App() {
  const [activeModule, setActiveModule] = useState<ModuleKey>('transactions');
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.app}>
        {isMobile ? (
          <>
            <View style={styles.mobileHeader}>
              <View style={styles.mobileBrandMark}><Text style={styles.mobileBrandMarkText}>P</Text></View>
              <Text style={styles.mobileBrand}>PFMS</Text>
            </View>
            <View style={styles.mobileContent}>{renderModule(activeModule)}</View>
            <View style={styles.bottomNavigation}>
              {modules.map((module) => {
                const isActive = activeModule === module.key;
                return (
                  <Pressable
                    key={module.key}
                    accessibilityRole="button"
                    accessibilityLabel={module.label}
                    accessibilityState={{ selected: isActive }}
                    onPress={() => setActiveModule(module.key)}
                    style={({ pressed }) => [
                      styles.bottomNavItem,
                      isActive && styles.bottomNavItemActive,
                      pressed && styles.navItemPressed,
                    ]}
                  >
                    <View style={[styles.bottomNavIconWrap, isActive && styles.bottomNavIconWrapActive]}>
                      <Text style={[styles.bottomNavIcon, isActive && styles.bottomNavIconActive]}>{module.icon}</Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </>
        ) : (
          <>
            <View style={styles.sidebar}>
              <View style={styles.brandBlock}>
                <Text style={styles.brand}>PFMS</Text>
                <Text style={styles.brandSubtitle}>Personal finance</Text>
              </View>
              <View style={styles.navigation}>
                {modules.map((module) => {
                  const isActive = activeModule === module.key;
                  return (
                    <Pressable
                      key={module.key}
                      accessibilityRole="button"
                      accessibilityState={{ selected: isActive }}
                      onPress={() => setActiveModule(module.key)}
                      style={({ pressed }) => [
                        styles.navItem,
                        isActive && styles.navItemActive,
                        pressed && styles.navItemPressed,
                      ]}
                    >
                      <Text style={[styles.navIcon, isActive && styles.navIconActive]}>{module.icon}</Text>
                      <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>{module.label}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
            <View style={styles.content}>{renderModule(activeModule)}</View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

function renderModule(activeModule: ModuleKey) {
  switch (activeModule) {
    case 'categories':
      return <CategoriesScreen />;
    case 'budget':
      return <BudgetScreen />;
    case 'reports':
      return <ReportsScreen />;
    case 'transactions':
    default:
      return <TransactionsScreen />;
  }
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  app: { flex: 1, flexDirection: 'row' },
  sidebar: {
    width: 224,
    backgroundColor: colors.white,
    borderRightColor: colors.border,
    borderRightWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.lg,
  },
  brandBlock: { paddingHorizontal: spacing.sm, paddingBottom: spacing.xl },
  brand: { color: colors.text, fontSize: 22, fontWeight: '800', letterSpacing: 1 },
  brandSubtitle: { color: colors.mutedText, fontSize: 12, marginTop: 4 },
  navigation: { gap: 4 },
  navItem: {
    alignItems: 'center',
    borderRadius: spacing.sm,
    flexDirection: 'row',
    minHeight: 44,
    paddingHorizontal: spacing.md,
  },
  navItemActive: { backgroundColor: '#EAF4FF' },
  navItemPressed: { opacity: 0.75 },
  navIcon: {
    color: '#7B8794',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 18,
    marginRight: spacing.sm,
    textAlign: 'center',
    width: 18,
  },
  navIconActive: { color: colors.primary },
  navLabel: { color: '#52606D', fontSize: 14, fontWeight: '600' },
  navLabelActive: { color: colors.primary },
  content: { flex: 1, minWidth: 0 },
  mobileHeader: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    height: 56,
    paddingHorizontal: spacing.md,
  },
  mobileBrandMark: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 5,
    height: 24,
    justifyContent: 'center',
    marginRight: spacing.sm,
    width: 24,
  },
  mobileBrandMarkText: { color: colors.white, fontSize: 14, fontWeight: '800' },
  mobileBrand: { color: colors.text, fontSize: 16, fontWeight: '800' },
  mobileContent: { flex: 1, minHeight: 0 },
  bottomNavigation: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 62,
    paddingHorizontal: 6,
    paddingTop: 5,
  },
  bottomNavItem: {
    alignItems: 'center',
    borderRadius: 8,
    flex: 1,
    justifyContent: 'center',
    minHeight: 52,
    minWidth: 0,
  },
  bottomNavItemActive: { backgroundColor: 'transparent' },
  bottomNavIconWrap: {
    alignItems: 'center',
    borderRadius: 10,
    height: 38,
    justifyContent: 'center',
    width: '80%',
    maxWidth: 52,
    minWidth: 40,
  },
  bottomNavIconWrapActive: { backgroundColor: '#EAF4FF' },
  bottomNavIcon: { color: '#7B8794', fontSize: 22, fontWeight: '700', lineHeight: 26 },
  bottomNavIconActive: { color: colors.primary },
});
