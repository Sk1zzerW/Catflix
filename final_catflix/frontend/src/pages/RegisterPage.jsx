import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', email: '', password: '', password2: '' })
  const [errors, setErrors]     = useState({})
  const [serverErr, setServerErr] = useState('')
  const [loading, setLoading]   = useState(false)

  const handleChange = e => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setErrors(prev => ({ ...prev, [e.target.name]: '' }))
    setServerErr('')
  }

  const validate = () => {
    const errs = {}
    if (!form.username.trim())           errs.username  = 'Username cannot be empty'
    if (!form.email.includes('@'))       errs.email     = 'Enter a valid email'
    if (form.password.length < 6)        errs.password  = 'Password must be at least 6 characters'
    if (form.password !== form.password2) errs.password2 = 'Passwords must match'
    return errs
  }

  const handleSubmit = async e => {
    e.preventDefault()
    const frontErrs = validate()
    if (Object.keys(frontErrs).length) { setErrors(frontErrs); return }

    setLoading(true)
    try {
      const res = await fetch('/api/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        if (data.errors) setErrors(data.errors)
        else setServerErr(data.error || 'Registration failed')
        return
      }
      navigate('/login')
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
            <h1>Create Account</h1>
            <p>Join the purr-fect community</p>
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
                placeholder="Choose a username"
                autoComplete="username"
              />
              {errors.username && <span className="error-message">{errors.username}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                className={`form-input${errors.email ? ' error' : ''}`}
                value={form.email}
                onChange={handleChange}
                placeholder="Enter your email"
                autoComplete="email"
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
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
                placeholder="Create a password"
                autoComplete="new-password"
              />
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="password2">Confirm Password</label>
              <input
                type="password"
                id="password2"
                name="password2"
                className={`form-input${errors.password2 ? ' error' : ''}`}
                value={form.password2}
                onChange={handleChange}
                placeholder="Confirm your password"
                autoComplete="new-password"
              />
              {errors.password2 && <span className="error-message">{errors.password2}</span>}
            </div>

            <div className="form-check">
              <input type="checkbox" id="agree" name="agree" required />
              <label htmlFor="agree">
                I agree to the <a href="#">Terms</a> and <a href="#">Privacy Policy</a>
              </label>
            </div>

            <button type="submit" className="auth-button" disabled={loading}>
              <i className="fas fa-cat"></i>
              {loading ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>

          <div className="auth-footer">
            <p>Already have an account? <Link to="/login">Sign In</Link></p>
          </div>

        </div>
      </div>
    </body>
  )
}
