import { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { createTransaction, removeTransaction, updateTransaction } from '../../api';
import { useFinance } from '../../context/FinanceContext';
import { Button, EmptyState, Field, LoadingState, ModalCard, ScreenShell, SectionCard, SelectField } from '../shared';
import { colors, formatCurrency, radii, spacing } from '../shared';
import type { Transaction, TransactionType } from './transactions.types';

type FilterType = 'all' | TransactionType;

const CATEGORIES = {
  income: ['Salary', 'Freelance', 'Investment', 'Business', 'Other'],
  expense: ['Food', 'Housing', 'Transport', 'Health', 'Education', 'Entertainment', 'Shopping', 'Other'],
};

const initialForm = { title: '', amount: '', category: 'Food', occurredAt: new Date().toISOString().slice(0, 10), type: 'expense' as TransactionType };

export function TransactionsScreen() {
  const { income, setIncome, expenses, setExpenses, isLoading, error } = useFinance();

  const transactions: Transaction[] = useMemo(() => [
    ...income.map((item) => ({ id: String(item.id), title: item.description, amount: item.amount, type: 'income' as TransactionType, category: item.category, occurredAt: item.date })),
    ...expenses.map((item) => ({ id: String(item.id), title: item.description, amount: item.amount, type: 'expense' as TransactionType, category: item.category, occurredAt: item.date })),
  ].sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()), [income, expenses]);

  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<FilterType>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(initialForm);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const allCategories = useMemo(() => {
    const cats = Array.from(new Set(transactions.map((t) => t.category)));
    return [{ label: 'All Categories', value: 'all' }, ...cats.map((c) => ({ label: c, value: c }))];
  }, [transactions]);

  const filtered = useMemo(() => transactions.filter((t) => {
    const matchesQuery = `${t.title} ${t.category}`.toLowerCase().includes(query.toLowerCase().trim());
    const matchesType = typeFilter === 'all' || t.type === typeFilter;
    const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter;
    return matchesQuery && matchesType && matchesCategory;
  }), [transactions, query, typeFilter, categoryFilter]);

  const openCreate = () => { setEditingId(null); setForm(initialForm); setFormErrors({}); setIsFormOpen(true); };

  const openEdit = (t: Transaction) => {
    setEditingId(t.id);
    setForm({ title: t.title, amount: String(t.amount), category: t.category, occurredAt: t.occurredAt, type: t.type });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const toRow = (r: { id: number; description: string | null; category: string; amount: number | string; type: TransactionType; date: string }) => ({
    id: r.id,
    description: r.description ?? r.category,
    category: r.category,
    amount: Number(r.amount),
    date: r.date,
  });

  const save = async () => {
    const amount = Number(form.amount);
    const next: Record<string, string> = {};
    if (!form.title.trim()) next.title = 'Enter a description.';
    if (!Number.isFinite(amount) || amount <= 0) next.amount = 'Enter a positive amount.';
    if (!form.category.trim()) next.category = 'Select a category.';
    if (!form.occurredAt) next.occurredAt = 'Enter a date.';
    if (Object.keys(next).length > 0) { setFormErrors(next); return; }
    setSaving(true);
    try {
      const payload = { type: form.type, category: form.category, amount, description: form.title.trim(), date: form.occurredAt };
      if (editingId) {
        const updated = await updateTransaction(Number(editingId), payload);
        const row = toRow(updated);
        if (updated.type === 'income') {
          setIncome((cur) => cur.map((item) => item.id === row.id ? row : item));
          setExpenses((cur) => cur.filter((item) => item.id !== row.id));
        } else {
          setExpenses((cur) => cur.map((item) => item.id === row.id ? row : item));
          setIncome((cur) => cur.filter((item) => item.id !== row.id));
        }
      } else {
        const created = await createTransaction(payload);
        const row = toRow(created);
        if (created.type === 'income') setIncome((cur) => [row, ...cur]);
        else setExpenses((cur) => [row, ...cur]);
      }
      setIsFormOpen(false);
    } catch (e: unknown) {
      setFormErrors({ submit: e instanceof Error ? e.message : 'Failed to save.' });
    } finally {
      setSaving(false);
    }
  };

  const del = (id: string) => {
    Alert.alert('Delete transaction?', 'This action cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await removeTransaction(Number(id));
          setIncome((cur) => cur.filter((item) => String(item.id) !== id));
          setExpenses((cur) => cur.filter((item) => String(item.id) !== id));
        } catch (e: unknown) {
          Alert.alert('Error', e instanceof Error ? e.message : 'Failed to delete.');
        }
      }},
    ]);
  };

  const formCategories = CATEGORIES[form.type].map((c) => ({ label: c, value: c }));

  return (
    <ScreenShell title="Transactions" subtitle="All financial transactions" action={<Button label="+ Add transaction" onPress={openCreate} />}>
      <View style={styles.searchWrap}>
        <TextInput value={query} onChangeText={setQuery} placeholder="Search transactions..." placeholderTextColor={colors.mutedText} style={styles.search} />
      </View>
      <View style={styles.filters}>
        <SelectField label="Type" value={typeFilter} options={[{ label: 'All Types', value: 'all' }, { label: 'Income', value: 'income' }, { label: 'Expense', value: 'expense' }]} onChange={(v) => setTypeFilter(v as FilterType)} />
        <SelectField label="Category" value={categoryFilter} options={allCategories} onChange={setCategoryFilter} />
      </View>
      {isLoading ? <LoadingState /> : error ? (
        <EmptyState title="Failed to load" description={error} />
      ) : filtered.length === 0 ? (
        <EmptyState title="No transactions found" description="Add your first transaction or adjust your filters." action={<Button label="Add transaction" onPress={openCreate} />} />
      ) : (
        <SectionCard title={`${filtered.length} transaction${filtered.length === 1 ? '' : 's'}`}>
          {filtered.map((t) => {
            const isIncome = t.type === 'income';
            return (
              <View key={t.id} style={styles.row}>
                <View style={[styles.icon, { backgroundColor: isIncome ? '#DCFCE7' : '#FEE2E2' }]}><Text style={{ color: isIncome ? colors.income : colors.expense }}>{isIncome ? '↗' : '↘'}</Text></View>
                <View style={styles.rowMain}><Text style={styles.rowTitle}>{t.title}</Text><Text style={styles.rowMeta}>{t.occurredAt}  ·  {t.category}</Text></View>
                <View style={styles.rowEnd}>
                  <Text style={[styles.amount, { color: isIncome ? colors.income : colors.expense }]}>{isIncome ? '+' : '-'}{formatCurrency(t.amount)}</Text>
                  <View style={styles.rowActions}>
                    <Pressable onPress={() => openEdit(t)}><Text style={styles.action}>Edit</Text></Pressable>
                    <Pressable onPress={() => del(t.id)}><Text style={[styles.action, { color: colors.danger }]}>Delete</Text></Pressable>
                  </View>
                </View>
              </View>
            );
          })}
        </SectionCard>
      )}
      {isFormOpen ? (
        <ModalCard title={editingId ? 'Edit Transaction' : 'Add Transaction'} onClose={() => setIsFormOpen(false)}>
          <SelectField label="Type" value={form.type} options={[{ label: 'Income', value: 'income' }, { label: 'Expense', value: 'expense' }]} onChange={(type) => setForm((c) => ({ ...c, type, category: CATEGORIES[type][0] }))} />
          <Field label="Description" value={form.title} onChangeText={(title) => setForm((c) => ({ ...c, title }))} placeholder="e.g. Salary or Lunch" error={formErrors.title} />
          <Field label="Amount (ETB)" value={form.amount} onChangeText={(amount) => setForm((c) => ({ ...c, amount }))} placeholder="0.00" keyboardType="numeric" error={formErrors.amount} />
          <SelectField label="Category" value={form.category} options={formCategories} onChange={(category) => setForm((c) => ({ ...c, category }))} error={formErrors.category} />
          <Field label="Date (YYYY-MM-DD)" value={form.occurredAt} onChangeText={(occurredAt) => setForm((c) => ({ ...c, occurredAt }))} placeholder="YYYY-MM-DD" error={formErrors.occurredAt} />
          {formErrors.submit ? <Text style={styles.submitError}>{formErrors.submit}</Text> : null}
          <Button label={saving ? 'Saving...' : editingId ? 'Save changes' : 'Save transaction'} onPress={() => { void save(); }} />
        </ModalCard>
      ) : null}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  searchWrap: { marginBottom: spacing.md },
  search: { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: radii.sm, color: colors.text, minHeight: 46, paddingHorizontal: spacing.md },
  filters: { gap: spacing.sm },
  row: { alignItems: 'center', borderBottomColor: colors.border, borderBottomWidth: 1, flexDirection: 'row', paddingVertical: spacing.md },
  icon: { alignItems: 'center', borderRadius: 20, height: 38, justifyContent: 'center', marginRight: spacing.sm, width: 38 },
  rowMain: { flex: 1 },
  rowTitle: { color: colors.text, fontSize: 14, fontWeight: '700' },
  rowMeta: { color: colors.mutedText, fontSize: 12, marginTop: 4 },
  rowEnd: { alignItems: 'flex-end' },
  amount: { fontSize: 13, fontWeight: '700' },
  rowActions: { flexDirection: 'row', gap: spacing.sm, marginTop: 6 },
  action: { color: colors.primary, fontSize: 12, fontWeight: '700' },
  submitError: { color: colors.danger, fontSize: 12, marginBottom: spacing.sm },
});
