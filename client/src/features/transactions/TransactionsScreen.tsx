import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import type { Category } from '../categories/categories.types';
import { Button, EmptyState, Field, LoadingState, ModalCard, ScreenShell, SectionCard, SelectField } from '../shared';
import { colors, formatCurrency, isValidDate, mockCategories, mockTransactions, parseAmount, radii, spacing } from '../shared';
import type { Transaction, TransactionType } from './transactions.types';

type FilterType = 'all' | TransactionType;

const initialForm = { title: '', amount: '', categoryId: 'cat-food', occurredAt: '2025-05-24', type: 'expense' as TransactionType };

export function TransactionsScreen() {
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [categories] = useState<Category[]>(mockCategories);
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<FilterType>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 250);
    return () => clearTimeout(timer);
  }, []);

  const filteredTransactions = useMemo(() => transactions.filter((transaction) => {
    const category = categories.find((item) => item.id === transaction.categoryId);
    const matchesQuery = `${transaction.title} ${category?.name ?? ''}`.toLowerCase().includes(query.toLowerCase().trim());
    const matchesType = typeFilter === 'all' || transaction.type === typeFilter;
    const matchesCategory = categoryFilter === 'all' || transaction.categoryId === categoryFilter;
    return matchesQuery && matchesType && matchesCategory;
  }), [categories, categoryFilter, query, transactions, typeFilter]);

  const openCreate = () => {
    setEditingId(null);
    setForm(initialForm);
    setErrors({});
    setIsFormOpen(true);
  };

  const openEdit = (transaction: Transaction) => {
    setEditingId(transaction.id);
    setForm({ ...transaction, amount: String(transaction.amount) });
    setErrors({});
    setIsFormOpen(true);
  };

  const saveTransaction = () => {
    const amount = parseAmount(form.amount);
    const nextErrors: Record<string, string> = {};
    if (!form.title.trim()) nextErrors.title = 'Enter a description.';
    if (!Number.isFinite(amount) || amount <= 0) nextErrors.amount = 'Enter an amount greater than zero.';
    if (!form.categoryId || !categories.some((category) => category.id === form.categoryId && category.type === form.type)) nextErrors.categoryId = 'Choose a category for this transaction type.';
    if (!isValidDate(form.occurredAt.trim())) nextErrors.occurredAt = 'Use a valid date in YYYY-MM-DD format.';
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const nextTransaction: Transaction = { id: editingId ?? `tx-${Date.now()}`, title: form.title.trim(), amount, type: form.type, categoryId: form.categoryId, occurredAt: form.occurredAt.trim() };
    setTransactions((current) => editingId ? current.map((item) => item.id === editingId ? nextTransaction : item) : [nextTransaction, ...current]);
    setIsFormOpen(false);
  };

  const deleteTransaction = (id: string) => {
    Alert.alert('Delete transaction?', 'This action cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => setTransactions((current) => current.filter((item) => item.id !== id)) },
    ]);
  };

  const categoryOptions = [{ label: 'All Categories', value: 'all' }, ...categories.map((category) => ({ label: category.name, value: category.id }))];
  const formCategoryOptions = categories.filter((category) => category.type === form.type).map((category) => ({ label: category.name, value: category.id }));

  return (
    <ScreenShell title="Transactions" subtitle="All financial transactions" action={<Button label="+ Add transaction" onPress={openCreate} />}>
      <View style={styles.searchWrap}>
        <TextInput value={query} onChangeText={setQuery} placeholder="Search transactions..." placeholderTextColor={colors.mutedText} style={styles.search} />
      </View>
      <View style={styles.filters}>
        <SelectField label="Type" value={typeFilter} options={[{ label: 'All Types', value: 'all' }, { label: 'Income', value: 'income' }, { label: 'Expense', value: 'expense' }]} onChange={setTypeFilter} />
        <SelectField label="Category" value={categoryFilter} options={categoryOptions} onChange={setCategoryFilter} />
      </View>
      {isLoading ? <LoadingState /> : filteredTransactions.length === 0 ? <EmptyState title="No transactions found" description="Add your first transaction or adjust your filters." action={<Button label="Add transaction" onPress={openCreate} />} /> : (
        <SectionCard title={`${filteredTransactions.length} transaction${filteredTransactions.length === 1 ? '' : 's'}`}>
          {filteredTransactions.map((transaction) => {
            const category = categories.find((item) => item.id === transaction.categoryId);
            const isIncome = transaction.type === 'income';
            return (
              <View key={transaction.id} style={styles.row}>
                <View style={[styles.icon, { backgroundColor: isIncome ? '#DCFCE7' : '#FEE2E2' }]}><Text style={{ color: isIncome ? colors.income : colors.expense }}>{isIncome ? '↗' : '↘'}</Text></View>
                <View style={styles.rowMain}><Text style={styles.rowTitle}>{transaction.title}</Text><Text style={styles.rowMeta}>{transaction.occurredAt}  ·  {category?.name ?? 'Uncategorized'}</Text></View>
                <View style={styles.rowEnd}><Text style={[styles.amount, { color: isIncome ? colors.income : colors.expense }]}>{isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}</Text><View style={styles.rowActions}><Pressable onPress={() => openEdit(transaction)}><Text style={styles.action}>Edit</Text></Pressable><Pressable onPress={() => deleteTransaction(transaction.id)}><Text style={[styles.action, { color: colors.danger }]}>Delete</Text></Pressable></View></View>
              </View>
            );
          })}
        </SectionCard>
      )}
      {isFormOpen ? <ModalCard title={editingId ? 'Edit Transaction' : 'Add Transaction'} onClose={() => setIsFormOpen(false)}>
        <SelectField label="Type" value={form.type} options={[{ label: 'Income', value: 'income' }, { label: 'Expense', value: 'expense' }]} onChange={(type) => setForm((current) => ({ ...current, type, categoryId: categories.find((category) => category.type === type)?.id ?? '' }))} />
        <Field label="Description" value={form.title} onChangeText={(title) => setForm((current) => ({ ...current, title }))} placeholder="e.g. Salary or Lunch" error={errors.title} />
        <Field label="Amount (ETB)" value={form.amount} onChangeText={(amount) => setForm((current) => ({ ...current, amount }))} placeholder="0.00" keyboardType="numeric" error={errors.amount} />
        <SelectField label="Category" value={form.categoryId} options={formCategoryOptions} onChange={(categoryId) => setForm((current) => ({ ...current, categoryId }))} error={errors.categoryId} />
        <Field label="Date" value={form.occurredAt} onChangeText={(occurredAt) => setForm((current) => ({ ...current, occurredAt }))} placeholder="YYYY-MM-DD" error={errors.occurredAt} />
        <Button label={editingId ? 'Save changes' : 'Save transaction'} onPress={saveTransaction} />
      </ModalCard> : null}
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
});
