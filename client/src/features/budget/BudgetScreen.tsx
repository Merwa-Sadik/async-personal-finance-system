import { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { createBudget, removeBudget, updateBudget } from '../../api';
import { useFinance } from '../../context/FinanceContext';
import { Button, EmptyState, Field, LoadingState, ModalCard, ProgressBar, ScreenShell, SectionCard, SelectField, StatCard } from '../shared';
import { colors, formatCurrency, spacing } from '../shared';

type ApiBudget = { id: number; category: string; amount: number; month: number; year: number }

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const EXPENSE_CATEGORIES = ['Food', 'Housing', 'Transport', 'Health', 'Education', 'Entertainment', 'Shopping', 'Other'];

const now = new Date();
const initialForm = { category: 'Food', limit: '', month: String(now.getMonth() + 1), year: String(now.getFullYear()) };

export function BudgetScreen() {
  const { budgets: rawBudgets, setBudgets: setRawBudgets, expenses, isLoading, error } = useFinance();
  const mobile = useWindowDimensions().width < 600;

  const budgets: ApiBudget[] = rawBudgets.map((b) => ({
    id: Number(b.id),
    category: b.category,
    amount: Number(b.amount),
    month: Number(b.month),
    year: Number(b.year),
  }));

  const setBudgets = (updater: (cur: ApiBudget[]) => ApiBudget[]) => {
    setRawBudgets((cur) => updater(cur.map((b) => ({
      id: Number(b.id), category: b.category, amount: Number(b.amount),
      month: Number(b.month), year: Number(b.year),
    }))) as unknown as typeof cur);
  };

  // Calculate actual spending per budget (matched by category + month + year)
  const spentMap = useMemo(() => {
    const map: Record<string, number> = {};
    expenses.forEach((e) => {
      const d = new Date(e.date);
      const key = `${e.category}-${d.getMonth() + 1}-${d.getFullYear()}`;
      map[key] = (map[key] ?? 0) + e.amount;
    });
    return map;
  }, [expenses]);

  const getSpent = (b: ApiBudget) => spentMap[`${b.category}-${b.month}-${b.year}`] ?? 0;

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(initialForm);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const totalAllocated = useMemo(() => budgets.reduce((s, b) => s + b.amount, 0), [budgets]);
  const totalSpent = useMemo(() => budgets.reduce((s, b) => s + getSpent(b), 0), [budgets, spentMap]);

  const openCreate = () => { setEditingId(null); setForm(initialForm); setFormErrors({}); setIsFormOpen(true); };

  const openEdit = (b: ApiBudget) => {
    setEditingId(b.id);
    setForm({ category: b.category, limit: String(b.amount), month: String(b.month), year: String(b.year) });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const save = async () => {
    const limit = Number(form.limit);
    const month = Number(form.month);
    const year = Number(form.year);
    const next: Record<string, string> = {};
    if (!form.category.trim()) next.category = 'Select a category.';
    if (!Number.isFinite(limit) || limit <= 0) next.limit = 'Limit must be greater than zero.';
    if (!Number.isInteger(month) || month < 1 || month > 12) next.month = 'Select a valid month.';
    if (!Number.isInteger(year) || year < 2000) next.year = 'Enter a valid year.';
    if (Object.keys(next).length > 0) { setFormErrors(next); return; }
    setSaving(true);
    try {
      const payload = { category: form.category, amount: limit, month, year };
      if (editingId) {
        const updated = await updateBudget(editingId, payload);
        const mapped = { id: Number(updated.id), category: updated.category, amount: Number(updated.amount), month: Number((updated as unknown as ApiBudget).month), year: Number((updated as unknown as ApiBudget).year) };
        setBudgets((cur) => cur.map((b) => b.id === editingId ? mapped : b));
      } else {
        const created = await createBudget(payload);
        const mapped = { id: Number(created.id), category: created.category, amount: Number(created.amount), month: Number((created as unknown as ApiBudget).month), year: Number((created as unknown as ApiBudget).year) };
        setBudgets((cur) => [mapped, ...cur]);
      }
      setIsFormOpen(false);
    } catch (e: unknown) {
      setFormErrors({ submit: e instanceof Error ? e.message : 'Failed to save.' });
    } finally {
      setSaving(false);
    }
  };

  const del = (id: number) => {
    Alert.alert('Delete budget?', 'This action cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await removeBudget(id);
          setBudgets((cur) => cur.filter((b) => b.id !== id));
        } catch (e: unknown) {
          Alert.alert('Error', e instanceof Error ? e.message : 'Failed to delete.');
        }
      }},
    ]);
  };

  const monthOptions = MONTHS.map((m, i) => ({ label: m, value: String(i + 1) }));
  const yearOptions = Array.from({ length: 5 }, (_, i) => { const y = now.getFullYear() - 2 + i; return { label: String(y), value: String(y) }; });

  return (
    <ScreenShell title="Budgets" subtitle="Plan spending and track progress" action={<Button label="+ Create budget" onPress={openCreate} />}>
      <View style={[styles.stats, mobile && styles.statsMobile]}>
        <StatCard label="Total budgets" value={String(budgets.length)} />
        <StatCard label="Total allocated" value={formatCurrency(totalAllocated)} />
        <StatCard label="Total spent" value={formatCurrency(totalSpent)} tone={totalSpent > totalAllocated ? 'expense' : 'default'} />
      </View>

      {isLoading ? <LoadingState /> : error ? (
        <EmptyState title="Failed to load" description={error} />
      ) : budgets.length === 0 ? (
        <EmptyState title="No budgets yet" description="Create a budget to start tracking your spending." action={<Button label="Create budget" onPress={openCreate} />} />
      ) : (
        <SectionCard title="Budget list">
          {budgets.map((b) => {
            const spent = getSpent(b);
            const pct = b.amount > 0 ? (spent / b.amount) * 100 : 0;
            const exceeded = spent > b.amount;
            const warning = !exceeded && pct >= 80;
            const barColor = exceeded ? colors.danger : warning ? colors.warning : colors.primary;

            return (
              <View key={b.id} style={styles.budgetRow}>
                {/* Header row */}
                <View style={[styles.budgetHeader, mobile && styles.budgetHeaderMobile]}>
                  <View style={styles.budgetNameWrap}>
                    <View style={styles.budgetTitleRow}>
                      <Text style={styles.budgetName}>{b.category}</Text>
                      {exceeded && <View style={styles.exceededBadge}><Text style={styles.exceededText}>Exceeded</Text></View>}
                      {warning && <View style={styles.warningBadge}><Text style={styles.warningText}>Near limit</Text></View>}
                    </View>
                    <Text style={styles.meta}>{MONTHS[b.month - 1]} {b.year}</Text>
                  </View>
                  <Text style={[styles.budgetAmount, exceeded && { color: colors.danger }]}>{formatCurrency(b.amount)}</Text>
                </View>

                {/* Progress bar */}
                <ProgressBar value={Math.min(pct, 100)} tone={barColor} />

                {/* Footer */}
                <View style={[styles.footer, mobile && styles.footerMobile]}>
                  <Text style={styles.meta}>
                    {formatCurrency(spent)} spent · {formatCurrency(Math.max(b.amount - spent, 0))} left
                  </Text>
                  <View style={styles.rowActions}>
                    <Pressable onPress={() => openEdit(b)}><Text style={styles.action}>Edit</Text></Pressable>
                    <Pressable onPress={() => del(b.id)}><Text style={[styles.action, { color: colors.danger }]}>Delete</Text></Pressable>
                  </View>
                </View>
              </View>
            );
          })}
        </SectionCard>
      )}

      {isFormOpen ? (
        <ModalCard title={editingId ? 'Edit Budget' : 'Create Budget'} onClose={() => setIsFormOpen(false)}>
          <SelectField label="Category" value={form.category} options={EXPENSE_CATEGORIES.map((c) => ({ label: c, value: c }))} onChange={(category) => setForm((c) => ({ ...c, category }))} error={formErrors.category} />
          <Field label="Budget limit (ETB)" value={form.limit} onChangeText={(limit) => setForm((c) => ({ ...c, limit }))} placeholder="0.00" keyboardType="numeric" error={formErrors.limit} />
          <SelectField label="Month" value={form.month} options={monthOptions} onChange={(month) => setForm((c) => ({ ...c, month }))} error={formErrors.month} />
          <SelectField label="Year" value={form.year} options={yearOptions} onChange={(year) => setForm((c) => ({ ...c, year }))} error={formErrors.year} />
          {formErrors.submit ? <Text style={styles.submitError}>{formErrors.submit}</Text> : null}
          <Button label={saving ? 'Saving...' : editingId ? 'Save changes' : 'Save budget'} onPress={() => { void save(); }} />
        </ModalCard>
      ) : null}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.sm },
  statsMobile: { flexDirection: 'column' },

  budgetRow: { borderBottomColor: colors.border, borderBottomWidth: 1, paddingVertical: spacing.md },
  budgetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.sm },
  budgetHeaderMobile: { flexDirection: 'column', gap: 4 },
  budgetNameWrap: { flex: 1, minWidth: 0 },
  budgetTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  budgetName: { color: colors.text, fontSize: 15, fontWeight: '700' },
  budgetAmount: { color: colors.text, fontSize: 15, fontWeight: '700' },

  exceededBadge: { backgroundColor: '#fee2e2', borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 },
  exceededText: { color: colors.danger, fontSize: 11, fontWeight: '700' },
  warningBadge: { backgroundColor: '#fef3c7', borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 },
  warningText: { color: colors.warning, fontSize: 11, fontWeight: '700' },

  meta: { color: colors.mutedText, fontSize: 12, marginTop: 4 },
  footer: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.sm, flexWrap: 'wrap', gap: 6 },
  footerMobile: { flexDirection: 'column', alignItems: 'flex-start' },
  rowActions: { flexDirection: 'row', gap: spacing.sm },
  action: { color: colors.primary, fontSize: 12, fontWeight: '700' },
  submitError: { color: colors.danger, fontSize: 12, marginBottom: spacing.sm },
});
