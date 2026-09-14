import React, { useState } from 'react';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import DashboardScreen from '../screens/Dashboard';
import IncomeScreen from '../screens/Income';
import ExpenseScreen from '../screens/Expense';
import NotificationsScreen from '../screens/Notifications';
import ProfileScreen from '../screens/Profile';
import SettingsScreen from '../screens/Settings';
import { TransactionsScreen } from '../features/transactions';
import { ReportsScreen } from '../features/reports';
import { BudgetScreen } from '../features/budget';
import { CategoriesScreen } from '../features/categories';
import { useFinance } from '../context/FinanceContext';
import { RootStackParamList } from '../types';
import { logout as apiLogout } from '../api';

type Page = 'Dashboard' | 'Income' | 'Expenses' | 'Notifications' | 'Profile' | 'Settings' | 'Transactions' | 'Reports' | 'Budgets' | 'Categories';
type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'Main'> };

const navItems: { page: Page; icon: string; label: string }[] = [
  { page: 'Dashboard',     icon: '▦', label: 'Dashboard' },
  { page: 'Transactions',  icon: '⇄', label: 'Transactions' },
  { page: 'Income',        icon: '↗', label: 'Income' },
  { page: 'Expenses',      icon: '↘', label: 'Expenses' },
  { page: 'Budgets',       icon: '▤', label: 'Budgets' },
  { page: 'Reports',       icon: '◈', label: 'Reports' },
  { page: 'Categories',    icon: '◉', label: 'Categories' },
  { page: 'Notifications', icon: '◌', label: 'Notifications' },
];

export default function MainShell({ navigation }: Props) {
  const [page, setPage] = useState<Page>('Dashboard');
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [search, setSearch] = useState('');
  const { user, notifications, theme } = useFinance();
  const mobile = useWindowDimensions().width < 600;
  const dark = theme === 'dark';

  const go = (nextPage: Page) => { setPage(nextPage); if (mobile) setDrawerOpen(false); };

  const handleLogout = async () => {
    await apiLogout();
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const content =
    page === 'Dashboard'    ? <DashboardScreen /> :
    page === 'Income'       ? <IncomeScreen /> :
    page === 'Expenses'     ? <ExpenseScreen /> :
    page === 'Transactions' ? <TransactionsScreen /> :
    page === 'Reports'      ? <ReportsScreen /> :
    page === 'Budgets'      ? <BudgetScreen /> :
    page === 'Categories'   ? <CategoriesScreen /> :
    page === 'Notifications'? <NotificationsScreen /> :
    page === 'Profile'      ? <ProfileScreen /> :
                              <SettingsScreen />;

  const sidebar = (
    <View style={[styles.sidebar, dark && styles.darkSurface, mobile && styles.mobileDrawer, !mobile && collapsed && styles.sidebarCollapsed]}>
      {/* Brand */}
      <View style={styles.brandRow}>
        <View style={styles.logo}><Text style={styles.logoText}>PF</Text></View>
        {(!collapsed || mobile) && (
          <View>
            <Text style={[styles.brand, dark && styles.darkText]}>PFMS</Text>
            <Text style={styles.brandSub}>Personal Finance</Text>
          </View>
        )}
      </View>

      {/* Main nav */}
      <View style={styles.nav}>
        {navItems.map((item) => (
          <TouchableOpacity key={item.page} onPress={() => go(item.page)}
            style={[styles.navItem, page === item.page && styles.navActive]}
            accessibilityLabel={item.label}>
            <View style={styles.navIconWrap}>
              <Text style={[styles.navIcon, page === item.page && styles.navIconActive]}>{item.icon}</Text>
              {item.page === 'Notifications' && unreadCount > 0 && (
                <View style={styles.navBadge}><Text style={styles.navBadgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text></View>
              )}
            </View>
            {(!collapsed || mobile) && (
              <Text style={[styles.navText, page === item.page && styles.navTextActive]}>{item.label}</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Bottom nav */}
      <View style={styles.bottomNav}>
        <TouchableOpacity onPress={() => go('Profile')} style={[styles.navItem, page === 'Profile' && styles.navActive]} accessibilityLabel="Profile">
          <Text style={[styles.navIcon, page === 'Profile' && styles.navIconActive]}>👤</Text>
          {(!collapsed || mobile) && <Text style={[styles.navText, page === 'Profile' && styles.navTextActive]}>Profile</Text>}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => go('Settings')} style={[styles.navItem, page === 'Settings' && styles.navActive]} accessibilityLabel="Settings">
          <Text style={[styles.navIcon, page === 'Settings' && styles.navIconActive]}>⚙</Text>
          {(!collapsed || mobile) && <Text style={[styles.navText, page === 'Settings' && styles.navTextActive]}>Settings</Text>}
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Logout */}
        <TouchableOpacity onPress={() => void handleLogout()} style={styles.logoutBtn} accessibilityLabel="Logout">
          <Text style={styles.logoutIcon}>↪</Text>
          {(!collapsed || mobile) && <Text style={styles.logoutText}>Logout</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.root, dark && styles.darkRoot]}>
      <View style={styles.app}>
        {/* Desktop sidebar */}
        {!mobile && sidebar}

        {/* Mobile drawer */}
        {mobile && drawerOpen && (
          <>
            <TouchableOpacity style={styles.drawerBackdrop} onPress={() => setDrawerOpen(false)} accessibilityLabel="Close menu" />
            <View style={styles.drawerLayer}>{sidebar}</View>
          </>
        )}

        {/* Main content */}
        <View style={styles.main}>
          {/* Header */}
          <View style={[styles.header, dark && styles.darkSurface, mobile && styles.mobileHeader]}>
            <View style={styles.headerLeft}>
              <TouchableOpacity
                onPress={() => mobile ? setDrawerOpen((v) => !v) : setCollapsed((v) => !v)}
                style={styles.menu} accessibilityLabel={mobile ? 'Open menu' : 'Toggle sidebar'}>
                <Text style={styles.menuText}>☰</Text>
              </TouchableOpacity>
              <Text style={[styles.pageTitle, dark && styles.darkText]}>{page}</Text>
            </View>

            <View style={styles.headerRight}>
              {/* Search — desktop only */}
              {!mobile && (
                <TextInput value={search} onChangeText={setSearch}
                  style={[styles.search, dark && styles.darkInput]}
                  placeholder="Search" placeholderTextColor="#94a3b8" />
              )}

              {/* Notifications bell — always visible */}
              <TouchableOpacity onPress={() => go('Notifications')} style={styles.bell} accessibilityLabel="Notifications">
                <Text style={styles.bellText}>🔔</Text>
                {unreadCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* Profile avatar + username */}
              <TouchableOpacity onPress={() => go('Profile')} style={styles.avatarBtn} accessibilityLabel="Profile">
                <View style={styles.userAvatar}>
                  <Text style={styles.userInitial}>{user.name ? user.name.charAt(0).toUpperCase() : '?'}</Text>
                </View>
                {!mobile && <Text style={[styles.userName, dark && styles.darkText]}>{user.name}</Text>}
              </TouchableOpacity>

              {/* Logout — always visible */}
              <TouchableOpacity onPress={() => void handleLogout()} style={styles.logoutHeaderBtn} accessibilityLabel="Logout">
                <Text style={styles.logoutHeaderIcon}>↪</Text>
                {!mobile && <Text style={styles.logoutHeaderText}>Logout</Text>}
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.body}>{content}</View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f5f6f8' },
  darkRoot: { backgroundColor: '#0f172a' },
  app: { flex: 1, flexDirection: 'row', position: 'relative' },

  // Sidebar
  sidebar: { width: 248, backgroundColor: '#fff', borderRightWidth: 1, borderRightColor: '#e6eaf0', paddingHorizontal: 18, paddingVertical: 24 },
  sidebarCollapsed: { width: 60, paddingHorizontal: 8, paddingVertical: 14 },
  mobileDrawer: { width: 268, height: '100%', borderRightWidth: 0, shadowColor: '#0f172a', shadowOpacity: 0.2, shadowRadius: 18, shadowOffset: { width: 8, height: 0 }, elevation: 12 },
  drawerLayer: { position: 'absolute', top: 0, bottom: 0, left: 0, zIndex: 20 },
  drawerBackdrop: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, zIndex: 10, backgroundColor: 'rgba(15,23,42,0.42)' },
  darkSurface: { backgroundColor: '#111c31', borderColor: '#263653' },

  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 8, marginBottom: 32 },
  logo: { width: 38, height: 38, borderRadius: 11, backgroundColor: '#14213d', alignItems: 'center', justifyContent: 'center' },
  logoText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  brand: { color: '#14213d', fontWeight: '900', fontSize: 17 },
  brandSub: { color: '#94a3b8', fontSize: 10, marginTop: 2 },

  nav: { gap: 4 },
  navItem: { flexDirection: 'row', alignItems: 'center', gap: 13, paddingVertical: 11, paddingHorizontal: 12, borderRadius: 9 },
  navActive: { backgroundColor: '#edf3ff' },
  navIconWrap: { position: 'relative', width: 22, alignItems: 'center' },
  navIcon: { color: '#64748b', fontSize: 17, textAlign: 'center' },
  navIconActive: { color: '#4f7cff' },
  navBadge: { position: 'absolute', top: -5, right: -8, backgroundColor: '#ef6b6b', borderRadius: 8, minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 },
  navBadgeText: { color: '#fff', fontSize: 9, fontWeight: '800' },
  navText: { color: '#64748b', fontSize: 13, fontWeight: '600' },
  navTextActive: { color: '#315dcc', fontWeight: '800' },

  bottomNav: { marginTop: 'auto', gap: 4 },
  divider: { height: 1, backgroundColor: '#e6eaf0', marginVertical: 8, marginHorizontal: 4 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', gap: 13, paddingVertical: 11, paddingHorizontal: 12, borderRadius: 9, backgroundColor: '#fff5f5' },
  logoutIcon: { color: '#ef4444', fontSize: 17, width: 22, textAlign: 'center' },
  logoutText: { color: '#ef4444', fontSize: 13, fontWeight: '700' },

  // Header
  main: { flex: 1, minWidth: 0 },
  header: { minHeight: 64, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e6eaf0', paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  mobileHeader: { minHeight: 56, paddingHorizontal: 12 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flexShrink: 1 },
  menu: { padding: 6 },
  menuText: { color: '#64748b', fontSize: 20 },
  pageTitle: { color: '#14213d', fontSize: 18, fontWeight: '800' },
  darkText: { color: '#f8fafc' },

  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  search: { width: 180, height: 36, backgroundColor: '#f5f6f8', borderRadius: 9, paddingHorizontal: 13, color: '#14213d', fontSize: 13 },
  darkInput: { backgroundColor: '#1e293b', color: '#f8fafc' },

  bell: { position: 'relative', padding: 6, borderRadius: 8 },
  bellText: { fontSize: 20 },
  badge: { position: 'absolute', top: 2, right: 2, backgroundColor: '#ef6b6b', borderRadius: 8, minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 },
  badgeText: { color: '#fff', fontSize: 9, fontWeight: '800' },

  avatarBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 6, paddingVertical: 4, borderRadius: 20, backgroundColor: '#f1f5f9' },
  userAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#dbe4ff', alignItems: 'center', justifyContent: 'center' },
  userInitial: { color: '#315dcc', fontWeight: '800', fontSize: 14 },
  userName: { color: '#334155', fontSize: 13, fontWeight: '700' },

  logoutHeaderBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 8, backgroundColor: '#fff5f5', borderWidth: 1, borderColor: '#fecaca' },
  logoutHeaderIcon: { color: '#ef4444', fontSize: 15, fontWeight: '800' },
  logoutHeaderText: { color: '#ef4444', fontSize: 13, fontWeight: '700' },

  mobileLogoutBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#fff5f5', alignItems: 'center', justifyContent: 'center' },
  mobileLogoutText: { color: '#ef4444', fontSize: 16, fontWeight: '800' },

  body: { flex: 1, minWidth: 0 },
});
