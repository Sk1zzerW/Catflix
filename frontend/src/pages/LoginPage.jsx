import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function LoginPage() {
  const navigate = useNavigate()
  const [form, setForm]       = useState({ username: '', password: '' })
  const [errors, setErrors]   = useState({})
  const [serverErr, setServerErr] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = e => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setErrors(prev => ({ ...prev, [e.target.name]: '' }))
    setServerErr('')
  }

  const handleSubmit = async e => {
    e.preventDefault()
    const errs = {}
    if (!form.username.trim()) errs.username = 'Enter your username'
    if (!form.password)        errs.password = 'Enter your password'
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    try {
      const res = await fetch('/api/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { setServerErr(data.error || 'Login failed'); return }
      navigate('/home')
    } catch {
      setServerErr('Connection error. Is Django running?')
    } finally {
      setLoading(false)
    }
  }

  return (
    <body className="auth-body">
      <div className="auth-container">
        <div className="auth-card">

          <div className="auth-header">
            <div className="auth-logo">
              <i className="fas fa-cat"></i>
              <span className="logo-flix">FLIX</span>
            </div>
            <h1>Welcome Back</h1>
            <p>Sign in to continue</p>
          </div>

          {serverErr && (
            <div className="message error" style={{marginBottom: '20px', position: 'relative'}}>
              <i className="fas fa-exclamation-circle"></i>
              <span>{serverErr}</span>
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit} noValidate>

            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                className={`form-input${errors.username ? ' error' : ''}`}
                value={form.username}
                onChange={handleChange}
                placeholder="Enter your username"
                autoComplete="username"
              />
              {errors.username && <span className="error-message">{errors.username}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                className={`form-input${errors.password ? ' error' : ''}`}
                value={form.password}
                onChange={handleChange}
                placeholder="Enter your password"
                autoComplete="current-password"
              />
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>

            <div className="form-options">
              <label className="checkbox-label">
                <input type="checkbox" name="remember" />
                <span>Remember me</span>
              </label>
              <a href="#" className="forgot-link">Forgot password?</a>
            </div>

            <button type="submit" className="auth-button" disabled={loading}>
              <i className="fas fa-cat"></i>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="auth-footer">
            <p>New to CATFLIX? <Link to="/register">Create Account</Link></p>
          </div>

        </div>
      </div>
    </body>
  )
}
