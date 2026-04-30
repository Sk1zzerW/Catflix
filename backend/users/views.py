import sqlite3 as sql
from idlelib.iomenu import errors
from datetime import datetime
from django.contrib.auth.hashers import make_password
from api.models import Film
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




def film_upload(request):
    if request.method == 'POST':
        title = request.POST.get('title')
        poster = request.FILES.get('poster')
        video = request.FILES.get('video')
        description = request.POST.get('description')
        category_of_film = request.POST.get('category_of_film')

        errors = {}

        if not title:
            errors['title'] = 'Title cannot be empty'
        elif len(title) < 1 :
            errors['title'] = 'Title must contain at least 1 characters'

        if not poster:
            errors['poster'] = 'Poster cannot be empty'

        if not video:
            errors['video'] = 'Video cannot be empty'

        if not description:
            errors['description'] = 'Description cannot be empty'

        if not category_of_film:
            errors['category'] = 'Category cannot be empty'


        if errors:
            return render(request, 'film_upload.html', {
                'errors': errors,
                'old_data': request.POST
            })


        Film.objects.create(
            title=title,
            poster=poster,
            video=video,
            description=description,
            category_of_film=category_of_film,
        )

        return redirect('home')
    return render(request, 'film_upload.html')


def catalog(request):
    category = request.GET.get('category')
    querry = request.GET.get('q')
    films = Film.objects.all()
    if querry:
        films = films.filter(title__icontains=querry)
    if category:
        films = films.filter(category_of_film__icontains=category)
    return render(request, 'catalog.html', {
        'films': films,
        "querry": querry,
    })



def users_list(request):
    users = User.objects.all().order_by('-date_joined')
    return render(request, 'users_list.html', {'users': users})