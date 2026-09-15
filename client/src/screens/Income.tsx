import React, { useState } from 'react'
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { useFinance } from '../context/FinanceContext'

const CATEGORIES = ['Salary', 'Freelance', 'Investment', 'Business', 'Other']

const IncomeScreen: React.FC = () => {
  const { income, addTransaction, deleteTransaction } = useFinance()
  const [open, setOpen] = useState(false)
  const [source, setSource] = useState('')
  const [category, setCategory] = useState('Salary')
  const [amount, setAmount] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const total = income.reduce((sum, item) => sum + item.amount, 0)

  const reset = () => { setSource(''); setCategory('Salary'); setAmount(''); setSaveError('') }
  const close = () => { reset(); setOpen(false) }

  const submit = async () => {
    const numericAmount = Number(amount)
    if (!source.trim() || !Number.isFinite(numericAmount) || numericAmount <= 0) {
      setSaveError('Enter a source and a positive amount.')
      return
    }
    setSaving(true)
    setSaveError('')
    try {
      await addTransaction({ type: 'income', description: source.trim(), category, amount: numericAmount, date: new Date().toISOString().slice(0, 10) })
      close()
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Unable to save income.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.heading}>Income</Text>
          <Text style={styles.subtitle}>Track money coming in.</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => { reset(); setOpen(true) }}>
          <Text style={styles.addBtnText}>+ Add Income</Text>
        </TouchableOpacity>
      </View>

      {/* Summary */}
      <View style={styles.summary}>
        <Text style={styles.summaryLabel}>Total income</Text>
        <Text style={styles.summaryValue}>{total.toLocaleString()} ETB</Text>
        <Text style={styles.summaryMeta}>{income.length} {income.length === 1 ? 'entry' : 'entries'}</Text>
      </View>

      {/* List */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Income transactions</Text>
        {income.length === 0
          ? <Text style={styles.empty}>No income entries yet.</Text>
          : income.map((item) => (
            <View style={styles.row} key={item.id}>
              <View style={styles.rowIcon}><Text style={styles.rowIconText}>↗</Text></View>
              <View style={styles.rowMain}>
                <Text style={styles.rowTitle}>{item.description}</Text>
                <Text style={styles.rowMeta}>{item.category} · {item.date}</Text>
              </View>
              <View style={styles.rowEnd}>
                <Text style={styles.rowAmount}>+{item.amount.toLocaleString()} ETB</Text>
                <TouchableOpacity onPress={() => void deleteTransaction(item.id)}>
                  <Text style={styles.deleteBtn}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        }
      </View>

      {/* Modal */}
      <Modal visible={open} transparent animationType="fade" onRequestClose={close}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.overlay}>
          <Pressable style={styles.backdrop} onPress={close} />
          <View style={styles.modal}>
            {/* Modal header */}
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Add Income</Text>
                <Text style={styles.modalSubtitle}>Record a new income entry</Text>
              </View>
              <Pressable style={styles.closeBtn} onPress={close}>
                <Text style={styles.closeBtnText}>✕</Text>
              </Pressable>
            </View>

            <View style={styles.divider} />

            {/* Fields */}
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Source</Text>
              <TextInput
                style={styles.input}
                value={source}
                onChangeText={setSource}
                placeholder="e.g. Monthly salary"
                placeholderTextColor="#94a3b8"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Category</Text>
              <View style={styles.chips}>
                {CATEGORIES.map((c) => (
                  <Pressable key={c} style={[styles.chip, category === c && styles.chipActive]} onPress={() => setCategory(c)}>
                    <Text style={[styles.chipText, category === c && styles.chipTextActive]}>{c}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Amount (ETB)</Text>
              <TextInput
                style={styles.input}
                value={amount}
                onChangeText={setAmount}
                placeholder="0.00"
                placeholderTextColor="#94a3b8"
                keyboardType="numeric"
              />
            </View>

            {saveError ? <Text style={styles.error}>{saveError}</Text> : null}

            {/* Actions */}
            <View style={styles.actions}>
              <Pressable style={styles.cancelBtn} onPress={close}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </Pressable>
              <Pressable style={[styles.saveBtn, saving && styles.saveBtnDisabled]} onPress={() => { void submit() }} disabled={saving}>
                <Text style={styles.saveBtnText}>{saving ? 'Saving...' : 'Save Income'}</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#f5f6f8' },
  content: { padding: 28, gap: 18 },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16 },
  heading: { fontSize: 28, fontWeight: '800', color: '#14213d' },
  subtitle: { color: '#718096', marginTop: 4 },
  addBtn: { backgroundColor: '#14213d', paddingHorizontal: 18, paddingVertical: 12, borderRadius: 10 },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  summary: { backgroundColor: '#eefbf5', borderColor: '#c9f0db', borderWidth: 1, borderRadius: 14, padding: 22 },
  summaryLabel: { color: '#38795b', fontWeight: '600', fontSize: 13 },
  summaryValue: { color: '#14213d', fontSize: 30, fontWeight: '800', marginTop: 6 },
  summaryMeta: { color: '#94a3b8', fontSize: 12, marginTop: 4 },

  card: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e6eaf0', borderRadius: 14, padding: 22 },
  cardTitle: { color: '#14213d', fontSize: 17, fontWeight: '800', marginBottom: 4 },
  empty: { color: '#94a3b8', paddingVertical: 20 },
  row: { minHeight: 64, borderTopWidth: 1, borderTopColor: '#f0f2f5', flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#dcfce7', alignItems: 'center', justifyContent: 'center' },
  rowIconText: { color: '#16a34a', fontSize: 15, fontWeight: '800' },
  rowMain: { flex: 1 },
  rowTitle: { color: '#14213d', fontWeight: '700', fontSize: 14 },
  rowMeta: { color: '#94a3b8', fontSize: 12, marginTop: 3 },
  rowEnd: { alignItems: 'flex-end', gap: 4 },
  rowAmount: { color: '#21b573', fontWeight: '800', fontSize: 14 },
  deleteBtn: { color: '#94a3b8', fontSize: 11 },

  // Modal
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(15,23,42,0.5)' },
  modal: {
    width: '90%',
    maxWidth: 440,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#14213d' },
  modalSubtitle: { fontSize: 13, color: '#94a3b8', marginTop: 3 },
  closeBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' },
  closeBtnText: { color: '#64748b', fontSize: 13, fontWeight: '700' },
  divider: { height: 1, backgroundColor: '#f0f2f5', marginVertical: 18 },

  field: { marginBottom: 16 },
  fieldLabel: { fontSize: 13, fontWeight: '700', color: '#374151', marginBottom: 8 },
  input: {
    height: 48,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 15,
    color: '#14213d',
    backgroundColor: '#fafafa',
  },

  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: '#e5e7eb', backgroundColor: '#f8fafc' },
  chipActive: { backgroundColor: '#14213d', borderColor: '#14213d' },
  chipText: { fontSize: 13, fontWeight: '600', color: '#64748b' },
  chipTextActive: { color: '#fff' },

  error: { color: '#dc2626', fontSize: 12, marginBottom: 12 },

  actions: { flexDirection: 'row', gap: 10, marginTop: 4 },
  cancelBtn: { flex: 1, height: 48, borderRadius: 10, borderWidth: 1.5, borderColor: '#e5e7eb', alignItems: 'center', justifyContent: 'center' },
  cancelBtnText: { color: '#64748b', fontWeight: '700', fontSize: 14 },
  saveBtn: { flex: 2, height: 48, borderRadius: 10, backgroundColor: '#21b573', alignItems: 'center', justifyContent: 'center' },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { color: '#fff', fontWeight: '800', fontSize: 14 },
})

export default IncomeScreen
