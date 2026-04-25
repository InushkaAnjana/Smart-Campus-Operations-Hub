import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { MdSchool, MdEmail, MdLock, MdPerson, MdCheckCircle, MdVisibility, MdVisibilityOff } from 'react-icons/md'
import { useAuth } from '../../context/AuthContext'

const FEATURES = [
  'Facility Booking & Reservations',
  'Maintenance Ticket Tracking',
  'Real-time Notifications',
  'Resource Management',
]

// Helper component for password requirements
const Requirement = ({ met, text }) => (
  <div className={`flex items-center gap-1.5 text-[10px] transition-colors ${met ? 'text-emerald-600' : 'text-slate-400'}`}>
    <MdCheckCircle className={`text-sm ${met ? 'text-emerald-500' : 'text-slate-200'}`} />
    <span className={met ? 'font-medium' : ''}>{text}</span>
  </div>
)

const RegisterPage = () => {
  const { register } = useAuth()
  const navigate = useNavigate()
  
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'USER',
  })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // ── Validation State ──
  const [validation, setValidation] = useState({
    emailValid: true,
    passLength: false,
    passUpper: false,
    passLower: false,
    passNumber: false,
    passSpecial: false,
  })

  const validateEmail = (email) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    return re.test(String(email).toLowerCase())
  }

  const validatePassword = (pass) => {
    return {
      passLength: pass.length >= 8,
      passUpper: /[A-Z]/.test(pass),
      passLower: /[a-z]/.test(pass),
      passNumber: /\d/.test(pass),
      passSpecial: /[!@#$%^&*]/.test(pass),
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))

    if (name === 'email') {
      setValidation(prev => ({ ...prev, emailValid: validateEmail(value) || value === '' }))
    }
    if (name === 'password') {
      const passVal = validatePassword(value)
      setValidation(prev => ({ ...prev, ...passVal }))
    }
  }

  const isFormValid = 
    form.name.trim() !== '' && 
    validateEmail(form.email) && 
    Object.values(validatePassword(form.password)).every(Boolean)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isFormValid) return
    setError('')
    setLoading(true)

    try {
      await register(form.name, form.email, form.password, form.role)
      navigate('/dashboard')
    } catch (err) {
      setError(err?.message || 'Failed to register. Please check your details.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen font-sans">
      {/* ── Left Brand Panel ── */}
      <div className="hidden lg:flex flex-col justify-center flex-1 bg-gradient-to-br from-[#1e1b4b] via-[#312e81] to-[#4338ca] px-16 py-12 relative overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-[-80px] left-[-80px] w-[360px] h-[360px] rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-60px] right-[-60px] w-[280px] h-[280px] rounded-full bg-purple-600/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-md">
          {/* Logo */}
          <div className="flex items-center gap-4 mb-10">
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-500/30 text-indigo-200 text-4xl shadow-xl">
              <MdSchool />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-white leading-tight">Smart Campus</h1>
              <p className="text-indigo-300 text-sm">Operations Hub</p>
            </div>
          </div>

          <p className="text-indigo-200 text-base leading-relaxed mb-10">
            Join the Smart Campus Hub to easily reserve facilities, report issues, and stay updated.
          </p>

          <ul className="space-y-3">
            {FEATURES.map(f => (
              <li key={f} className="flex items-center gap-3 text-indigo-100 text-sm font-medium">
                <MdCheckCircle className="text-emerald-400 text-lg shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ── Right Form Panel ── */}
      <div className="flex flex-1 flex-col items-center justify-center px-8 py-12 bg-slate-50">
        {/* Mobile logo */}
        <div className="flex lg:hidden items-center gap-3 mb-8">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-600 text-white text-2xl">
            <MdSchool />
          </div>
          <span className="text-xl font-bold text-slate-800">SmartCampus Hub</span>
        </div>

        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl shadow-slate-200/80 border border-slate-100 px-8 py-10">
          <div className="mb-8">
            <h2 className="text-2xl font-extrabold text-slate-900">Create Account ✨</h2>
            <p className="mt-1 text-sm text-slate-500">Sign up to get started</p>
          </div>

          {error && (
            <div className="flex items-center gap-2 mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
              <span className="shrink-0">⚠</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <MdPerson className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                <input
                  id="name"
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  required
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-300 rounded-xl bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <MdEmail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@university.edu"
                  required
                  className={`w-full pl-10 pr-4 py-2.5 text-sm border rounded-xl bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${!validation.emailValid ? 'border-red-500 focus:ring-red-500' : 'border-slate-300'}`}
                />
              </div>
              {!validation.emailValid && form.email !== '' && (
                <p className="text-xs text-red-500 mt-1">Please enter a valid email address.</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <MdLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                <input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Create a password"
                  required
                  minLength={6}
                  className={`w-full pl-10 pr-12 py-2.5 text-sm border rounded-xl bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${form.password !== '' && !Object.values(validatePassword(form.password)).every(Boolean) ? 'border-red-500 focus:ring-red-500' : 'border-slate-300'}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((p) => !p)}
                  aria-label="Toggle password visibility"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-lg transition-colors"
                >
                  {showPass ? <MdVisibilityOff /> : <MdVisibility />}
                </button>
              </div>
              
              {/* Password Requirements List */}
              <div className="mt-2 space-y-1">
                <p className="text-xs font-semibold text-slate-500 mb-1">Password Requirements:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-2 gap-y-1">
                  <Requirement met={validation.passLength} text="Min 8 characters" />
                  <Requirement met={validation.passUpper} text="Uppercase letter" />
                  <Requirement met={validation.passLower} text="Lowercase letter" />
                  <Requirement met={validation.passNumber} text="One number" />
                  <Requirement met={validation.passSpecial} text="Special char (!@#$%^&*)" />
                </div>
              </div>
            </div>

            {/* Role Validation (Optional Dropdown) */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-slate-700 mb-1.5">
                Role
              </label>
              <select
                id="role"
                name="role"
                value={form.role}
                onChange={handleChange}
                className="w-full flex-1 appearance-none border border-slate-300 rounded-xl bg-white px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="USER">User (Student/Staff)</option>
                <option value="TECHNICIAN">Technician</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !isFormValid}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all duration-200 mt-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account…
                </>
              ) : 'Register'}
            </button>
          </form>

          <div className="mt-5 flex items-center justify-between">
            <span className="w-1/5 border-b border-slate-200 lg:w-1/4"></span>
            <span className="text-xs text-center text-slate-500 uppercase">or continue with</span>
            <span className="w-1/5 border-b border-slate-200 lg:w-1/4"></span>
          </div>

          <button
            type="button"
            onClick={() => window.location.href = "http://localhost:9090/oauth2/authorization/google"}
            className="mt-4 flex w-full items-center justify-center gap-3 rounded-xl border border-slate-300 bg-white py-2.5 px-4 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Sign in with Google
          </button>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-600 font-semibold hover:text-indigo-800 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
