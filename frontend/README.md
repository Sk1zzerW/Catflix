# Catflix — Frontend (React + Vite)

## Быстрый старт

```bash
cd frontend
npm install
npm run dev
# http://localhost:5173
```

Django должен быть запущен на http://localhost:8000
Vite автоматически проксирует все /api/* запросы туда.

## Структура

src/
  pages/
    LoginPage.jsx     — вход (тот же дизайн что login.html)
    RegisterPage.jsx  — регистрация (тот же дизайн что register.html)
    HomePage.jsx      — главная с хедером, героем, карточками, футером
  App.jsx             — роутинг
  main.jsx            — точка входа
  style.css           — ТОТ ЖЕ style.css что в Django/static/
