import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Button, EmptyState, Field, ModalCard, ScreenShell, SectionCard, SelectField } from '../shared';
import { colors, mockCategories, radii, spacing } from '../shared';
import type { Category, CategoryType } from './categories.types';

const initialForm = { name: '', type: 'expense' as CategoryType, icon: '•' };

export function CategoriesScreen() {
  const [categories, setCategories] = useState<Category[]>(mockCategories);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const openCreate = () => {
    setEditingId(null);
    setForm(initialForm);
    setErrors({});
    setIsFormOpen(true);
  };

  const openEdit = (category: Category) => {
    setEditingId(category.id);
    setForm({ name: category.name, type: category.type, icon: category.icon ?? '•' });
    setErrors({});
    setIsFormOpen(true);
  };

  const saveCategory = () => {
    const nextErrors: Record<string, string> = {};
    if (!form.name.trim()) nextErrors.name = 'Enter a category name.';
    if (categories.some((category) => category.id !== editingId && category.name.toLowerCase() === form.name.trim().toLowerCase() && category.type === form.type)) nextErrors.name = 'This category already exists.';
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    const nextCategory: Category = { id: editingId ?? `cat-${Date.now()}`, name: form.name.trim(), type: form.type, icon: form.icon.trim() || '•', color: form.type === 'income' ? colors.income : colors.expense };
    setCategories((current) => editingId ? current.map((item) => item.id === editingId ? nextCategory : item) : [...current, nextCategory]);
    setIsFormOpen(false);
  };

  const deleteCategory = (id: string) => {
    Alert.alert('Delete category?', 'Transactions using it will show as Uncategorized.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => setCategories((current) => current.filter((category) => category.id !== id)) },
    ]);
  };

  const renderGroup = (type: CategoryType) => {
    const group = categories.filter((category) => category.type === type);
    if (group.length === 0) return <EmptyState title={`No ${type} categories`} description="Create a category to organize your finances." action={<Button label={`Add ${type} category`} onPress={openCreate} />} />;
    return <SectionCard title={`${type === 'income' ? 'Income' : 'Expense'} categories`}>
      {group.map((category) => (
        <View key={category.id} style={styles.row}>
          <View style={[styles.icon, { backgroundColor: type === 'income' ? '#DCFCE7' : '#FEE2E2' }]}><Text style={{ color: category.color ?? colors.primary, fontSize: 17 }}>{category.icon ?? '•'}</Text></View>
          <Text style={styles.name}>{category.name}</Text>
          <Pressable onPress={() => openEdit(category)}><Text style={styles.action}>Edit</Text></Pressable>
          <Pressable onPress={() => deleteCategory(category.id)}><Text style={[styles.action, { color: colors.danger }]}>Delete</Text></Pressable>
        </View>
      ))}
    </SectionCard>;
  };

  return (
    <ScreenShell title="Categories" subtitle="Organize income and expenses" action={<Button label="+ Add category" onPress={openCreate} />}>
      {renderGroup('income')}
      {renderGroup('expense')}
      {isFormOpen ? <ModalCard title={editingId ? 'Edit Category' : 'Add Category'} onClose={() => setIsFormOpen(false)}>
        <Field label="Category name" value={form.name} onChangeText={(name) => setForm((current) => ({ ...current, name }))} placeholder="e.g. Groceries" error={errors.name} />
        <SelectField label="Category type" value={form.type} options={[{ label: 'Income', value: 'income' }, { label: 'Expense', value: 'expense' }]} onChange={(type) => setForm((current) => ({ ...current, type }))} />
        <Field label="Icon" value={form.icon} onChangeText={(icon) => setForm((current) => ({ ...current, icon }))} placeholder="e.g. ◈" />
        <Button label={editingId ? 'Save changes' : 'Save category'} onPress={saveCategory} />
      </ModalCard> : null}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  row: { alignItems: 'center', borderBottomColor: colors.border, borderBottomWidth: 1, flexDirection: 'row', paddingVertical: spacing.md },
  icon: { alignItems: 'center', borderRadius: radii.sm, height: 36, justifyContent: 'center', marginRight: spacing.sm, width: 36 },
  name: { color: colors.text, flex: 1, fontSize: 15, fontWeight: '700' },
  action: { color: colors.primary, fontSize: 12, fontWeight: '700', marginLeft: spacing.sm },
});




