import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage      from './pages/LoginPage'
import RegisterPage   from './pages/RegisterPage'
import HomePage       from './pages/HomePage'
import MoviePage      from './pages/MoviePage'
import FavoritesPage  from './pages/FavoritesPage'
import ProfilePage    from './pages/ProfilePage'
export default function App() {
  return (
    <Routes>
      <Route path="/"            element={<Navigate to="/login" replace />} />
      <Route path="/login"       element={<LoginPage />} />
      <Route path="/register"    element={<RegisterPage />} />
      <Route path="/home"        element={<HomePage />} />
      <Route path="/movie/:id"   element={<MoviePage />} />
      <Route path="/favorites"   element={<FavoritesPage />} />
      <Route path="/profile"     element={<ProfilePage />} />
    </Routes>
  )
}