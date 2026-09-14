import React, { useState } from 'react'
import { Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { useFinance } from '../context/FinanceContext'

const INCOME_CATEGORIES = ['Salary', 'Freelance', 'Investment', 'Business', 'Other']

const IncomeScreen: React.FC = () => {
  const { income, addTransaction, deleteTransaction } = useFinance()
  const [open, setOpen] = useState(false)
  const [source, setSource] = useState('')
  const [category, setCategory] = useState('Salary')
  const [customCategory, setCustomCategory] = useState('')
  const [amount, setAmount] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const total = income.reduce((sum, item) => sum + item.amount, 0)

  const submit = async () => {
    const numericAmount = Number(amount)
    const selectedCategory = category === 'Add category' ? customCategory.trim() : category
    if (!source.trim() || !selectedCategory || !Number.isFinite(numericAmount) || numericAmount <= 0) {
      setSaveError('Enter a source, category, and positive amount.')
      return
    }
    setSaving(true)
    setSaveError('')
    try {
      await addTransaction({ type: 'income', description: source.trim(), category: selectedCategory, amount: numericAmount, date: new Date().toISOString().slice(0, 10) })
      setSource('')
      setCategory('Salary')
      setCustomCategory('')
      setAmount('')
      setOpen(false)
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Unable to save income.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <View style={styles.header}><View><Text style={styles.heading}>Income</Text><Text style={styles.subtitle}>Track money coming in.</Text></View><TouchableOpacity style={styles.button} onPress={() => setOpen(true)}><Text style={styles.buttonText}>+ Add Income</Text></TouchableOpacity></View>
      <View style={styles.total}><Text style={styles.label}>Total income</Text><Text style={styles.totalValue}>{total.toLocaleString()} ETB</Text><Text style={styles.meta}>{income.length} entries</Text></View>
      <View style={styles.card}><Text style={styles.cardTitle}>Income transactions</Text>{income.length === 0 ? <Text style={styles.empty}>No income entries yet.</Text> : income.map((item) => <View style={styles.row} key={item.id}><View style={styles.main}><Text style={styles.rowTitle}>{item.description}</Text><Text style={styles.meta}>{item.category} · {item.date}</Text></View><View style={styles.end}><Text style={styles.amount}>+{item.amount.toLocaleString()} ETB</Text><TouchableOpacity onPress={() => void deleteTransaction(item.id)}><Text style={styles.delete}>Delete</Text></TouchableOpacity></View></View>)}</View>
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}><View style={styles.overlay}><View style={styles.modal}><View style={styles.modalHeader}><Text style={styles.cardTitle}>Add income</Text><TouchableOpacity onPress={() => setOpen(false)}><Text style={styles.close}>×</Text></TouchableOpacity></View><Field label="Source" value={source} onChangeText={setSource} placeholder="Salary or freelance" /><CategoryPicker value={category} options={INCOME_CATEGORIES} onChange={setCategory} />{category === 'Add category' ? <><Field label="New category" value={customCategory} onChangeText={setCustomCategory} placeholder="Enter a category" /><TouchableOpacity style={styles.categoryButton} onPress={() => customCategory.trim() && setCategory(customCategory.trim())}><Text style={styles.categoryButtonText}>Save category</Text></TouchableOpacity></> : null}<Field label="Amount" value={amount} onChangeText={setAmount} placeholder="0.00" keyboardType="numeric" />{saveError ? <Text style={styles.error}>{saveError}</Text> : null}<TouchableOpacity style={[styles.button, saving && styles.disabledButton]} onPress={() => void submit} disabled={saving}><Text style={styles.buttonText}>{saving ? 'Saving...' : 'Save income'}</Text></TouchableOpacity></View></View></Modal>
    </ScrollView>
  )
}

const CategoryPicker = ({ value, options, onChange }: { value: string; options: string[]; onChange: (value: string) => void }) => { const [expanded, setExpanded] = useState(false); const choices = [...options.filter((item) => item !== 'Other'), 'Other', 'Add category']; return <View style={styles.field}><Text style={styles.fieldLabel}>Category</Text><TouchableOpacity style={styles.select} onPress={() => setExpanded((current) => !current)}><Text style={styles.selectText}>{value}</Text><Text style={styles.chevron}>{expanded ? '▴' : '▾'}</Text></TouchableOpacity>{expanded ? <View style={styles.options}>{choices.map((choice) => <TouchableOpacity key={choice} style={styles.option} onPress={() => { onChange(choice); setExpanded(false) }}><Text style={[styles.optionText, choice === 'Add category' && styles.addCategory]}>{choice === 'Add category' ? '+ Add category' : choice}</Text></TouchableOpacity>)}</View> : null}</View> }
const Field = ({ label, value, onChangeText, placeholder, keyboardType }: { label: string; value: string; onChangeText: (value: string) => void; placeholder: string; keyboardType?: 'numeric' }) => <View style={styles.field}><Text style={styles.fieldLabel}>{label}</Text><TextInput style={styles.input} value={value} onChangeText={onChangeText} placeholder={placeholder} keyboardType={keyboardType} /></View>
const styles = StyleSheet.create({ page: { flex: 1, backgroundColor: '#f5f6f8' }, content: { padding: 28, gap: 18 }, header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16 }, heading: { fontSize: 28, fontWeight: '800', color: '#14213d' }, subtitle: { color: '#718096', marginTop: 5 }, button: { backgroundColor: '#14213d', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 10 }, categoryButton: { backgroundColor: '#e8efff', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, alignSelf: 'flex-start' }, categoryButtonText: { color: '#315dcc', fontWeight: '700' }, disabledButton: { opacity: 0.6 }, buttonText: { color: '#fff', fontWeight: '700' }, total: { backgroundColor: '#eefbf5', borderColor: '#c9f0db', borderWidth: 1, borderRadius: 14, padding: 22 }, label: { color: '#38795b', fontWeight: '600' }, totalValue: { color: '#14213d', fontSize: 30, fontWeight: '800', marginTop: 6 }, meta: { color: '#94a3b8', fontSize: 12, marginTop: 4 }, card: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e6eaf0', borderRadius: 14, padding: 22 }, cardTitle: { color: '#14213d', fontSize: 17, fontWeight: '800' }, empty: { color: '#94a3b8', paddingVertical: 20 }, row: { minHeight: 66, borderTopWidth: 1, borderTopColor: '#f0f2f5', flexDirection: 'row', alignItems: 'center', gap: 12 }, main: { flex: 1 }, rowTitle: { color: '#14213d', fontWeight: '700' }, end: { alignItems: 'flex-end', gap: 4 }, amount: { color: '#21b573', fontWeight: '800' }, delete: { color: '#94a3b8', fontSize: 11 }, overlay: { flex: 1, backgroundColor: 'rgba(15,23,42,.45)', justifyContent: 'center', padding: 20 }, modal: { backgroundColor: '#fff', borderRadius: 16, padding: 22, gap: 12 }, modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, close: { fontSize: 28, color: '#718096' }, field: { gap: 6 }, fieldLabel: { color: '#14213d', fontWeight: '600' }, input: { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10, padding: 12, color: '#14213d' }, error: { color: '#dc2626', fontSize: 12 }, select: { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10, padding: 12, flexDirection: 'row', justifyContent: 'space-between' }, selectText: { color: '#14213d' }, chevron: { color: '#64748b' }, options: { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10, overflow: 'hidden' }, option: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' }, optionText: { color: '#14213d' }, addCategory: { color: '#315dcc', fontWeight: '700' } })

export default IncomeScreen
