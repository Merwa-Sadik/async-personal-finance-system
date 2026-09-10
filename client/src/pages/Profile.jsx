import { useState } from 'react'
import { User, Mail, Phone, DollarSign, Lock, Bell, Trash2, CheckCircle, Eye, EyeOff, ShieldCheck } from 'lucide-react'
import { useFinance } from '../context/FinanceContext'

const Section = ({ title, subtitle, children }) => (
  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
    <div className="mb-5">
      <h2 className="text-base font-bold text-[#1e3a5f]">{title}</h2>
      {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
    </div>
    {children}
  </div>
)

const Field = ({ label, icon: Icon, error, children }) => (
  <div>
    <label className="block text-sm font-medium text-[#1e3a5f] mb-1">{label}</label>
    <div className="relative">
      {Icon && <Icon size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />}
      {children}
    </div>
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
)

const inputCls = (hasIcon, error) =>
  `w-full rounded-lg border px-4 py-2.5 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-[#1e3a5f] transition
  ${hasIcon ? 'pl-9' : ''} ${error ? 'border-red-400' : 'border-gray-300'}`

const Profile = () => {
  const { user, setUser, income, expenses } = useFinance()

  // Personal info form
  const [info, setInfo] = useState({ name: user.name, email: user.email, phone: user.phone, currency: user.currency })
  const [infoErrors, setInfoErrors] = useState({})
  const [infoSaved, setInfoSaved] = useState(false)

  // Password form
  const [pwd, setPwd] = useState({ current: '', newPwd: '', confirm: '' })
  const [pwdErrors, setPwdErrors] = useState({})
  const [pwdSaved, setPwdSaved] = useState(false)
  const [showPwd, setShowPwd] = useState({ current: false, newPwd: false, confirm: false })

  // Preferences
  const [budgetAlerts, setBudgetAlerts] = useState(user.budgetAlerts)
  const [prefSaved, setPrefSaved] = useState(false)

  // Stats
  const totalTx = income.length + expenses.length
  const totalIncome = income.reduce((s, r) => s + r.amount, 0)
  const totalExpenses = expenses.reduce((s, r) => s + r.amount, 0)

  // ── Info save ─────────────────────────────────────────────────────
  const validateInfo = () => {
    const e = {}
    if (!info.name.trim()) e.name = 'Name is required'
    if (!info.email) e.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(info.email)) e.email = 'Enter a valid email'
    if (info.phone && !/^\+?[\d\s\-()]{7,}$/.test(info.phone)) e.phone = 'Enter a valid phone number'
    return e
  }

  const handleInfoSave = (e) => {
    e.preventDefault()
    const errs = validateInfo()
    if (Object.keys(errs).length) return setInfoErrors(errs)
    setUser((p) => ({ ...p, ...info }))
    setInfoErrors({})
    setInfoSaved(true)
    setTimeout(() => setInfoSaved(false), 3000)
  }

  // ── Password save ─────────────────────────────────────────────────
  const validatePwd = () => {
    const e = {}
    if (!pwd.current) e.current = 'Current password is required'
    if (!pwd.newPwd) e.newPwd = 'New password is required'
    else if (pwd.newPwd.length < 6) e.newPwd = 'At least 6 characters'
    if (!pwd.confirm) e.confirm = 'Please confirm your password'
    else if (pwd.confirm !== pwd.newPwd) e.confirm = 'Passwords do not match'
    return e
  }

  const handlePwdSave = (e) => {
    e.preventDefault()
    const errs = validatePwd()
    if (Object.keys(errs).length) return setPwdErrors(errs)
    setPwdErrors({})
    setPwd({ current: '', newPwd: '', confirm: '' })
    setPwdSaved(true)
    setTimeout(() => setPwdSaved(false), 3000)
  }

  // ── Preferences save ──────────────────────────────────────────────
  const handlePrefSave = () => {
    setUser((p) => ({ ...p, budgetAlerts }))
    setPrefSaved(true)
    setTimeout(() => setPrefSaved(false), 3000)
  }

  const pwdFields = [
    { key: 'current', label: 'Current Password' },
    { key: 'newPwd', label: 'New Password' },
    { key: 'confirm', label: 'Confirm New Password' },
  ]

  return (
    <div className="space-y-6 max-w-3xl mx-auto">

      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-[#1e3a5f]">Profile</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage your account settings and preferences</p>
      </div>

      {/* Avatar + Stats */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col sm:flex-row items-center gap-6">
        <div className="relative shrink-0">
          <div className="w-20 h-20 rounded-full bg-[#1e3a5f] flex items-center justify-center">
            <span className="text-white text-3xl font-bold">{user.name.charAt(0)}</span>
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-green-500 border-2 border-white" title="Online" />
        </div>
        <div className="flex-1 text-center sm:text-left">
          <h2 className="text-xl font-bold text-[#1e3a5f]">{user.name}</h2>
          <p className="text-sm text-gray-500">{user.email}</p>
          <p className="text-xs text-gray-400 mt-1">
            Member since {new Date(user.memberSince).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="grid grid-cols-3 gap-4 text-center">
          {[
            { label: 'Transactions', value: totalTx },
            { label: 'Total Income', value: `${(totalIncome / 1000).toFixed(1)}k` },
            { label: 'Total Spent', value: `${(totalExpenses / 1000).toFixed(1)}k` },
          ].map(({ label, value }) => (
            <div key={label} className="bg-gray-50 rounded-xl px-4 py-3">
              <p className="text-lg font-bold text-[#1e3a5f]">{value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Personal Info */}
      <Section title="Personal Information" subtitle="Update your name, email and contact details">
        <form onSubmit={handleInfoSave} noValidate className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Full Name" icon={User} error={infoErrors.name}>
              <input
                value={info.name} onChange={(e) => { setInfo((p) => ({ ...p, name: e.target.value })); setInfoErrors((p) => ({ ...p, name: '' })) }}
                placeholder="Full name"
                className={inputCls(true, infoErrors.name)}
                style={{ paddingLeft: '2.25rem' }}
              />
            </Field>
            <Field label="Email Address" icon={Mail} error={infoErrors.email}>
              <input
                type="email" value={info.email} onChange={(e) => { setInfo((p) => ({ ...p, email: e.target.value })); setInfoErrors((p) => ({ ...p, email: '' })) }}
                placeholder="you@example.com"
                className={inputCls(true, infoErrors.email)}
                style={{ paddingLeft: '2.25rem' }}
              />
            </Field>
            <Field label="Phone Number" icon={Phone} error={infoErrors.phone}>
              <input
                value={info.phone} onChange={(e) => { setInfo((p) => ({ ...p, phone: e.target.value })); setInfoErrors((p) => ({ ...p, phone: '' })) }}
                placeholder="+1 234 567 8900"
                className={inputCls(true, infoErrors.phone)}
                style={{ paddingLeft: '2.25rem' }}
              />
            </Field>
            <Field label="Currency" icon={DollarSign}>
              <select
                value={info.currency} onChange={(e) => setInfo((p) => ({ ...p, currency: e.target.value }))}
                className={inputCls(true, false)}
                style={{ paddingLeft: '2.25rem' }}
              >
                {['ETB', 'USD', 'EUR', 'GBP', 'KES', 'NGN'].map((c) => <option key={c}>{c}</option>)}
              </select>
            </Field>
          </div>
          <div className="flex items-center gap-3 pt-1">
            <button type="submit" className="bg-[#1e3a5f] hover:bg-[#16304f] text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition">
              Save Changes
            </button>
            {infoSaved && (
              <span className="flex items-center gap-1.5 text-sm text-green-600 font-medium">
                <CheckCircle size={15} /> Saved successfully
              </span>
            )}
          </div>
        </form>
      </Section>

      {/* Change Password */}
      <Section title="Change Password" subtitle="Use a strong password with at least 6 characters">
        <form onSubmit={handlePwdSave} noValidate className="space-y-4">
          {pwdFields.map(({ key, label }) => (
            <Field key={key} label={label} icon={Lock} error={pwdErrors[key]}>
              <input
                type={showPwd[key] ? 'text' : 'password'}
                value={pwd[key]}
                onChange={(e) => { setPwd((p) => ({ ...p, [key]: e.target.value })); setPwdErrors((p) => ({ ...p, [key]: '' })) }}
                placeholder="••••••••"
                className={`${inputCls(true, pwdErrors[key])} pr-10`}
                style={{ paddingLeft: '2.25rem' }}
              />
              <button type="button" onClick={() => setShowPwd((p) => ({ ...p, [key]: !p[key] }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPwd[key] ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </Field>
          ))}
          <div className="flex items-center gap-3 pt-1">
            <button type="submit" className="bg-[#1e3a5f] hover:bg-[#16304f] text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition">
              Update Password
            </button>
            {pwdSaved && (
              <span className="flex items-center gap-1.5 text-sm text-green-600 font-medium">
                <CheckCircle size={15} /> Password updated
              </span>
            )}
          </div>
        </form>
      </Section>

      {/* Preferences */}
      <Section title="Preferences" subtitle="Customize your PFMS experience">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-yellow-50 flex items-center justify-center">
                <Bell size={16} className="text-yellow-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#1e3a5f]">Budget Alerts</p>
                <p className="text-xs text-gray-400">Get notified when you're close to your budget limit</p>
              </div>
            </div>
            <button
              onClick={() => setBudgetAlerts((p) => !p)}
              className={`relative w-11 h-6 rounded-full transition-colors ${budgetAlerts ? 'bg-[#1e3a5f]' : 'bg-gray-300'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${budgetAlerts ? 'translate-x-5' : ''}`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                <ShieldCheck size={16} className="text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#1e3a5f]">Two-Factor Authentication</p>
                <p className="text-xs text-gray-400">Add an extra layer of security to your account</p>
              </div>
            </div>
            <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">Coming soon</span>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button onClick={handlePrefSave} className="bg-[#1e3a5f] hover:bg-[#16304f] text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition">
              Save Preferences
            </button>
            {prefSaved && (
              <span className="flex items-center gap-1.5 text-sm text-green-600 font-medium">
                <CheckCircle size={15} /> Preferences saved
              </span>
            )}
          </div>
        </div>
      </Section>

      {/* Danger Zone */}
      <div className="bg-white rounded-2xl border border-red-200 shadow-sm p-6">
        <h2 className="text-base font-bold text-red-600 mb-1">Danger Zone</h2>
        <p className="text-xs text-gray-400 mb-4">These actions are irreversible. Please proceed with caution.</p>
        <button className="flex items-center gap-2 border border-red-300 text-red-500 hover:bg-red-50 text-sm font-semibold px-5 py-2.5 rounded-lg transition">
          <Trash2 size={15} /> Delete Account
        </button>
      </div>

    </div>
  )
}

export default Profile
