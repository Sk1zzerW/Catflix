from django.urls import path
from . import views

urlpatterns = [
    path('home/', views.index, name='home'),
    path('register/', views.register, name='register'),
    path('users/', views.users_list, name='users_list'),
    path('login/', views.login, name='login'),
]