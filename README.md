# 🐱 CATFLIX

Netflix-клон на Django + React.

## Быстрый старт

### Бэкенд (Django)
```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py loaddata api/fixtures/initial_data.json
python manage.py createsuperuser   # для /admin
python manage.py runserver         # http://localhost:8000
```

### Фронтенд (React)
```bash
cd frontend
npm install
npm run dev   # http://localhost:5173
```

Открывай http://localhost:5173 — Vite проксирует /api/* на Django.

## Структура
```
backend/
  api/
    models.py        — Movie, Genre
    views.py         — API эндпоинты фильмов
    serializers.py   — DRF сериализаторы
    admin.py         — Управление фильмами через /admin
    fixtures/        — 11 тестовых фильмов + жанры
  users/
    models.py        — UserProfile
    views.py         — Регистрация, вход, API auth
  templates/         — Django HTML-шаблоны
  static/            — style.css, text.css

frontend/
  src/
    pages/
      LoginPage.jsx
      RegisterPage.jsx
      HomePage.jsx     — каталог с реальными данными
    components/
      MovieCard.jsx    — карточка фильма
      MovieModal.jsx   — модальное окно с деталями
    App.jsx
    style.css          — тот же что в Django
```

## API эндпоинты
| Метод | URL | Описание |
|-------|-----|----------|
| GET | /api/movies/ | Список фильмов |
| GET | /api/movies/?type=movie | Только фильмы |
| GET | /api/movies/?type=series | Только сериалы |
| GET | /api/movies/?coming_soon=true | Анонсы |
| GET | /api/movies/?search=текст | Поиск |
| GET | /api/movies/?genre=1 | По жанру |
| GET | /api/movies/<id>/ | Детали фильма |
| GET | /api/genres/ | Список жанров |
| POST | /api/register/ | Регистрация |
| POST | /api/login/ | Вход |
| POST | /api/logout/ | Выход |
| GET | /api/me/ | Текущий пользователь |
