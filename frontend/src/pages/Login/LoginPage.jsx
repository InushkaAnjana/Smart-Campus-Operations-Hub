/**
 * ================================================================
 * LoginPage.jsx - User Authentication Page
 * ================================================================
 * Owner: Member 1 (Team Lead) - Auth Module
 *
 * TODO Member 1:
 *  - Add form validation (email format, password min length)
 *  - Show loading spinner on submit
 *  - Handle API error messages from backend
 *  - Add "Remember me" checkbox
 *  - Add forgot password link
 *  - Add Google OAuth button if needed
 * ================================================================
 */
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { MdSchool, MdEmail, MdLock, MdVisibility, MdVisibilityOff } from 'react-icons/md'
import { useAuth } from '../../context/AuthContext'
import './LoginPage.css'

const LoginPage = () => {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [form, setForm]           = useState({ email: '', password: '' })
  const [showPass, setShowPass]   = useState(false)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')

  const handleChange = (e) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form.email, form.password)
      navigate('/dashboard')
    } catch (err) {
      setError(err?.message || 'Invalid email or password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      {/* Left panel — branding */}
      <div className="login-brand-panel">
        <div className="login-brand-content">
          <div className="login-brand-logo">
            <MdSchool />
          </div>
          <h1 className="login-brand-title">Smart Campus<br />Operations Hub</h1>
          <p className="login-brand-desc">
            Manage facilities, bookings, maintenance tickets and notifications
            — all in one unified platform.
          </p>
          <div className="login-features">
            {['Facility Booking', 'Maintenance Tracking', 'Real-time Notifications', 'Resource Management'].map(f => (
              <div key={f} className="login-feature-item">
                <span className="login-feature-dot" />
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="login-form-panel">
        <div className="login-form-card">
          <div className="login-form-header">
            <h2>Welcome back</h2>
            <p>Sign in to your account to continue</p>
          </div>

          {error && (
            <div className="alert alert-danger">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            {/* Email */}
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email Address</label>
              <div className="input-icon-wrapper">
                <MdEmail className="input-icon" />
                <input
                  id="email"
                  type="email"
                  name="email"
                  className="form-control input-with-icon"
                  placeholder="you@university.edu"
                  value={form.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <div className="input-icon-wrapper">
                <MdLock className="input-icon" />
                <input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  name="password"
                  className="form-control input-with-icon input-with-icon-right"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="input-icon-right"
                  onClick={() => setShowPass(p => !p)}
                  aria-label="Toggle password visibility"
                >
                  {showPass ? <MdVisibilityOff /> : <MdVisibility />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              id="login-submit-btn"
              type="submit"
              className="btn btn-primary btn-lg w-full"
              disabled={loading}
            >
              {loading ? <span className="spinner" style={{ width: '1.2rem', height: '1.2rem' }} /> : 'Sign In'}
            </button>
          </form>

          <div className="login-form-footer">
            <p>Don't have an account?{' '}
              <Link to="/register" className="login-link">Register here</Link>
            </p>
          </div>

          {/* Dev shortcut - remove before production */}
          <div className="login-dev-hint">
            <small>🛠 Dev: Use any registered email & password from your H2 DB</small>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
