import { useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Button, EmptyState, ProgressBar, ScreenShell, SectionCard, SelectField, StatCard } from '../shared';
import { colors, formatCurrency, getBudgetProgress, mockBudgets, mockCategories, mockTransactions, spacing } from '../shared';
import type { ReportPeriod } from './reports.types';

export function ReportsScreen() {
  const [period, setPeriod] = useState<ReportPeriod>('month');
  const [categoryId, setCategoryId] = useState('all');

  const report = useMemo(() => {
    const reportEnd = new Date('2025-05-24T23:59:59');
    const reportStart = new Date(reportEnd);
    if (period === 'week') reportStart.setDate(reportStart.getDate() - 6);
    if (period === 'month') reportStart.setDate(1);
    if (period === 'quarter') reportStart.setMonth(Math.floor(reportStart.getMonth() / 3) * 3, 1);
    if (period === 'year') reportStart.setMonth(0, 1);
    const filtered = mockTransactions.filter((transaction) => {
      const transactionDate = new Date(`${transaction.occurredAt}T12:00:00`);
      return transactionDate >= reportStart && transactionDate <= reportEnd && (categoryId === 'all' || transaction.categoryId === categoryId);
    });
    const income = filtered.filter((transaction) => transaction.type === 'income').reduce((sum, transaction) => sum + transaction.amount, 0);
    const expenses = filtered.filter((transaction) => transaction.type === 'expense').reduce((sum, transaction) => sum + transaction.amount, 0);
    const categorySpending = mockCategories.filter((category) => category.type === 'expense').map((category) => ({ category, amount: filtered.filter((transaction) => transaction.categoryId === category.id && transaction.type === 'expense').reduce((sum, transaction) => sum + transaction.amount, 0) })).filter((item) => item.amount > 0).sort((left, right) => right.amount - left.amount);
    return { filtered, income, expenses, balance: income - expenses, categorySpending };
  }, [categoryId, period]);

  const maxFlow = Math.max(report.income, report.expenses, 1);
  const maxCategorySpend = Math.max(...report.categorySpending.map((item) => item.amount), 1);
  const budgetLimit = mockBudgets.reduce((sum, budget) => sum + budget.limit, 0);
  const budgetSpent = mockBudgets.reduce((sum, budget) => sum + budget.spent, 0);
  const budgetUsage = budgetLimit > 0 ? Math.round((budgetSpent / budgetLimit) * 100) : 0;

  return (
    <ScreenShell title="Reports" subtitle="Understand your financial performance" action={<View style={styles.exportActions}><Button label="Export PDF" variant="secondary" onPress={() => Alert.alert('Export PDF', 'PDF export will be connected to the reporting service later.')} /><Button label="Export CSV" variant="text" onPress={() => Alert.alert('Export CSV', 'CSV export will be connected to the reporting service later.')} /></View>}>
      <View style={styles.filters}><SelectField label="Period" value={period} options={[{ label: 'This week', value: 'week' }, { label: 'This month', value: 'month' }, { label: 'This quarter', value: 'quarter' }, { label: 'This year', value: 'year' }]} onChange={setPeriod} /><SelectField label="Category" value={categoryId} options={[{ label: 'All categories', value: 'all' }, ...mockCategories.map((category) => ({ label: category.name, value: category.id }))]} onChange={setCategoryId} /></View>
      <View style={styles.stats}><StatCard label="Total income" value={formatCurrency(report.income)} tone="income" /><StatCard label="Total expenses" value={formatCurrency(report.expenses)} tone="expense" /><StatCard label="Net balance" value={formatCurrency(report.balance)} tone={report.balance < 0 ? 'expense' : 'income'} /><StatCard label="Savings rate" value={`${report.income > 0 ? Math.round((report.balance / report.income) * 100) : 0}%`} /></View>
      {report.filtered.length === 0 ? <EmptyState title="No report data" description="There is no data for the selected filters." /> : <>
        <SectionCard title="Income vs expense">
          <View style={styles.chartRow}><Text style={styles.chartLabel}>Income</Text><View style={styles.barTrack}><View style={[styles.bar, { backgroundColor: colors.income, width: `${(report.income / maxFlow) * 100}%` }]} /></View><Text style={styles.chartValue}>{formatCurrency(report.income)}</Text></View>
          <View style={styles.chartRow}><Text style={styles.chartLabel}>Expense</Text><View style={styles.barTrack}><View style={[styles.bar, { backgroundColor: colors.expense, width: `${(report.expenses / maxFlow) * 100}%` }]} /></View><Text style={styles.chartValue}>{formatCurrency(report.expenses)}</Text></View>
          <Text style={styles.caption}>Showing {period} activity</Text>
        </SectionCard>
        <SectionCard title="Budget usage">
          <View style={styles.donutLayout}>
            <View style={styles.donut}>
              {Array.from({ length: 4 }).map((_, index) => <View key={index} style={[styles.donutSegment, styles[`donutSegment${index + 1}` as 'donutSegment1'], { borderTopColor: index * 25 < budgetUsage ? colors.primary : colors.primarySoft, borderRightColor: (index * 25) + 25 <= budgetUsage ? colors.primary : colors.primarySoft }]} />)}
              <View style={styles.donutCenter}><Text style={styles.donutValue}>{budgetUsage}%</Text><Text style={styles.donutLabel}>used</Text></View>
            </View>
            <View style={styles.donutCopy}><Text style={styles.donutTitle}>Monthly budget</Text><Text style={styles.muted}>{formatCurrency(budgetSpent)} spent of {formatCurrency(budgetLimit)}</Text><ProgressBar value={budgetUsage} tone={budgetUsage >= 100 ? colors.danger : budgetUsage >= 80 ? colors.warning : colors.primary} /><Text style={styles.caption}>{formatCurrency(Math.max(budgetLimit - budgetSpent, 0))} remaining</Text></View>
          </View>
        </SectionCard>
        <SectionCard title="Spending by category">
          {report.categorySpending.length === 0 ? <Text style={styles.muted}>No expense data for this category filter.</Text> : report.categorySpending.map(({ category, amount }) => <View key={category.id} style={styles.categoryRow}><View style={styles.categoryCopy}><Text style={styles.categoryName}>{category.name}</Text><Text style={styles.muted}>{formatCurrency(amount)}</Text></View><View style={styles.barTrack}><View style={[styles.bar, { backgroundColor: category.color ?? colors.primary, width: `${(amount / maxCategorySpend) * 100}%` }]} /></View><Text style={styles.percent}>{Math.round((amount / Math.max(report.expenses, 1)) * 100)}%</Text></View>)}
        </SectionCard>
        <SectionCard title="Budget vs actual">
          {mockBudgets.map((budget) => { const progress = getBudgetProgress(budget); return <View key={budget.id} style={styles.budgetRow}><View style={styles.budgetHeader}><Text style={styles.categoryName}>{budget.name}</Text><Text style={[styles.muted, progress > 100 && { color: colors.danger }]}>{formatCurrency(budget.spent)} / {formatCurrency(budget.limit)}</Text></View><ProgressBar value={progress} tone={progress > 100 ? colors.danger : progress >= 80 ? colors.warning : colors.primary} /></View>; })}
        </SectionCard>
      </>}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  exportActions: { alignItems: 'flex-end', gap: spacing.xs },
  filters: { gap: spacing.sm, marginBottom: spacing.sm },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.sm },
  chartRow: { alignItems: 'center', flexDirection: 'row', marginBottom: spacing.md },
  chartLabel: { color: colors.text, fontSize: 13, width: 58 },
  barTrack: { backgroundColor: colors.border, borderRadius: 4, flex: 1, height: 10, overflow: 'hidden' },
  bar: { borderRadius: 4, height: '100%' },
  chartValue: { color: colors.text, fontSize: 12, fontWeight: '700', marginLeft: spacing.sm, minWidth: 90, textAlign: 'right' },
  caption: { color: colors.mutedText, fontSize: 12 },
  categoryRow: { alignItems: 'center', flexDirection: 'row', marginBottom: spacing.md },
  categoryCopy: { width: 112 },
  categoryName: { color: colors.text, fontSize: 13, fontWeight: '700' },
  percent: { color: colors.text, fontSize: 12, marginLeft: spacing.sm, width: 32, textAlign: 'right' },
  muted: { color: colors.mutedText, fontSize: 12, marginTop: 3 },
  budgetRow: { marginBottom: spacing.md },
  budgetHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  donutLayout: { alignItems: 'center', flexDirection: 'row', gap: spacing.lg },
  donut: { height: 124, justifyContent: 'center', position: 'relative', width: 124 },
  donutSegment: { borderColor: colors.primarySoft, borderRadius: 62, borderWidth: 12, height: 124, position: 'absolute', width: 124 },
  donutSegment1: { transform: [{ rotate: '0deg' }] },
  donutSegment2: { transform: [{ rotate: '90deg' }] },
  donutSegment3: { transform: [{ rotate: '180deg' }] },
  donutSegment4: { transform: [{ rotate: '270deg' }] },
  donutCenter: { alignItems: 'center', alignSelf: 'center', backgroundColor: colors.surface, borderRadius: 42, height: 84, justifyContent: 'center', width: 84 },
  donutValue: { color: colors.text, fontSize: 20, fontWeight: '800' },
  donutLabel: { color: colors.mutedText, fontSize: 11, marginTop: 2 },
  donutCopy: { flex: 1, gap: spacing.sm },
  donutTitle: { color: colors.text, fontSize: 15, fontWeight: '700' },
});
