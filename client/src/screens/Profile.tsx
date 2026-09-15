import React, { useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { useFinance } from '../context/FinanceContext';

export default function ProfileScreen() {
  const { user, setUser } = useFinance();
  const mobile = useWindowDimensions().width < 600;
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone);
  const [currency, setCurrency] = useState(user.currency);
  const [error, setError] = useState('');

  const openEditor = () => {
    setName(user.name); setEmail(user.email); setPhone(user.phone); setCurrency(user.currency); setError(''); setEditing(true);
  };

  const save = () => {
    if (!name.trim() || !/\S+@\S+\.\S+/.test(email)) { setError('Enter a name and valid email address.'); return; }
    setUser((current) => ({ ...current, name: name.trim(), email: email.trim(), phone: phone.trim(), currency: currency.trim() || 'ETB' }));
    setEditing(false);
  };

  return (
    <ScrollView style={styles.page} contentContainerStyle={[styles.content, mobile && styles.mobileContent]}>
      <Text style={styles.heading}>Profile</Text>
      <Text style={styles.subtitle}>Manage your personal and account information.</Text>

      <View style={[styles.profileCard, mobile && styles.mobileProfile]}>
        <View style={styles.avatar}><Text style={styles.avatarText}>{user.name.charAt(0) || '?'}</Text></View>
        <View style={styles.identity}>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.emailText}>{user.email}</Text>
          <Text style={styles.member}>Member since {user.memberSince}</Text>
        </View>
        <TouchableOpacity style={styles.edit} onPress={openEditor}>
          <Text style={styles.editText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Personal details</Text>
        <Info label="Full name" value={user.name} />
        <Info label="Email" value={user.email} />
        <Info label="Phone" value={user.phone || '—'} />
        <Info label="Currency" value={user.currency} />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Account status</Text>
        <Info label="Member since" value={user.memberSince} />
        <Info label="Budget alerts" value={user.budgetAlerts ? 'Enabled' : 'Disabled'} />
        <Text style={styles.note}>Security and notification preferences are managed from Settings.</Text>
      </View>

      <Modal visible={editing} transparent animationType="fade" onRequestClose={() => setEditing(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.overlay}>
          <View style={[styles.modal, mobile && styles.mobileModal]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit profile</Text>
              <TouchableOpacity onPress={() => setEditing(false)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Text style={styles.close}>×</Text>
              </TouchableOpacity>
            </View>
            <Field label="Full name" value={name} onChangeText={setName} />
            <Field label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
            <Field label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
            <Field label="Currency" value={currency} onChangeText={setCurrency} />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <View style={styles.actions}>
              <TouchableOpacity style={styles.cancel} onPress={() => setEditing(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.save} onPress={save}>
                <Text style={styles.saveText}>Save changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </ScrollView>
  );
}

const Field = ({ label, value, onChangeText, keyboardType }: { label: string; value: string; onChangeText: (v: string) => void; keyboardType?: 'email-address' | 'phone-pad' }) => (
  <View style={styles.fieldWrap}>
    <Text style={styles.formLabel}>{label}</Text>
    <TextInput value={value} onChangeText={onChangeText} keyboardType={keyboardType} style={styles.input} placeholderTextColor="#94a3b8" />
  </View>
);

const Info = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.info}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#f5f6f8' },
  content: { padding: 28, gap: 18 },
  mobileContent: { padding: 16, gap: 14 },
  heading: { color: '#14213d', fontSize: 28, fontWeight: '800' },
  subtitle: { color: '#718096', marginTop: 4 },

  profileCard: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: '#e6eaf0', padding: 22, flexWrap: 'wrap' },
  mobileProfile: { alignItems: 'flex-start' },
  avatar: { width: 58, height: 58, borderRadius: 29, backgroundColor: '#14213d', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: 24, fontWeight: '800' },
  identity: { flex: 1, minWidth: 140 },
  name: { color: '#14213d', fontSize: 17, fontWeight: '800' },
  emailText: { color: '#64748b', fontSize: 13, marginTop: 4 },
  member: { color: '#94a3b8', fontSize: 11, marginTop: 5 },
  edit: { borderColor: '#dbe4ff', borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 9 },
  editText: { color: '#4f7cff', fontWeight: '700', fontSize: 12 },

  card: { backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: '#e6eaf0', padding: 20 },
  cardTitle: { color: '#14213d', fontSize: 16, fontWeight: '800', marginBottom: 10 },
  info: { flexDirection: 'row', justifyContent: 'space-between', gap: 16, paddingVertical: 13, borderTopWidth: 1, borderTopColor: '#f0f2f5' },
  infoLabel: { color: '#64748b', fontSize: 13 },
  infoValue: { color: '#14213d', fontSize: 13, fontWeight: '700', flexShrink: 1, textAlign: 'right' },
  note: { color: '#94a3b8', fontSize: 12, marginTop: 12, lineHeight: 18 },

  overlay: { flex: 1, backgroundColor: 'rgba(15,23,42,.45)', alignItems: 'center', justifyContent: 'center', padding: 16 },
  modal: { width: '100%', maxWidth: 440, backgroundColor: '#fff', borderRadius: 16, padding: 24, gap: 4 },
  mobileModal: { padding: 18 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  modalTitle: { color: '#14213d', fontSize: 20, fontWeight: '800' },
  close: { color: '#64748b', fontSize: 28, lineHeight: 30 },
  fieldWrap: { marginTop: 10 },
  formLabel: { color: '#475569', fontSize: 12, fontWeight: '700', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#dfe5ed', borderRadius: 9, padding: 12, color: '#14213d', fontSize: 14 },
  error: { color: '#dc6262', fontSize: 12, marginTop: 6 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', flexWrap: 'wrap', gap: 10, marginTop: 16 },
  cancel: { borderWidth: 1, borderColor: '#dfe5ed', borderRadius: 9, paddingHorizontal: 16, paddingVertical: 12 },
  cancelText: { color: '#64748b', fontWeight: '700' },
  save: { backgroundColor: '#4f7cff', borderRadius: 9, paddingHorizontal: 16, paddingVertical: 12 },
  saveText: { color: '#fff', fontWeight: '800' },
});
