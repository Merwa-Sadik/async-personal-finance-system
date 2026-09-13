import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { register } from '../api';
import { useFinance } from '../context/FinanceContext';

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'Register'> };

const colors = {
  background: '#f3f5f7',
  white: '#ffffff',
  navy: '#0f172a',
  border: '#e2e8f0',
  text: '#0f172a',
  subtext: '#64748b',
  red: '#ef4444',
  field: '#f8fafc',
};

const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{
    fullName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const [requestError, setRequestError] = useState('');
  const { setUser } = useFinance();

  const validate = () => {
    const nextErrors: {
      fullName?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
    } = {};

    if (!fullName.trim()) {
      nextErrors.fullName = 'Full name is required';
    }

    if (!email.trim()) {
      nextErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      nextErrors.email = 'Enter a valid email';
    }

    if (!password.trim()) {
      nextErrors.password = 'Password is required';
    } else if (password.length < 6) {
      nextErrors.password = 'Password must be at least 6 characters';
    }

    if (!confirmPassword.trim()) {
      nextErrors.confirmPassword = 'Please confirm your password';
    } else if (confirmPassword !== password) {
      nextErrors.confirmPassword = 'Passwords do not match';
    }

    return nextErrors;
  };

  const handleSubmit = async () => {
    const nextErrors = validate();

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setRequestError('');
    try {
      const user = await register(fullName.trim(), email.trim(), password);
      setUser(user);
      navigation.navigate('Main');
    } catch (error) {
      setRequestError(error instanceof Error ? error.message : 'Unable to create account');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.cardWrap}>
          <View style={styles.card}>
            <View style={styles.logoRow}>
              <View style={styles.logoBadge}>
                <Text style={styles.logoText}>PF</Text>
              </View>
              <Text style={styles.brand}>PFMS</Text>
            </View>

            <Text style={styles.heading}>Create Your Account</Text>
            <Text style={styles.subtitle}>Start managing your finances today</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                value={fullName}
                onChangeText={(value) => {
                  setFullName(value);
                  setErrors((prev) => ({ ...prev, fullName: undefined }));
                }}
                placeholder="Alex Johnson"
                autoCapitalize="words"
                placeholderTextColor={colors.subtext}
                style={[styles.input, errors.fullName ? styles.inputError : null]}
              />
              {errors.fullName ? <Text style={styles.errorText}>{errors.fullName}</Text> : null}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                value={email}
                onChangeText={(value) => {
                  setEmail(value);
                  setErrors((prev) => ({ ...prev, email: undefined }));
                }}
                placeholder="you@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                placeholderTextColor={colors.subtext}
                style={[styles.input, errors.email ? styles.inputError : null]}
              />
              {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.passwordWrap}>
                <TextInput
                  value={password}
                  onChangeText={(value) => {
                    setPassword(value);
                    setErrors((prev) => ({ ...prev, password: undefined }));
                  }}
                  placeholder="••••••••"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholderTextColor={colors.subtext}
                  style={[styles.passwordInput, errors.password ? styles.inputError : null]}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword((value) => !value)}
                  style={styles.showButton}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={styles.showText}>{showPassword ? 'Hide' : 'Show'}</Text>
                </TouchableOpacity>
              </View>
              {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm Password</Text>
              <View style={styles.passwordWrap}>
                <TextInput
                  value={confirmPassword}
                  onChangeText={(value) => {
                    setConfirmPassword(value);
                    setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                  }}
                  placeholder="••••••••"
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholderTextColor={colors.subtext}
                  style={[styles.passwordInput, errors.confirmPassword ? styles.inputError : null]}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword((value) => !value)}
                  style={styles.showButton}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={styles.showText}>{showConfirmPassword ? 'Hide' : 'Show'}</Text>
                </TouchableOpacity>
              </View>
              {errors.confirmPassword ? (
                <Text style={styles.errorText}>{errors.confirmPassword}</Text>
              ) : null}
            </View>

            <TouchableOpacity style={styles.primaryButton} onPress={handleSubmit} activeOpacity={0.9}>
              <Text style={styles.primaryButtonText}>Create Account</Text>
            </TouchableOpacity>
            {requestError ? <Text style={styles.errorText}>{requestError}</Text> : null}

            <View style={styles.footerRow}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')} activeOpacity={0.8}>
                <Text style={styles.footerAction}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 32,
  },
  cardWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 430,
    backgroundColor: colors.white,
    borderRadius: 28,
    paddingVertical: 28,
    paddingHorizontal: 22,
    shadowColor: '#0f172a',
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  logoBadge: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  brand: {
    marginLeft: 10,
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: 1,
    color: colors.navy,
  },
  heading: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.navy,
    textAlign: 'center',
    marginTop: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.subtext,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 22,
  },
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.navy,
    marginBottom: 8,
  },
  input: {
    width: '100%',
    backgroundColor: colors.field,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.text,
  },
  passwordWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.field,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.text,
  },
  showButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  showText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.subtext,
  },
  inputError: {
    borderColor: colors.red,
  },
  errorText: {
    color: colors.red,
    fontSize: 12,
    marginTop: 6,
  },
  primaryButton: {
    width: '100%',
    backgroundColor: colors.navy,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  footerText: {
    fontSize: 13,
    color: colors.subtext,
  },
  footerAction: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.navy,
  },
});

export default RegisterScreen;
