import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import AuthLayout from '../components/AuthLayout'
import { authApi } from '../services/api'
import { useFinance } from '../context/FinanceContext'

const Register = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const navigate = useNavigate()
  const { setUser, refreshData } = useFinance()

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Full name is required'
    if (!form.email) e.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email'
    if (!form.password) e.password = 'Password is required'
    else if (form.password.length < 6) e.password = 'Password must be at least 6 characters'
    if (!form.confirm) e.confirm = 'Please confirm your password'
    else if (form.confirm !== form.password) e.confirm = 'Passwords do not match'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const e2 = validate()
    if (Object.keys(e2).length) return setErrors(e2)
    setErrors({})
    try {
      const { data } = await authApi.register({ name: form.name, email: form.email, password: form.password })
      localStorage.setItem('finance_token', data.token)
      localStorage.setItem('finance_user', JSON.stringify(data.user))
      setUser(data.user)
      await refreshData()
      navigate('/')
    } catch (error) {
      setErrors({ form: error.response?.data?.message || 'Unable to create account' })
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const fields = [
    { name: 'name', label: 'Full Name', type: 'text', placeholder: 'John Doe' },
    { name: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com' },
    {
      name: 'password', label: 'Password', type: showPassword ? 'text' : 'password',
      placeholder: '••••••••', toggle: () => setShowPassword((p) => !p), show: showPassword,
    },
    {
      name: 'confirm', label: 'Confirm Password', type: showConfirm ? 'text' : 'password',
      placeholder: '••••••••', toggle: () => setShowConfirm((p) => !p), show: showConfirm,
    },
  ]

  return (
    <AuthLayout>
      <h1 className="text-2xl font-bold text-[#1e3a5f] text-center">Create Your Account</h1>
      <p className="text-sm text-gray-500 text-center mt-1 mb-7">Start managing your finances today</p>

      {errors.form && <p className="text-sm text-red-500 mb-4">{errors.form}</p>}
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {fields.map(({ name, label, type, placeholder, toggle, show }) => (
          <div key={name}>
            <label className="block text-sm font-medium text-[#1e3a5f] mb-1">{label}</label>
            <div className="relative">
              <input
                type={type}
                name={name}
                value={form[name]}
                onChange={handleChange}
                placeholder={placeholder}
                className={`w-full rounded-lg border px-4 py-2.5 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-[#1e3a5f] transition ${
                  toggle ? 'pr-10' : ''
                } ${errors[name] ? 'border-red-400 focus:ring-red-300' : 'border-gray-300'}`}
              />
              {toggle && (
                <button
                  type="button"
                  onClick={toggle}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              )}
            </div>
            {errors[name] && <p className="text-xs text-red-500 mt-1">{errors[name]}</p>}
          </div>
        ))}

        <button
          type="submit"
          className="w-full bg-[#1e3a5f] hover:bg-[#16304f] text-white font-semibold py-2.5 rounded-lg transition text-sm"
        >
          Create Account
        </button>
      </form>

      <p className="text-sm text-center text-gray-500 mt-6">
        Already have an account?{' '}
        <Link to="/login" className="text-[#1e3a5f] font-semibold hover:underline">
          Sign In
        </Link>
      </p>
    </AuthLayout>
  )
}

export default Register
