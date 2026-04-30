from django.urls import path
from . import views

urlpatterns = [
    path('home/', views.index, name='home'),
    path('register/', views.register, name='register'),
    path('users/', views.users_list, name='users_list'),
    path('login/', views.login, name='login'),
    path('film_upload/', views.film_upload, name='film_upload'),
    path('catalog/', views.catalog, name='catalog'),
]