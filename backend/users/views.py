from django.contrib import messages
from django.contrib.auth import authenticate, login as auth_login, logout as auth_logout
from django.contrib.auth.models import User
from django.shortcuts import render, redirect


def index(request):
    return render(request, 'home.html')


def register(request):
    if request.method == 'POST':
        username = (request.POST.get('username') or '').strip()
        email = (request.POST.get('email') or '').strip().lower()
        password = request.POST.get('password') or ''
        password2 = request.POST.get('password2') or ''

        errors = {}

        if not username:
            errors['username'] = 'Введите имя пользователя'
        elif User.objects.filter(username=username).exists():
            errors['username'] = 'Такое имя пользователя уже существует'

        if not email:
            errors['email'] = 'Введите email'
        elif '@' not in email:
            errors['email'] = 'Введите корректный email'
        elif User.objects.filter(email=email).exists():
            errors['email'] = 'Такой email уже зарегистрирован'

        if not password:
            errors['password'] = 'Введите пароль'
        elif len(password) < 6:
            errors['password'] = 'Пароль должен содержать минимум 6 символов'

        if not password2:
            errors['password2'] = 'Повторите пароль'
        elif password != password2:
            errors['password2'] = 'Пароли не совпадают'

        if errors:
            return render(request, 'register.html', {
                'errors': errors,
                'old_data': request.POST,
            })

        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
        )
        auth_login(request, user)
        messages.success(request, 'Аккаунт успешно создан')
        return redirect('home')

    return render(request, 'register.html')


def login(request):
    if request.method == 'POST':
        login_value = (request.POST.get('username') or '').strip()
        password = request.POST.get('password') or ''

        errors = {}

        if not login_value:
            errors['username'] = 'Введите email или имя пользователя'
        if not password:
            errors['password'] = 'Введите пароль'

        if errors:
            return render(request, 'login.html', {
                'errors': errors,
                'old_data': request.POST,
            })

        username = login_value
        if '@' in login_value:
            user_by_email = User.objects.filter(email=login_value.lower()).first()
            if user_by_email:
                username = user_by_email.username

        user = authenticate(request, username=username, password=password)

        if user is not None:
            auth_login(request, user)
            return redirect('home')

        return render(request, 'login.html', {
            'errors': {'general': 'Неверный email/имя пользователя или пароль'},
            'old_data': request.POST,
        })

    return render(request, 'login.html')


def logout(request):
    auth_logout(request)
    return redirect('login')


def users_list(request):
    users = User.objects.all().order_by('-date_joined')
    return render(request, 'users_list.html', {'users': users})
