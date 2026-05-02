import { createContext, useContext, useState, useCallback } from 'react'
import translations from '../i18n/translations'
const LangContext = createContext(null)
export function LangProvider({ children }) {
  const [lang, setLang] = useState(
    () => localStorage.getItem('catflix_lang') || 'en'
  )
  const changeLang = useCallback((code) => {
    setLang(code)
    localStorage.setItem('catflix_lang', code)
  }, [])
  const t = useCallback(
    (key) => translations[lang]?.[key] ?? translations.en[key] ?? key,
    [lang]
  )
  return (
    <LangContext.Provider value={{ lang, changeLang, t }}>
      {children}
    </LangContext.Provider>
  )
}
export function useLang() {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error('useLang must be used inside LangProvider')
  return ctx
}