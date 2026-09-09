import type { ReactNode } from 'react';
import { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { colors, radii, spacing } from './theme';

export function ScreenShell({ title, subtitle, action, children }: { title: string; subtitle: string; action?: ReactNode; children: ReactNode }) {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.screenContent} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
        {action}
      </View>
      {children}
    </ScrollView>
  );
}

export function Button({ label, onPress, variant = 'primary' }: { label: string; onPress: () => void; variant?: 'primary' | 'secondary' | 'danger' | 'text' }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.button, styles[`button_${variant}`], pressed && styles.pressed]}>
      <Text style={[styles.buttonText, styles[`buttonText_${variant}`]]}>{label}</Text>
    </Pressable>
  );
}

export function Field({ label, value, onChangeText, placeholder, keyboardType = 'default', error }: { label: string; value: string; onChangeText: (value: string) => void; placeholder?: string; keyboardType?: 'default' | 'numeric'; error?: string }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={colors.mutedText} keyboardType={keyboardType} style={[styles.input, error && styles.inputError]} />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

export function SelectField<T extends string>({ label, value, options, onChange, error }: { label: string; value: T; options: { label: string; value: T }[]; onChange: (value: T) => void; error?: string }) {
  const [visible, setVisible] = useState(false);
  const selected = options.find((option) => option.value === value);

  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Pressable style={[styles.input, styles.select, error && styles.inputError]} onPress={() => setVisible(true)}>
        <Text style={selected ? styles.inputText : styles.placeholder}>{selected?.label ?? 'Select option'}</Text>
        <Text style={styles.chevron}>▼</Text>
      </Pressable>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setVisible(false)}>
          <View style={styles.optionSheet}>
            <Text style={styles.modalTitle}>{label}</Text>
            {options.map((option) => (
              <Pressable key={option.value} style={styles.option} onPress={() => { onChange(option.value); setVisible(false); }}>
                <Text style={styles.optionText}>{option.label}</Text>
                {option.value === value ? <Text style={styles.selectedMark}>✓</Text> : null}
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

export function ModalCard({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <Pressable accessibilityLabel="Close" onPress={onClose}><Text style={styles.close}>×</Text></Pressable>
          </View>
          <ScrollView keyboardShouldPersistTaps="handled">{children}</ScrollView>
        </View>
      </View>
    </Modal>
  );
}

export function SectionCard({ title, children }: { title?: string; children: ReactNode }) {
  return <View style={styles.card}>{title ? <Text style={styles.sectionTitle}>{title}</Text> : null}{children}</View>;
}

export function StatCard({ label, value, tone = 'default' }: { label: string; value: string; tone?: 'default' | 'income' | 'expense' | 'warning' }) {
  return <View style={styles.statCard}><Text style={styles.statLabel}>{label}</Text><Text style={[styles.statValue, tone !== 'default' && { color: colors[tone] }]}>{value}</Text></View>;
}

export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return <View style={styles.empty}><Text style={styles.emptyIcon}>□</Text><Text style={styles.emptyTitle}>{title}</Text><Text style={styles.emptyDescription}>{description}</Text>{action}</View>;
}

export function LoadingState() {
  return <View style={styles.loading}><ActivityIndicator color={colors.primary} /><Text style={styles.loadingText}>Loading your data...</Text></View>;
}

export function ProgressBar({ value, tone = colors.primary }: { value: number; tone?: string }) {
  return <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${Math.max(0, Math.min(value, 100))}%`, backgroundColor: tone }]} /></View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  screenContent: { padding: spacing.lg, paddingBottom: 48 },
  header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: spacing.lg },
  headerCopy: { flex: 1, paddingRight: spacing.md },
  title: { color: colors.text, fontSize: 28, fontWeight: '700' },
  subtitle: { color: colors.mutedText, fontSize: 14, marginTop: spacing.xs },
  button: { minHeight: 42, borderRadius: radii.sm, paddingHorizontal: spacing.md, alignItems: 'center', justifyContent: 'center' },
  button_primary: { backgroundColor: colors.primary },
  button_secondary: { backgroundColor: colors.primarySoft },
  button_danger: { backgroundColor: colors.danger },
  button_text: { backgroundColor: 'transparent', paddingHorizontal: spacing.sm },
  buttonText: { fontSize: 14, fontWeight: '700' },
  buttonText_primary: { color: colors.white },
  buttonText_secondary: { color: colors.primary },
  buttonText_danger: { color: colors.white },
  buttonText_text: { color: colors.primary },
  pressed: { opacity: 0.75 },
  card: { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: radii.md, padding: spacing.md, marginBottom: spacing.md },
  sectionTitle: { color: colors.text, fontSize: 16, fontWeight: '700', marginBottom: spacing.md },
  statCard: { flex: 1, minWidth: 140, backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: radii.md, padding: spacing.md, marginBottom: spacing.sm },
  statLabel: { color: colors.mutedText, fontSize: 12, marginBottom: spacing.xs },
  statValue: { color: colors.text, fontSize: 20, fontWeight: '700' },
  field: { marginBottom: spacing.md },
  fieldLabel: { color: colors.text, fontSize: 13, fontWeight: '700', marginBottom: spacing.xs },
  input: { minHeight: 46, borderColor: colors.border, borderWidth: 1, borderRadius: radii.sm, backgroundColor: colors.surface, color: colors.text, paddingHorizontal: spacing.md, fontSize: 15 },
  inputError: { borderColor: colors.danger },
  inputText: { color: colors.text, fontSize: 15 },
  placeholder: { color: colors.mutedText, fontSize: 15 },
  errorText: { color: colors.danger, fontSize: 12, marginTop: 4 },
  select: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 },
  chevron: { color: colors.mutedText, fontSize: 11 },
  modalBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(17, 24, 39, 0.42)' },
  modalCard: { maxHeight: '90%', backgroundColor: colors.background, borderTopLeftRadius: radii.lg, borderTopRightRadius: radii.lg, padding: spacing.lg },
  optionSheet: { backgroundColor: colors.surface, borderTopLeftRadius: radii.lg, borderTopRightRadius: radii.lg, padding: spacing.lg },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.lg },
  modalTitle: { color: colors.text, fontSize: 20, fontWeight: '700' },
  close: { color: colors.mutedText, fontSize: 30, lineHeight: 30 },
  option: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 48, borderBottomColor: colors.border, borderBottomWidth: 1 },
  optionText: { color: colors.text, fontSize: 15 },
  selectedMark: { color: colors.primary, fontWeight: '700' },
  empty: { alignItems: 'center', backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: radii.md, padding: spacing.xl },
  emptyIcon: { color: colors.primary, fontSize: 32, marginBottom: spacing.sm },
  emptyTitle: { color: colors.text, fontSize: 17, fontWeight: '700' },
  emptyDescription: { color: colors.mutedText, fontSize: 14, textAlign: 'center', marginVertical: spacing.sm },
  loading: { alignItems: 'center', padding: spacing.xl },
  loadingText: { color: colors.mutedText, marginTop: spacing.sm },
  progressTrack: { height: 8, backgroundColor: colors.border, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
});
