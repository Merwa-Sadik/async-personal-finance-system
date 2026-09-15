import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useFinance } from '../context/FinanceContext';
import { useNotifications } from '../context/NotificationContext';

const CHART_MONTHS = ((): { label: string; index: number }[] => {
  const now = new Date();
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    return { label: d.toLocaleString('default', { month: 'short' }), index: d.getMonth() };
  });
})();

const CHART_COLORS = ['#4f7cff', '#21b573', '#f59e0b', '#ef6b6b', '#8b7cf6', '#36a9c9'];

export default function DashboardScreen() {
  const { income, expenses, budgets, user } = useFinance();
  const { notifications } = useNotifications();
  const { width } = useWindowDimensions();
  const mobile = width < 600;
  const compact = width < 980;
  const [activeBar, setActiveBar] = useState<number | null>(null);

  const totalIncome = income.reduce((s, i) => s + i.amount, 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const totalBudget = budgets.reduce((s, b) => s + b.amount, 0);
  const balance = totalIncome - totalExpenses;
  const budgetRemaining = Math.max(totalBudget - totalExpenses, 0);
  const budgetRemainingPct = totalBudget ? Math.max(0, Math.round(((totalBudget - totalExpenses) / totalBudget) * 100)) : 0;

  const categories = Object.entries(
    expenses.reduce<Record<string, number>>((acc, e) => ({ ...acc, [e.category]: (acc[e.category] ?? 0) + e.amount }), {})
  ).sort((a, b) => b[1] - a[1]);

  const points = CHART_MONTHS.map(({ label, index: month }) => ({
    label,
    income: income.filter((i) => new Date(i.date).getMonth() === month).reduce((s, i) => s + i.amount, 0),
    expense: expenses.filter((e) => new Date(e.date).getMonth() === month).reduce((s, e) => s + e.amount, 0),
  }));
  const maxValue = Math.max(...points.flatMap((p) => [p.income, p.expense]), 1);

  const recent = [
    ...income.map((i) => ({ ...i, txType: 'Income' as const })),
    ...expenses.map((e) => ({ ...e, txType: 'Expense' as const })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

  const money = (v: number) => `${v.toLocaleString()} ETB`;
  const today = new Date().toLocaleDateString('default', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <ScrollView style={styles.page} contentContainerStyle={[styles.content, mobile && styles.mobileContent]}>

      {/* Welcome */}
      <View style={[styles.welcome, mobile && styles.mobileWelcome]}>
        <View style={styles.welcomeCopy}>
          <Text style={[styles.greeting, mobile && styles.mobileGreeting]}>
            Hello, {user.name ? user.name.split(' ')[0] : 'there'} 👋
          </Text>
          <Text style={styles.muted}>Here's your financial overview for today.</Text>
        </View>
        <View style={styles.dateBadge}>
          <Text style={styles.dateIcon}>▣</Text>
          <Text style={styles.dateText}>{today}</Text>
        </View>
      </View>

      {/* Summary cards */}
      <View style={styles.summaryGrid}>
        <SummaryCard title="Total Income"     value={money(totalIncome)}    detail={`${income.length} transaction${income.length === 1 ? '' : 's'}`}                                    color="#21b573" icon="↗" mobile={mobile} />
        <SummaryCard title="Total Expenses"   value={money(totalExpenses)}  detail={`${expenses.length} transaction${expenses.length === 1 ? '' : 's'}`}                                color="#ef6b6b" icon="↘" mobile={mobile} />
        <SummaryCard title="Current Balance"  value={money(balance)}        detail={totalIncome > 0 ? `${Math.round((totalExpenses / totalIncome) * 100)}% spent` : 'No income yet'}   color="#4f7cff" icon="◈" mobile={mobile} />
        <SummaryCard title="Budget Remaining" value={money(budgetRemaining)} detail={totalBudget ? `${budgetRemainingPct}% remaining` : 'No budgets set'}                               color="#f59e0b" icon="▣" mobile={mobile} />
      </View>

      {/* Charts row */}
      <View style={[styles.chartGrid, compact && styles.chartStack]}>

        {/* Bar chart */}
        <View style={[styles.card, styles.chartCard, compact && styles.fullCard]}>
          <Text style={styles.sectionTitle}>Income vs Expense</Text>
          <Text style={styles.sectionSubtitle}>Tap a month for details</Text>
          <View style={styles.legend}>
            <View style={styles.legendItem}><View style={[styles.dot, { backgroundColor: '#21b573' }]} /><Text style={styles.legendText}>Income</Text></View>
            <View style={styles.legendItem}><View style={[styles.dot, { backgroundColor: '#ef6b6b' }]} /><Text style={styles.legendText}>Expense</Text></View>
          </View>
          <View style={styles.chart}>
            {[0, 33, 66].map((top) => (
              <View key={top} style={[styles.gridLine, { top: `${top}%` as unknown as number }]} />
            ))}
            <View style={styles.bars}>
              {points.map((point, index) => (
                <Pressable
                  key={point.label}
                  style={styles.monthCol}
                  onPress={() => setActiveBar(activeBar === index ? null : index)}
                >
                  {activeBar === index && (
                    <View style={styles.tooltip}>
                      <Text style={styles.tooltipTitle}>{point.label}</Text>
                      <Text style={styles.tooltipIncome}>↗ {point.income.toLocaleString()} ETB</Text>
                      <Text style={styles.tooltipExpense}>↘ {point.expense.toLocaleString()} ETB</Text>
                    </View>
                  )}
                  <View style={styles.barPair}>
                    <View style={[styles.bar, { backgroundColor: '#21b573', height: `${Math.max((point.income / maxValue) * 100, 3)}%` as unknown as number }]} />
                    <View style={[styles.bar, { backgroundColor: '#ef6b6b', height: `${Math.max((point.expense / maxValue) * 100, 3)}%` as unknown as number }]} />
                  </View>
                  <Text style={styles.axisLabel}>{point.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>

        {/* Category donut */}
        <View style={[styles.card, styles.categoryCard, compact && styles.fullCard]}>
          <Text style={styles.sectionTitle}>Spending by Category</Text>
          <Text style={styles.sectionSubtitle}>Where your money goes</Text>
          <View style={styles.categoryBody}>
            <View style={styles.donut}>
              <View style={styles.donutHole}>
                <Text style={styles.donutTotal}>{totalExpenses.toLocaleString()}</Text>
                <Text style={styles.donutUnit}>ETB</Text>
              </View>
            </View>
            <View style={styles.categoryList}>
              {categories.length === 0
                ? <Text style={styles.emptyText}>No expenses yet</Text>
                : categories.slice(0, 6).map(([cat, amt], i) => (
                  <View key={cat} style={styles.categoryRow}>
                    <View style={styles.categoryName}>
                      <View style={[styles.dot, { backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }]} />
                      <Text style={styles.categoryText} numberOfLines={1}>{cat}</Text>
                    </View>
                    <Text style={styles.categoryAmount}>
                      {Math.round((amt / Math.max(totalExpenses, 1)) * 100)}% · {amt.toLocaleString()}
                    </Text>
                  </View>
                ))
              }
            </View>
          </View>
        </View>
      </View>

      {/* Alerts */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Alerts & Notifications</Text>
        <Text style={styles.sectionSubtitle}>Keep an eye on your finances</Text>
        <View style={styles.alerts}>
          {notifications.length === 0
            ? <Text style={styles.emptyText}>No alerts right now.</Text>
            : notifications.slice(0, 3).map((item) => (
              <View key={item.id} style={[
                styles.alert,
                item.type === 'warning' ? styles.alertWarning :
                item.type === 'exceeded' ? styles.alertDanger : styles.alertInfo,
              ]}>
                <View style={styles.alertIconWrap}>
                  <Text style={styles.alertIconText}>
                    {item.type === 'warning' ? '!' : item.type === 'exceeded' ? '×' : 'i'}
                  </Text>
                </View>
                <View style={styles.alertCopy}>
                  <Text style={styles.alertTitle}>{item.title}</Text>
                  <Text style={styles.alertMessage}>{item.message}</Text>
                </View>
              </View>
            ))
          }
        </View>
      </View>

      {/* Recent transactions */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        <Text style={styles.sectionSubtitle}>Your latest activity</Text>
        {recent.length === 0
          ? <Text style={[styles.emptyText, { marginTop: 12 }]}>No transactions yet.</Text>
          : recent.map((item) => (
            <View key={`${item.txType}-${item.id}`} style={[styles.txRow, mobile && styles.txRowMobile]}>
              <View style={[styles.txIcon, { backgroundColor: item.txType === 'Income' ? '#dcfce7' : '#fee2e2' }]}>
                <Text style={{ color: item.txType === 'Income' ? '#21b573' : '#ef6b6b', fontWeight: '800' }}>
                  {item.txType === 'Income' ? '↗' : '↘'}
                </Text>
              </View>
              <View style={styles.txCopy}>
                <Text style={styles.txTitle} numberOfLines={1}>{item.description}</Text>
                <Text style={styles.txMeta}>{item.date} · {item.category}</Text>
              </View>
              <Text style={[styles.txAmount, { color: item.txType === 'Income' ? '#21b573' : '#ef6b6b' }]}>
                {item.txType === 'Income' ? '+' : '-'}{item.amount.toLocaleString()} ETB
              </Text>
            </View>
          ))
        }
      </View>

    </ScrollView>
  );
}

const SummaryCard = ({ title, value, detail, color, icon, mobile }: { title: string; value: string; detail: string; color: string; icon: string; mobile: boolean }) => (
  <View style={[styles.summaryCard, mobile && styles.summaryCardMobile]}>
    <View style={[styles.summaryIconWrap, { backgroundColor: `${color}18` }]}>
      <Text style={[styles.summaryIconText, { color }]}>{icon}</Text>
    </View>
    <Text style={styles.summaryTitle}>{title}</Text>
    <Text style={[styles.summaryValue, mobile && styles.summaryValueMobile]}>{value}</Text>
    <Text style={[styles.summaryDetail, { color }]}>{detail}</Text>
  </View>
);

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#f5f6f8' },
  content: { padding: 24, gap: 18, paddingBottom: 40 },
  mobileContent: { padding: 14, gap: 14 },

  welcome: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' },
  mobileWelcome: { flexDirection: 'column', alignItems: 'stretch', gap: 10 },
  welcomeCopy: { flex: 1, minWidth: 0 },
  greeting: { fontSize: 24, fontWeight: '800', color: '#14213d' },
  mobileGreeting: { fontSize: 20 },
  muted: { color: '#718096', fontSize: 13, marginTop: 4 },
  dateBadge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 7, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e6eaf0', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 9 },
  dateIcon: { color: '#4f7cff', fontSize: 13 },
  dateText: { color: '#475569', fontSize: 12, fontWeight: '700' },

  summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  summaryCard: { flex: 1, flexBasis: 160, minWidth: 140, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e6eaf0', borderRadius: 14, padding: 14 },
  summaryCardMobile: { flexBasis: '45%', minWidth: 0 },
  summaryIconWrap: { width: 34, height: 34, borderRadius: 9, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  summaryIconText: { fontSize: 16, fontWeight: '800' },
  summaryTitle: { color: '#64748b', fontSize: 11, fontWeight: '700' },
  summaryValue: { color: '#14213d', fontSize: 18, fontWeight: '800', marginTop: 4 },
  summaryValueMobile: { fontSize: 15 },
  summaryDetail: { fontSize: 11, fontWeight: '700', marginTop: 6 },

  chartGrid: { flexDirection: 'row', gap: 14 },
  chartStack: { flexDirection: 'column' },
  fullCard: { width: '100%' },
  card: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e6eaf0', borderRadius: 14, padding: 18, minWidth: 0 },
  chartCard: { flex: 1.35, minHeight: 340 },
  categoryCard: { flex: 1, minHeight: 340 },

  sectionTitle: { color: '#14213d', fontSize: 15, fontWeight: '800' },
  sectionSubtitle: { color: '#94a3b8', fontSize: 11, marginTop: 3, marginBottom: 2 },
  legend: { flexDirection: 'row', gap: 14, marginTop: 12, marginBottom: 4 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendText: { color: '#64748b', fontSize: 11 },
  dot: { width: 8, height: 8, borderRadius: 4 },

  chart: { flex: 1, minHeight: 200, marginTop: 10, position: 'relative' },
  gridLine: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: '#edf0f4' },
  bars: { flex: 1, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around', paddingTop: 8 },
  monthCol: { flex: 1, height: '100%', alignItems: 'center', justifyContent: 'flex-end', position: 'relative' },
  barPair: { height: '85%', flexDirection: 'row', alignItems: 'flex-end', gap: 2 },
  bar: { width: 9, minHeight: 4, borderRadius: 4 },
  axisLabel: { color: '#94a3b8', fontSize: 9, marginTop: 6 },
  tooltip: { position: 'absolute', bottom: '100%', zIndex: 10, backgroundColor: '#14213d', borderRadius: 8, padding: 8, minWidth: 120, marginBottom: 4 },
  tooltipTitle: { color: '#fff', fontWeight: '800', fontSize: 11, marginBottom: 3 },
  tooltipIncome: { color: '#8af0bf', fontSize: 10 },
  tooltipExpense: { color: '#ffaaaa', fontSize: 10, marginTop: 2 },

  categoryBody: { marginTop: 14, alignItems: 'center', gap: 14 },
  donut: { width: 130, height: 130, borderRadius: 65, borderWidth: 20, borderColor: '#4f7cff', borderRightColor: '#21b573', borderBottomColor: '#f59e0b', borderLeftColor: '#ef6b6b', alignItems: 'center', justifyContent: 'center' },
  donutHole: { width: 84, height: 84, borderRadius: 42, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  donutTotal: { color: '#14213d', fontSize: 15, fontWeight: '800' },
  donutUnit: { color: '#94a3b8', fontSize: 10 },
  categoryList: { width: '100%', gap: 8 },
  categoryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  categoryName: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1, minWidth: 0 },
  categoryText: { color: '#475569', fontSize: 11, flexShrink: 1 },
  categoryAmount: { color: '#64748b', fontSize: 10, flexShrink: 0 },

  alerts: { gap: 8, marginTop: 12 },
  alert: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, padding: 12, borderRadius: 10, borderWidth: 1 },
  alertWarning: { backgroundColor: '#fffaf0', borderColor: '#fde7b0' },
  alertDanger: { backgroundColor: '#fff5f5', borderColor: '#fecaca' },
  alertInfo: { backgroundColor: '#f3f7ff', borderColor: '#cfe0ff' },
  alertIconWrap: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  alertIconText: { color: '#64748b', fontWeight: '800', fontSize: 13 },
  alertCopy: { flex: 1, minWidth: 0 },
  alertTitle: { color: '#334155', fontSize: 12, fontWeight: '800' },
  alertMessage: { color: '#64748b', fontSize: 11, marginTop: 3, lineHeight: 16 },

  txRow: { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#f0f2f5', paddingVertical: 12, gap: 10 },
  txRowMobile: { flexWrap: 'wrap' },
  txIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  txCopy: { flex: 1, minWidth: 0 },
  txTitle: { color: '#14213d', fontWeight: '700', fontSize: 13 },
  txMeta: { color: '#94a3b8', fontSize: 11, marginTop: 3 },
  txAmount: { fontSize: 13, fontWeight: '800', flexShrink: 0 },

  emptyText: { color: '#94a3b8', fontSize: 13, textAlign: 'center', paddingVertical: 16 },
});
