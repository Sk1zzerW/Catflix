import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import { useLang } from '../context/LangContext'

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'uk', label: 'Українська', flag: '🇺🇦' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
]

export default function ProfilePage() {
  const navigate = useNavigate()
  const { lang, changeLang, t } = useLang()

  const [user, setUser] = useState(null)
  const [scrolled, setScrolled] = useState(false)
  const [langMsg, setLangMsg] = useState('')
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('catflix_theme') !== 'light'
  })

  useEffect(() => {
    document.body.classList.toggle('light-theme', !darkMode)
    localStorage.setItem('catflix_theme', darkMode ? 'dark' : 'light')
  }, [darkMode])

  useEffect(() => {
    fetch('/api/me/', { credentials: 'include' })
      .then(r => r.json())
      .then(d => {
        if (!d.authenticated) navigate('/login')
        else setUser(d)
      })
      .catch(() => navigate('/login'))
  }, [navigate])

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const handleLogout = async () => {
    await fetch('/api/logout/', { method: 'POST', credentials: 'include' })
    navigate('/login')
  }

  const handleLang = (code) => {
    changeLang(code)
    setLangMsg(t('langSaved'))
    setTimeout(() => setLangMsg(''), 2500)
  }

  const card = {
    background: darkMode ? '#1f1f1f' : '#ffffff',
    borderRadius: 8,
    padding: '26px 30px',
    border: darkMode ? '1px solid #2a2a2a' : '1px solid #ddd',
    marginBottom: 20,
  }

  const sTitle = {
    fontSize: 12,
    fontWeight: 700,
    color: darkMode ? '#666' : '#777',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 18,
    paddingBottom: 10,
    borderBottom: darkMode ? '1px solid #252525' : '1px solid #e5e5e5',
  }

  const row = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    fontSize: 15,
  }

  return (
    <>
      <Header user={user} onLogout={handleLogout} scrolled={scrolled} />

      <main className="main">
        <div style={{
          background: darkMode ? 'linear-gradient(135deg,#0a0a1a,#141428)' : 'linear-gradient(135deg,#f4f4f4,#ffffff)',
          padding: '80px 60px 36px',
          borderBottom: darkMode ? '1px solid #2a2a2a' : '1px solid #ddd',
        }}>
          <div style={{
            maxWidth: 860,
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            gap: 20,
          }}>
            <div style={{
              width: 66,
              height: 66,
              background: 'var(--netflix-red)',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <i className="fas fa-cat" style={{ fontSize: 32, color: '#fff' }}></i>
            </div>

            <div>
              <h1 style={{ fontSize: 34, fontWeight: 700 }}>
                {user?.username || '…'}
              </h1>
              <p style={{ color: darkMode ? '#777' : '#555', fontSize: 14 }}>
                {t('profileSubtitle')}
              </p>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: 860, margin: '0 auto', padding: '36px 60px' }}>
          <div style={card}>
            <p style={sTitle}>{t('accountInfo')}</p>

            <div style={row}>
              <span style={{ color: darkMode ? '#777' : '#555' }}>{t('usernameLabel')}</span>
              <span style={{ color: darkMode ? '#fff' : '#111', fontWeight: 500 }}>
                {user?.username}
              </span>
            </div>

            <div style={{ ...row, marginBottom: 0 }}>
              <span style={{ color: darkMode ? '#777' : '#555' }}>{t('emailLabel')}</span>
              <span style={{ color: darkMode ? '#bbb' : '#333' }}>
                {user?.email || '—'}
              </span>
            </div>
          </div>

          <div style={card}>
            <p style={sTitle}>{t('preferences')}</p>
            <p style={{ color: darkMode ? '#bbb' : '#333', fontSize: 14, marginBottom: 14 }}>
              {t('language')}
            </p>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {LANGUAGES.map(l => (
                <button key={l.code} onClick={() => handleLang(l.code)} style={{
                  padding: '10px 20px',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontSize: 14,
                  border: `2px solid ${lang === l.code ? 'var(--netflix-red)' : '#333'}`,
                  background: lang === l.code ? 'rgba(229,9,20,0.14)' : 'transparent',
                  color: lang === l.code ? (darkMode ? '#fff' : '#111') : '#777',
                  fontWeight: lang === l.code ? 600 : 400,
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}>
                  <span style={{ fontSize: 18 }}>{l.flag}</span> {l.label}
                </button>
              ))}
            </div>

            {langMsg && (
              <div style={{
                marginTop: 14,
                background: 'rgba(229,9,20,0.1)',
                border: '1px solid var(--netflix-red)',
                borderRadius: 4,
                padding: '8px 14px',
                color: darkMode ? '#fff' : '#111',
                fontSize: 13,
                display: 'inline-block',
              }}>
                ✓ {langMsg}
              </div>
            )}
          </div>

          <div style={card}>
            <p style={sTitle}>{t('appearance')}</p>

            <div style={row}>
              <div>
                <span style={{ color: darkMode ? '#bbb' : '#333', fontSize: 15 }}>
                  {t('darkMode')}
                </span>
                <span style={{ color: darkMode ? '#444' : '#777', fontSize: 13, marginLeft: 10 }}>
                  {darkMode ? t('darkModeNote') : 'Light theme is enabled'}
                </span>
              </div>

              <button
                onClick={() => setDarkMode(prev => !prev)}
                style={{
                  width: 50,
                  height: 26,
                  background: darkMode ? 'var(--netflix-red)' : '#999',
                  borderRadius: 13,
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0 4px',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{
                  width: 18,
                  height: 18,
                  background: '#fff',
                  borderRadius: '50%',
                  marginLeft: darkMode ? 'auto' : 0,
                  transition: 'all 0.2s',
                }} />
              </button>
            </div>
          </div>

          <div style={card}>
            <p style={sTitle}>{t('notifications')}</p>
            <p style={{
              color: darkMode ? '#3a3a3a' : '#777',
              fontSize: 15,
              textAlign: 'center',
              padding: '12px 0',
            }}>
              <i className="fas fa-bell" style={{
                fontSize: 26,
                display: 'block',
                marginBottom: 8,
                color: darkMode ? '#2a2a2a' : '#aaa',
              }}></i>
              {t('notifNote')}
            </p>
          </div>

          <button onClick={() => navigate('/home')} style={{
            background: 'transparent',
            border: darkMode ? '1px solid #3a3a3a' : '1px solid #aaa',
            color: darkMode ? '#777' : '#333',
            padding: '9px 20px',
            borderRadius: 4,
            cursor: 'pointer',
            fontSize: 14,
            marginTop: 6,
          }}>
            {t('backHome')}
          </button>
        </div>
      </main>
    </>
  )
}