import { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Button, EmptyState, Field, ModalCard, ProgressBar, ScreenShell, SectionCard, SelectField, StatCard } from '../shared';
import { colors, formatCurrency, getBudgetProgress, getBudgetRemaining, isValidDate, mockBudgets, mockCategories, parseAmount, spacing } from '../shared';
import type { Budget } from './budget.types';

const initialForm = { name: '', categoryId: 'cat-food', limit: '', spent: '0', periodStart: '2025-05-01', periodEnd: '2025-05-31' };

export function BudgetScreen() {
  const [budgets, setBudgets] = useState<Budget[]>(mockBudgets);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const expenseCategories = mockCategories.filter((category) => category.type === 'expense');
  const totals = useMemo(() => ({ limit: budgets.reduce((sum, budget) => sum + budget.limit, 0), spent: budgets.reduce((sum, budget) => sum + budget.spent, 0) }), [budgets]);

  const openCreate = () => {
    setEditingId(null);
    setForm(initialForm);
    setErrors({});
    setIsFormOpen(true);
  };

  const openEdit = (budget: Budget) => {
    setEditingId(budget.id);
    setForm({ name: budget.name, categoryId: budget.categoryId ?? 'cat-food', limit: String(budget.limit), spent: String(budget.spent), periodStart: budget.periodStart, periodEnd: budget.periodEnd });
    setErrors({});
    setIsFormOpen(true);
  };

  const saveBudget = () => {
    const limit = parseAmount(form.limit);
    const spent = parseAmount(form.spent);
    const nextErrors: Record<string, string> = {};
    if (!form.name.trim()) nextErrors.name = 'Enter a budget name.';
    if (!Number.isFinite(limit) || limit <= 0) nextErrors.limit = 'Limit must be greater than zero.';
    if (!Number.isFinite(spent) || spent < 0) nextErrors.spent = 'Spent cannot be negative.';
    if (!isValidDate(form.periodStart.trim()) || !isValidDate(form.periodEnd.trim())) nextErrors.period = 'Use valid period dates in YYYY-MM-DD format.';
    if (isValidDate(form.periodStart.trim()) && isValidDate(form.periodEnd.trim()) && new Date(form.periodEnd) < new Date(form.periodStart)) nextErrors.period = 'Period end must be after the start date.';
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    const nextBudget: Budget = { id: editingId ?? `budget-${Date.now()}`, name: form.name.trim(), categoryId: form.categoryId, limit, spent, periodStart: form.periodStart.trim(), periodEnd: form.periodEnd.trim() };
    setBudgets((current) => editingId ? current.map((item) => item.id === editingId ? nextBudget : item) : [...current, nextBudget]);
    setIsFormOpen(false);
  };

  const deleteBudget = (id: string) => {
    Alert.alert('Delete budget?', 'This action cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => setBudgets((current) => current.filter((budget) => budget.id !== id)) },
    ]);
  };

  return (
    <ScreenShell title="Budgets" subtitle="Plan spending and track progress" action={<Button label="+ Create budget" onPress={openCreate} />}>
      <View style={styles.stats}><StatCard label="Total budget" value={formatCurrency(totals.limit)} /><StatCard label="Total spent" value={formatCurrency(totals.spent)} tone="expense" /><StatCard label="Remaining" value={formatCurrency(totals.limit - totals.spent)} tone={totals.limit - totals.spent < 0 ? 'expense' : 'income'} /></View>
      {budgets.length === 0 ? <EmptyState title="No budgets yet" description="Create a budget to start tracking your spending." action={<Button label="Create budget" onPress={openCreate} />} /> : <SectionCard title="Budget status">
        {budgets.map((budget) => {
          const progress = getBudgetProgress(budget);
          const remaining = getBudgetRemaining(budget);
          const category = expenseCategories.find((item) => item.id === budget.categoryId);
          const tone = progress > 100 ? colors.danger : progress >= 80 ? colors.warning : colors.income;
          return <View key={budget.id} style={styles.budgetRow}>
            <View style={styles.budgetHeader}><View style={styles.budgetNameWrap}><Text style={styles.budgetName}>{budget.name}</Text><Text style={styles.meta}>{category?.name ?? 'All expenses'}  ·  {budget.periodStart} to {budget.periodEnd}</Text></View><Text style={[styles.status, { color: tone }]}>{progress > 100 ? 'Over limit' : progress >= 80 ? 'Near limit' : 'Safe'}</Text></View>
            <View style={styles.amounts}><Text style={styles.meta}>Spent {formatCurrency(budget.spent)}</Text><Text style={[styles.remaining, { color: remaining < 0 ? colors.danger : colors.income }]}>{formatCurrency(remaining)} remaining</Text></View>
            <ProgressBar value={progress} tone={tone} />
            <View style={styles.footer}><Text style={styles.meta}>{Math.round(progress)}% used of {formatCurrency(budget.limit)}</Text><View style={styles.actions}><Pressable onPress={() => openEdit(budget)}><Text style={styles.action}>Edit</Text></Pressable><Pressable onPress={() => deleteBudget(budget.id)}><Text style={[styles.action, { color: colors.danger }]}>Delete</Text></Pressable></View></View>
          </View>;
        })}
      </SectionCard>}
      {isFormOpen ? <ModalCard title={editingId ? 'Edit Budget' : 'Create Budget'} onClose={() => setIsFormOpen(false)}>
        <Field label="Budget name" value={form.name} onChangeText={(name) => setForm((current) => ({ ...current, name }))} placeholder="e.g. Food" error={errors.name} />
        <SelectField label="Category" value={form.categoryId} options={expenseCategories.map((category) => ({ label: category.name, value: category.id }))} onChange={(categoryId) => setForm((current) => ({ ...current, categoryId }))} />
        <Field label="Budget limit (ETB)" value={form.limit} onChangeText={(limit) => setForm((current) => ({ ...current, limit }))} placeholder="0.00" keyboardType="numeric" error={errors.limit} />
        <Field label="Spent amount (ETB)" value={form.spent} onChangeText={(spent) => setForm((current) => ({ ...current, spent }))} placeholder="0.00" keyboardType="numeric" error={errors.spent} />
        <Field label="Period start" value={form.periodStart} onChangeText={(periodStart) => setForm((current) => ({ ...current, periodStart }))} placeholder="YYYY-MM-DD" error={errors.period} />
        <Field label="Period end" value={form.periodEnd} onChangeText={(periodEnd) => setForm((current) => ({ ...current, periodEnd }))} placeholder="YYYY-MM-DD" />
        <Button label={editingId ? 'Save changes' : 'Save budget'} onPress={saveBudget} />
      </ModalCard> : null}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.sm },
  budgetRow: { borderBottomColor: colors.border, borderBottomWidth: 1, paddingVertical: spacing.md },
  budgetHeader: { alignItems: 'flex-start', flexDirection: 'row', justifyContent: 'space-between' },
  budgetNameWrap: { flex: 1 },
  budgetName: { color: colors.text, fontSize: 15, fontWeight: '700' },
  meta: { color: colors.mutedText, fontSize: 12, marginTop: 4 },
  status: { fontSize: 12, fontWeight: '700' },
  amounts: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm, marginTop: spacing.sm },
  remaining: { fontSize: 12, fontWeight: '700' },
  footer: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.sm },
  actions: { flexDirection: 'row', gap: spacing.sm },
  action: { color: colors.primary, fontSize: 12, fontWeight: '700' },
});
