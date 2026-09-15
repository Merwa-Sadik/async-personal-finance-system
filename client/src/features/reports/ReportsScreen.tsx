import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { getReportSummary, ReportSummary } from '../../api';
import { Button, EmptyState, LoadingState, ProgressBar, ScreenShell, SectionCard, SelectField, StatCard } from '../shared';
import { colors, formatCurrency, spacing } from '../shared';
import type { ReportPeriod } from './reports.types';

export function ReportsScreen() {
  const [period, setPeriod] = useState<ReportPeriod>('month');
  const [report, setReport] = useState<ReportSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const load = (p: ReportPeriod) => {
    setIsLoading(true);
    setError('');
    getReportSummary(p)
      .then(setReport)
      .catch((e: Error) => setError(e.message))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => { load(period); }, [period]);

  const byCategory = report?.byCategory.map((item) => ({ ...item, total: Number(item.total) })) ?? [];
  const expenseCategories = byCategory.filter((item) => item.type === 'expense').sort((a, b) => b.total - a.total);
  const maxExpense = Math.max(...expenseCategories.map((item) => item.total), 1);
  const maxFlow = Math.max(report?.totalIncome ?? 0, report?.totalExpenses ?? 0, 1);

  return (
    <ScreenShell
      title="Reports"
      subtitle="Understand your financial performance"
      action={
        <View style={styles.exportActions}>
          <Button label="Export PDF" variant="secondary" onPress={() => Alert.alert('Export PDF', 'PDF export coming soon.')} />
          <Button label="Export CSV" variant="text" onPress={() => Alert.alert('Export CSV', 'CSV export coming soon.')} />
        </View>
      }
    >
      <View style={styles.filters}>
        <SelectField
          label="Period"
          value={period}
          options={[
            { label: 'This week', value: 'week' },
            { label: 'This month', value: 'month' },
            { label: 'This quarter', value: 'quarter' },
            { label: 'This year', value: 'year' },
          ]}
          onChange={(value) => setPeriod(value as ReportPeriod)}
        />
      </View>

      {isLoading ? <LoadingState /> : error ? (
        <EmptyState title="Failed to load" description={error} action={<Button label="Retry" onPress={() => load(period)} />} />
      ) : !report ? null : <>
        <View style={styles.stats}>
          <StatCard label="Total income" value={formatCurrency(report.totalIncome)} tone="income" />
          <StatCard label="Total expenses" value={formatCurrency(report.totalExpenses)} tone="expense" />
          <StatCard label="Net balance" value={formatCurrency(report.balance)} tone={report.balance < 0 ? 'expense' : 'income'} />
          <StatCard label="Savings rate" value={`${report.totalIncome > 0 ? Math.round((report.balance / report.totalIncome) * 100) : 0}%`} />
        </View>

        <SectionCard title="Income vs Expense">
          <View style={styles.chartRow}>
            <Text style={styles.chartLabel}>Income</Text>
            <View style={styles.barTrack}><View style={[styles.bar, { backgroundColor: colors.income, width: `${(report.totalIncome / maxFlow) * 100}%` }]} /></View>
            <Text style={styles.chartValue}>{formatCurrency(report.totalIncome)}</Text>
          </View>
          <View style={styles.chartRow}>
            <Text style={styles.chartLabel}>Expense</Text>
            <View style={styles.barTrack}><View style={[styles.bar, { backgroundColor: colors.expense, width: `${(report.totalExpenses / maxFlow) * 100}%` }]} /></View>
            <Text style={styles.chartValue}>{formatCurrency(report.totalExpenses)}</Text>
          </View>
          <Text style={styles.caption}>Showing {period} activity</Text>
        </SectionCard>

        {expenseCategories.length > 0 && (
          <SectionCard title="Spending by category">
            {expenseCategories.map((item) => (
              <View key={item.category} style={styles.categoryRow}>
                <View style={styles.categoryCopy}>
                  <Text style={styles.categoryName}>{item.category}</Text>
                  <Text style={styles.muted}>{formatCurrency(item.total)}</Text>
                </View>
                <View style={styles.barTrack}>
                  <View style={[styles.bar, { backgroundColor: colors.primary, width: `${(item.total / maxExpense) * 100}%` }]} />
                </View>
                <Text style={styles.percent}>{Math.round((item.total / Math.max(report.totalExpenses, 1)) * 100)}%</Text>
              </View>
            ))}
          </SectionCard>
        )}

        {byCategory.filter((item) => item.type === 'income').length > 0 && (
          <SectionCard title="Income by category">
            {byCategory.filter((item) => item.type === 'income').map((item) => (
              <View key={item.category} style={styles.categoryRow}>
                <View style={styles.categoryCopy}>
                  <Text style={styles.categoryName}>{item.category}</Text>
                  <Text style={styles.muted}>{formatCurrency(item.total)}</Text>
                </View>
                <View style={styles.barTrack}>
                  <View style={[styles.bar, { backgroundColor: colors.income, width: `${(item.total / Math.max(report.totalIncome, 1)) * 100}%` }]} />
                </View>
                <Text style={styles.percent}>{Math.round((item.total / Math.max(report.totalIncome, 1)) * 100)}%</Text>
              </View>
            ))}
          </SectionCard>
        )}

        {byCategory.length === 0 && (
          <EmptyState title="No data" description="No transactions found for this period." />
        )}
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
  chartValue: { color: colors.text, fontSize: 12, fontWeight: '700', marginLeft: spacing.sm, flexShrink: 1, textAlign: 'right' },
  caption: { color: colors.mutedText, fontSize: 12 },
  categoryRow: { alignItems: 'center', flexDirection: 'row', marginBottom: spacing.md, gap: spacing.sm },
  categoryCopy: { flex: 1, minWidth: 0 },
  categoryName: { color: colors.text, fontSize: 13, fontWeight: '700' },
  percent: { color: colors.text, fontSize: 12, width: 36, textAlign: 'right', flexShrink: 0 },
  muted: { color: colors.mutedText, fontSize: 12, marginTop: 3 },
});
