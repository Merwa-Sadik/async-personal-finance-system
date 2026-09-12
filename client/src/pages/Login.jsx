import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import AuthLayout from '../components/AuthLayout'
import { authApi } from '../services/api'
import { useFinance } from '../context/FinanceContext'

const Login = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({ email: '', password: '', remember: false })
  const [errors, setErrors] = useState({})
  const navigate = useNavigate()
  const { setUser, refreshData } = useFinance()

  const validate = () => {
    const e = {}
    if (!form.email) e.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email'
    if (!form.password) e.password = 'Password is required'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const e2 = validate()
    if (Object.keys(e2).length) return setErrors(e2)
    setErrors({})
    try {
      const { data } = await authApi.login({ email: form.email, password: form.password })
      localStorage.setItem('finance_token', data.token)
      localStorage.setItem('finance_user', JSON.stringify(data.user))
      setUser(data.user)
      await refreshData()
      navigate('/')
    } catch (error) {
      setErrors({ form: error.response?.data?.message || 'Unable to sign in' })
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  return (
    <AuthLayout>
      <h1 className="text-2xl font-bold text-[#1e3a5f] text-center">Welcome Back</h1>
      <p className="text-sm text-gray-500 text-center mt-1 mb-7">Sign in to manage your finances</p>

      {errors.form && <p className="text-sm text-red-500 mb-4">{errors.form}</p>}
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-[#1e3a5f] mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
            className={`w-full rounded-lg border px-4 py-2.5 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-[#1e3a5f] transition ${
              errors.email ? 'border-red-400 focus:ring-red-300' : 'border-gray-300'
            }`}
          />
          {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-[#1e3a5f] mb-1">Password</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              className={`w-full rounded-lg border px-4 py-2.5 pr-10 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-[#1e3a5f] transition ${
                errors.password ? 'border-red-400 focus:ring-red-300' : 'border-gray-300'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
        </div>

        {/* Remember me + Forgot password */}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              name="remember"
              checked={form.remember}
              onChange={handleChange}
              className="accent-[#1e3a5f] w-4 h-4 rounded"
            />
            Remember me
          </label>
          <Link to="/forgot-password" className="text-sm text-[#1e3a5f] hover:underline font-medium">
            Forgot password?
          </Link>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full bg-[#1e3a5f] hover:bg-[#16304f] text-white font-semibold py-2.5 rounded-lg transition text-sm"
        >
          Sign In
        </button>
      </form>

      <p className="text-sm text-center text-gray-500 mt-6">
        Don't have an account?{' '}
        <Link to="/register" className="text-[#1e3a5f] font-semibold hover:underline">
          Create Account
        </Link>
      </p>
    </AuthLayout>
  )
}

export default Login
