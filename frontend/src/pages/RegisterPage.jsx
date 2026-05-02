import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useLang } from '../context/LangContext'
export default function RegisterPage() {
  const navigate = useNavigate()
  const { t } = useLang()
  const [form,    setForm]    = useState({username:'',email:'',password:'',password2:''})
  const [errors,  setErrors]  = useState({})
  const [srvErr,  setSrvErr]  = useState('')
  const [loading, setLoading] = useState(false)
  const handleChange = e => {
    setForm(p => ({...p, [e.target.name]: e.target.value}))
    setErrors(p => ({...p, [e.target.name]:''}))
    setSrvErr('')
  }
  const validate = () => {
    const e = {}
    if (!form.username.trim())            e.username  = 'Required'
    if (!form.email.includes('@'))        e.email     = 'Invalid email'
    if (form.password.length < 6)         e.password  = 'Min 6 characters'
    if (form.password !== form.password2) e.password2 = 'Passwords do not match'
    return e
  }
  const handleSubmit = async e => {
    e.preventDefault()
    const fe = validate()
    if (Object.keys(fe).length) { setErrors(fe); return }
    setLoading(true)
    try {
      const res  = await fetch('/api/register/', {
        method:'POST', credentials:'include',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        if (data.errors) setErrors(data.errors)
        else setSrvErr(data.error || 'Registration failed')
        return
      }
      navigate('/login')
    } catch { setSrvErr('Connection error') }
    finally  { setLoading(false) }
  }
  const fields = [
    {name:'username',  type:'text',     label: t('usernameField'),   ph: t('usernameField'),   ac:'username'},
    {name:'email',     type:'email',    label: t('emailField'),      ph: t('emailField'),      ac:'email'},
    {name:'password',  type:'password', label: t('passwordField'),   ph: t('passwordField'),   ac:'new-password'},
    {name:'password2', type:'password', label: t('confirmPassword'), ph: t('confirmPassword'), ac:'new-password'},
  ]
  return (
    <body className="auth-body">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo">
              <i className="fas fa-cat"></i>
              <span className="logo-flix">FLIX</span>
            </div>
            <h1>{t('createAccount')}</h1>
            <p>{t('joinCommunity')}</p>
          </div>
          {srvErr && (
            <div className="message error" style={{marginBottom:16,position:'relative'}}>
              <i className="fas fa-exclamation-circle"></i>
              <span>{srvErr}</span>
            </div>
          )}
          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            {fields.map(({name,type,label,ph,ac}) => (
              <div className="form-group" key={name}>
                <label>{label}</label>
                <input type={type} name={name}
                  className={`form-input${errors[name] ? ' error':''}`}
                  value={form[name]} onChange={handleChange}
                  placeholder={ph} autoComplete={ac} />
                {errors[name] && <span className="error-message">{errors[name]}</span>}
              </div>
            ))}
            <div className="form-check">
              <input type="checkbox" id="agree" required />
              <label htmlFor="agree">
                {t('agreeTerms')} <a href="#">{t('terms')}</a> {t('and')} <a href="#">{t('privacyPolicy')}</a>
              </label>
            </div>
            <button type="submit" className="auth-button" disabled={loading}>
              <i className="fas fa-cat"></i>
              {loading ? t('joining') : t('createAccountBtn')}
            </button>
          </form>
          <div className="auth-footer">
            <p>{t('alreadyHaveAccount')} <Link to="/login">{t('signIn')}</Link></p>
          </div>
        </div>
      </div>
    </body>
  )
}