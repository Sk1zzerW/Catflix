import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useLang } from '../context/LangContext'
export default function LoginPage() {
  const navigate = useNavigate()
  const { t } = useLang()
  const [form,    setForm]    = useState({ username:'', password:'' })
  const [errors,  setErrors]  = useState({})
  const [srvErr,  setSrvErr]  = useState('')
  const [loading, setLoading] = useState(false)
  const handleChange = e => {
    setForm(p => ({...p, [e.target.name]: e.target.value}))
    setErrors(p => ({...p, [e.target.name]:''}))
    setSrvErr('')
  }
  const handleSubmit = async e => {
    e.preventDefault()
    const errs = {}
    if (!form.username.trim()) errs.username = t('usernameField') + ' required'
    if (!form.password)        errs.password = t('passwordField') + ' required'
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    try {
      const res  = await fetch('/api/login/', {
        method:'POST', credentials:'include',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { setSrvErr(data.error || 'Login failed'); return }
      navigate('/home')
    } catch { setSrvErr('Connection error') }
    finally  { setLoading(false) }
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
            <h1>{t('welcomeBack')}</h1>
            <p>{t('signInToContinue')}</p>
          </div>
          {srvErr && (
            <div className="message error" style={{marginBottom:20,position:'relative'}}>
              <i className="fas fa-exclamation-circle"></i>
              <span>{srvErr}</span>
            </div>
          )}
          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label>{t('usernameField')}</label>
              <input type="text" name="username"
                className={`form-input${errors.username ? ' error':''}`}
                value={form.username} onChange={handleChange}
                placeholder={t('usernameField')} autoComplete="username" />
              {errors.username && <span className="error-message">{errors.username}</span>}
            </div>
            <div className="form-group">
              <label>{t('passwordField')}</label>
              <input type="password" name="password"
                className={`form-input${errors.password ? ' error':''}`}
                value={form.password} onChange={handleChange}
                placeholder={t('passwordField')} autoComplete="current-password" />
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>
            <div className="form-options">
              <label className="checkbox-label">
                <input type="checkbox" /> <span>{t('rememberMe')}</span>
              </label>
              <a href="#" className="forgot-link">{t('forgotPassword')}</a>
            </div>
            <button type="submit" className="auth-button" disabled={loading}>
              <i className="fas fa-cat"></i>
              {loading ? t('signingIn') : t('signIn')}
            </button>
          </form>
          <div className="auth-footer">
            <p>{t('newToCatflix')} <Link to="/register">{t('createAccount')}</Link></p>
          </div>
        </div>
      </div>
    </body>
  )
}