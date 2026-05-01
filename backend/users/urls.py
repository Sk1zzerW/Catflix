from django.urls import path
from . import views

urlpatterns = [
    # ── Django-шаблонные маршруты ──────────────────────────────
    path('home/',     views.index,      name='home'),
    path('register/', views.register,   name='register'),
    path('login/',    views.login,      name='login'),
    path('logout/',   views.logout,     name='logout'),
    path('users/',    views.users_list, name='users_list'),

    # ── REST API для React ─────────────────────────────────────
    path('api/register/', views.api_register, name='api_register'),
    path('api/login/',    views.api_login,    name='api_login'),
    path('api/logout/',   views.api_logout,   name='api_logout'),
    path('api/me/',       views.api_me,       name='api_me'),
]
