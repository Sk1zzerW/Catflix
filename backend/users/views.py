from idlelib.iomenu import errors
from datetime import datetime
from django.contrib.auth.hashers import make_password
from django.shortcuts import render, redirect
from django.contrib import messages

from django.contrib.auth import authenticate, login as auth_login
from django.contrib.auth.models import User

def index(request):
    return render(request, 'index.html')


def register(request):

    if request.method == 'POST':
        username = request.POST.get('username')
        email = request.POST.get('email')
        password = request.POST.get('password')
        password2 = request.POST.get('password2')

        errors = {}


        if not username:
            errors['username'] = 'Username cannot be empty'
        elif User.objects.filter(username=username).exists():
            errors['username'] = 'Username already exists'


        if not email:
            errors['email'] = 'Email cannot be empty'
        elif User.objects.filter(email=email).exists():
            errors['email'] = 'Email already exists'


        if not password:
            errors['password'] = 'Password cannot be empty'
        elif len(password) < 6:
            errors['password'] = 'Password must contain at least 6 characters'


        if password != password2:
            errors['password2'] = 'Passwords must match'


        if errors:
            return render(request, 'register.html', {
                'errors': errors,
                'old_data': request.POST  # Исправлено: POST, а не Post
            })


        User.objects.create_user(
            username=username,
            email=email,
            password=password
        )

        messages.success(request, 'User created successfully')
        return redirect('home')

    return render(request, 'register.html')


def login(request):
    if request.method == 'POST':
        username = (request.POST.get('username') or '').strip()
        password = request.POST.get('password') or ''

        #if user empty
        if not username or not password:
            messages.error(request, 'Username or password is empty')
            return render(request, 'login.html')
        else:
            user = authenticate(request, username=username, password=password)
            if user is not None:
                auth_login(request, user)

                return redirect('home')
            else:
                messages.error(request, 'Username or password does not exist')
                return render(request, 'login.html')



    return render(request, 'login.html')




def users_list(request):
    users = User.objects.all().order_by('-date_joined')
    return render(request, 'users_list.html', {'users': users})