import { useEffect, useMemo, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { createTransaction, getTransactions, removeTransaction, updateTransaction } from '../../api';
import { Button, EmptyState, LoadingState, ScreenShell } from '../shared';
import { colors, formatCurrency, radii, spacing } from '../shared';
import type { Transaction, TransactionType } from './transactions.types';

type FilterType = 'all' | TransactionType;

const CATEGORIES = {
  income: ['Salary', 'Freelance', 'Investment', 'Business', 'Other'],
  expense: ['Food', 'Housing', 'Transport', 'Health', 'Education', 'Entertainment', 'Shopping', 'Other'],
};

const initialForm = { title: '', amount: '', category: 'Food', occurredAt: new Date().toISOString().slice(0, 10), type: 'expense' as TransactionType };

export function TransactionsScreen() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<FilterType>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(initialForm);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);

  const load = () => {
    setIsLoading(true);
    getTransactions()
      .then((rows) => setTransactions(rows.map((r) => ({
        id: String(r.id), title: r.description ?? r.category,
        amount: Number(r.amount), type: r.type, category: r.category, occurredAt: r.date,
      }))))
      .catch((e: Error) => setError(e.message))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => transactions.filter((t) => {
    const matchesQuery = `${t.title} ${t.category}`.toLowerCase().includes(query.toLowerCase().trim());
    const matchesType = typeFilter === 'all' || t.type === typeFilter;
    return matchesQuery && matchesType;
  }), [transactions, query, typeFilter]);

  const openCreate = () => { setEditingId(null); setForm(initialForm); setFormErrors({}); setIsFormOpen(true); };
  const openEdit = (t: Transaction) => {
    setEditingId(t.id);
    setForm({ title: t.title, amount: String(t.amount), category: t.category, occurredAt: t.occurredAt, type: t.type });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const save = async () => {
    const amount = Number(form.amount);
    const next: Record<string, string> = {};
    if (!form.title.trim()) next.title = 'Description is required.';
    if (!Number.isFinite(amount) || amount <= 0) next.amount = 'Enter a positive amount.';
    if (!form.occurredAt) next.occurredAt = 'Date is required.';
    if (Object.keys(next).length > 0) { setFormErrors(next); return; }
    setSaving(true);
    try {
      const payload = { type: form.type, category: form.category, amount, description: form.title.trim(), date: form.occurredAt };
      if (editingId) {
        const u = await updateTransaction(Number(editingId), payload);
        setTransactions((cur) => cur.map((t) => t.id === editingId ? { id: String(u.id), title: u.description ?? u.category, amount: Number(u.amount), type: u.type, category: u.category, occurredAt: u.date } : t));
      } else {
        const c = await createTransaction(payload);
        setTransactions((cur) => [{ id: String(c.id), title: c.description ?? c.category, amount: Number(c.amount), type: c.type, category: c.category, occurredAt: c.date }, ...cur]);
      }
      setIsFormOpen(false);
    } catch (e: unknown) {
      setFormErrors({ submit: e instanceof Error ? e.message : 'Failed to save.' });
    } finally { setSaving(false); }
  };

  const del = (id: string) => {
    Alert.alert('Delete transaction?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try { await removeTransaction(Number(id)); setTransactions((cur) => cur.filter((t) => t.id !== id)); }
        catch (e: unknown) { Alert.alert('Error', e instanceof Error ? e.message : 'Failed to delete.'); }
      }},
    ]);
  };

  const income = transactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expense = transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  return (
    <ScreenShell title="Transactions" subtitle="All your financial activity" action={<Button label="+ Add" onPress={openCreate} />}>
      {/* Summary strip */}
      <View style={styles.summaryRow}>
        <View style={[styles.summaryCard, { borderLeftColor: colors.income }]}>
          <Text style={styles.summaryLabel}>Total Income</Text>
          <Text style={[styles.summaryValue, { color: colors.income }]}>{formatCurrency(income)}</Text>
        </View>
        <View style={[styles.summaryCard, { borderLeftColor: colors.expense }]}>
          <Text style={styles.summaryLabel}>Total Expenses</Text>
          <Text style={[styles.summaryValue, { color: colors.expense }]}>{formatCurrency(expense)}</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <Text style={styles.searchIcon}>⌕</Text>
        <TextInput value={query} onChangeText={setQuery} placeholder="Search transactions..." placeholderTextColor={colors.mutedText} style={styles.searchInput} />
      </View>

      {/* Type filter pills */}
      <View style={styles.pills}>
        {(['all', 'income', 'expense'] as const).map((t) => (
          <TouchableOpacity key={t} onPress={() => setTypeFilter(t)} style={[styles.pill, typeFilter === t && styles.pillActive]}>
            <Text style={[styles.pillText, typeFilter === t && styles.pillTextActive]}>{t === 'all' ? 'All' : t.charAt(0).toUpperCase() + t.slice(1)}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? <LoadingState /> : error ? (
        <EmptyState title="Failed to load" description={error} action={<Button label="Retry" onPress={load} />} />
      ) : filtered.length === 0 ? (
        <EmptyState title="No transactions" description="Add your first transaction to get started." action={<Button label="+ Add transaction" onPress={openCreate} />} />
      ) : (
        <View style={styles.list}>
          {filtered.map((t) => {
            const isIncome = t.type === 'income';
            return (
              <View key={t.id} style={styles.card}>
                <View style={[styles.cardAccent, { backgroundColor: isIncome ? colors.income : colors.expense }]} />
                <View style={[styles.typeIcon, { backgroundColor: isIncome ? '#DCFCE7' : '#FEE2E2' }]}>
                  <Text style={{ color: isIncome ? colors.income : colors.expense, fontSize: 16 }}>{isIncome ? '↗' : '↘'}</Text>
                </View>
                <View style={styles.cardBody}>
                  <Text style={styles.cardTitle}>{t.title}</Text>
                  <Text style={styles.cardMeta}>{t.occurredAt} · {t.category}</Text>
                </View>
                <View style={styles.cardRight}>
                  <Text style={[styles.cardAmount, { color: isIncome ? colors.income : colors.expense }]}>
                    {isIncome ? '+' : '-'}{formatCurrency(t.amount)}
                  </Text>
                  <View style={styles.cardActions}>
                    <Pressable onPress={() => openEdit(t)} style={styles.actionBtn}><Text style={styles.actionEdit}>Edit</Text></Pressable>
                    <Pressable onPress={() => del(t.id)} style={styles.actionBtn}><Text style={styles.actionDelete}>Delete</Text></Pressable>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* Form Modal */}
      <Modal visible={isFormOpen} transparent animationType="slide" onRequestClose={() => setIsFormOpen(false)}>
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{editingId ? 'Edit Transaction' : 'New Transaction'}</Text>
              <Pressable onPress={() => setIsFormOpen(false)} style={styles.closeBtn}><Text style={styles.closeText}>✕</Text></Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              {/* Type toggle */}
              <Text style={styles.fieldLabel}>Type</Text>
              <View style={styles.typeToggle}>
                {(['income', 'expense'] as TransactionType[]).map((t) => (
                  <TouchableOpacity key={t} onPress={() => setForm((c) => ({ ...c, type: t, category: CATEGORIES[t][0] }))}
                    style={[styles.typeBtn, form.type === t && (t === 'income' ? styles.typeBtnIncome : styles.typeBtnExpense)]}>
                    <Text style={[styles.typeBtnText, form.type === t && styles.typeBtnTextActive]}>
                      {t === 'income' ? '↗ Income' : '↘ Expense'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Description */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Description</Text>
                <TextInput
                  value={form.title} onChangeText={(v) => setForm((c) => ({ ...c, title: v }))}
                  placeholder="e.g. Monthly salary" placeholderTextColor={colors.mutedText}
                  style={[styles.input, formErrors.title && styles.inputError]}
                />
                {formErrors.title ? <Text style={styles.fieldError}>{formErrors.title}</Text> : null}
              </View>

              {/* Amount */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Amount (ETB)</Text>
                <View style={styles.amountWrap}>
                  <Text style={styles.amountPrefix}>ETB</Text>
                  <TextInput
                    value={form.amount} onChangeText={(v) => setForm((c) => ({ ...c, amount: v }))}
                    placeholder="0.00" placeholderTextColor={colors.mutedText} keyboardType="numeric"
                    style={[styles.amountInput, formErrors.amount && styles.inputError]}
                  />
                </View>
                {formErrors.amount ? <Text style={styles.fieldError}>{formErrors.amount}</Text> : null}
              </View>

              {/* Category */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Category</Text>
                <View style={styles.categoryGrid}>
                  {CATEGORIES[form.type].map((cat) => (
                    <TouchableOpacity key={cat} onPress={() => setForm((c) => ({ ...c, category: cat }))}
                      style={[styles.catChip, form.category === cat && styles.catChipActive]}>
                      <Text style={[styles.catChipText, form.category === cat && styles.catChipTextActive]}>{cat}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Date */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Date</Text>
                <TextInput
                  value={form.occurredAt} onChangeText={(v) => setForm((c) => ({ ...c, occurredAt: v }))}
                  placeholder="YYYY-MM-DD" placeholderTextColor={colors.mutedText}
                  style={[styles.input, formErrors.occurredAt && styles.inputError]}
                />
                {formErrors.occurredAt ? <Text style={styles.fieldError}>{formErrors.occurredAt}</Text> : null}
              </View>

              {formErrors.submit ? <Text style={styles.submitError}>{formErrors.submit}</Text> : null}

              <View style={styles.formActions}>
                <TouchableOpacity onPress={() => setIsFormOpen(false)} style={styles.cancelBtn}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { void save(); }} disabled={saving}
                  style={[styles.saveBtn, form.type === 'income' ? styles.saveBtnIncome : styles.saveBtnExpense, saving && styles.saveBtnDisabled]}>
                  <Text style={styles.saveBtnText}>{saving ? 'Saving…' : editingId ? 'Save changes' : 'Add transaction'}</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  summaryRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  summaryCard: { flex: 1, backgroundColor: colors.surface, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, borderLeftWidth: 4, padding: spacing.md },
  summaryLabel: { color: colors.mutedText, fontSize: 11, fontWeight: '600', marginBottom: 4 },
  summaryValue: { fontSize: 17, fontWeight: '800' },
  searchWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, paddingHorizontal: spacing.md, marginBottom: spacing.sm },
  searchIcon: { color: colors.mutedText, fontSize: 18, marginRight: 8 },
  searchInput: { flex: 1, minHeight: 44, color: colors.text, fontSize: 14 },
  pills: { flexDirection: 'row', gap: spacing.xs, marginBottom: spacing.md },
  pill: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  pillActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  pillText: { color: colors.mutedText, fontSize: 13, fontWeight: '600' },
  pillTextActive: { color: colors.white },
  list: { gap: spacing.sm },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  cardAccent: { width: 4, alignSelf: 'stretch' },
  typeIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginHorizontal: spacing.sm },
  cardBody: { flex: 1, paddingVertical: spacing.md },
  cardTitle: { color: colors.text, fontSize: 14, fontWeight: '700' },
  cardMeta: { color: colors.mutedText, fontSize: 12, marginTop: 3 },
  cardRight: { alignItems: 'flex-end', paddingRight: spacing.md, paddingVertical: spacing.sm },
  cardAmount: { fontSize: 14, fontWeight: '800' },
  cardActions: { flexDirection: 'row', gap: spacing.xs, marginTop: 6 },
  actionBtn: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  actionEdit: { color: colors.primary, fontSize: 11, fontWeight: '700' },
  actionDelete: { color: colors.danger, fontSize: 11, fontWeight: '700' },
  // Modal
  overlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.5)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: colors.background, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: spacing.lg, paddingBottom: 36, maxHeight: '92%' },
  sheetHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border, alignSelf: 'center', marginTop: 12, marginBottom: spacing.md },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
  sheetTitle: { color: colors.text, fontSize: 20, fontWeight: '800' },
  closeBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  closeText: { color: colors.mutedText, fontSize: 14, fontWeight: '700' },
  typeToggle: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  typeBtn: { flex: 1, paddingVertical: 12, borderRadius: radii.sm, borderWidth: 1.5, borderColor: colors.border, alignItems: 'center' },
  typeBtnIncome: { backgroundColor: '#DCFCE7', borderColor: colors.income },
  typeBtnExpense: { backgroundColor: '#FEE2E2', borderColor: colors.expense },
  typeBtnText: { color: colors.mutedText, fontWeight: '700', fontSize: 14 },
  typeBtnTextActive: { color: colors.text },
  fieldGroup: { marginBottom: spacing.md },
  fieldLabel: { color: colors.text, fontSize: 13, fontWeight: '700', marginBottom: spacing.xs },
  input: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radii.sm, paddingHorizontal: spacing.md, minHeight: 46, color: colors.text, fontSize: 15 },
  inputError: { borderColor: colors.danger },
  fieldError: { color: colors.danger, fontSize: 12, marginTop: 4 },
  amountWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radii.sm, overflow: 'hidden' },
  amountPrefix: { paddingHorizontal: spacing.md, color: colors.mutedText, fontWeight: '700', fontSize: 14, borderRightWidth: 1, borderRightColor: colors.border, paddingVertical: 12 },
  amountInput: { flex: 1, paddingHorizontal: spacing.md, minHeight: 46, color: colors.text, fontSize: 15 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  catChip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  catChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  catChipText: { color: colors.mutedText, fontSize: 13, fontWeight: '600' },
  catChipTextActive: { color: colors.white },
  submitError: { color: colors.danger, fontSize: 13, marginBottom: spacing.sm, textAlign: 'center' },
  formActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  cancelBtn: { flex: 1, paddingVertical: 14, borderRadius: radii.sm, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  cancelText: { color: colors.mutedText, fontWeight: '700', fontSize: 15 },
  saveBtn: { flex: 2, paddingVertical: 14, borderRadius: radii.sm, alignItems: 'center' },
  saveBtnIncome: { backgroundColor: colors.income },
  saveBtnExpense: { backgroundColor: colors.expense },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { color: colors.white, fontWeight: '800', fontSize: 15 },
});
