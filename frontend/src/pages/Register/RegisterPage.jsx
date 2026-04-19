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

const RegisterPage = () => {
  const { register } = useAuth()
  const navigate = useNavigate()
  
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'USER', // Default role
  })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await register(form.name, form.email, form.password, form.role)
      // Redirect after successful registration/login
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
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-300 rounded-xl bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
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
                  className="w-full pl-10 pr-12 py-2.5 text-sm border border-slate-300 rounded-xl bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
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
              <p className="text-xs text-slate-400 mt-1.5">Must be at least 6 characters.</p>
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
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all duration-200 mt-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account…
                </>
              ) : 'Register'}
            </button>
          </form>

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
