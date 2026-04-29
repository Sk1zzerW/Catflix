import json
from django.shortcuts import render, redirect
from django.contrib import messages
from django.contrib.auth import authenticate, login as auth_login, logout as auth_logout
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods


# ── Django template views ─────────────────────────────────────────────────────

def index(request):
    return render(request, 'index.html')


def register(request):
    if request.method == 'POST':
        username  = request.POST.get('username', '').strip()
        email     = request.POST.get('email', '').strip()
        password  = request.POST.get('password', '')
        password2 = request.POST.get('password2', '')

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
                'old_data': request.POST,
            })

        User.objects.create_user(username=username, email=email, password=password)
        messages.success(request, 'Account created! Please sign in.')
        return redirect('login')

    return render(request, 'register.html')


def login(request):
    if request.method == 'POST':
        username = request.POST.get('username', '').strip()
        password = request.POST.get('password', '')

        if not username or not password:
            messages.error(request, 'Username and password are required')
            return render(request, 'login.html')

        user = authenticate(request, username=username, password=password)
        if user is not None:
            auth_login(request, user)
            return redirect('home')
        else:
            messages.error(request, 'Invalid username or password')
            return render(request, 'login.html')

    return render(request, 'login.html')


def logout(request):
    auth_logout(request)
    return redirect('login')


def users_list(request):
    users = User.objects.all().order_by('-date_joined')
    return render(request, 'users_list.html', {'users': users})


# ── REST API views (для React) ────────────────────────────────────────────────

@csrf_exempt
@require_http_methods(["POST"])
def api_register(request):
    """POST /api/register/ — регистрация через React"""
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)

    username  = (data.get("username") or "").strip()
    email     = (data.get("email") or "").strip()
    password  = data.get("password") or ""
    password2 = data.get("password2") or ""

    errors = {}

    if not username:
        errors["username"] = "Username cannot be empty"
    elif User.objects.filter(username=username).exists():
        errors["username"] = "Username already exists"

    if not email:
        errors["email"] = "Email cannot be empty"
    elif User.objects.filter(email=email).exists():
        errors["email"] = "Email already exists"

    if not password:
        errors["password"] = "Password cannot be empty"
    elif len(password) < 6:
        errors["password"] = "Password must contain at least 6 characters"

    if password != password2:
        errors["password2"] = "Passwords must match"

    if errors:
        return JsonResponse({"errors": errors}, status=400)

    user = User.objects.create_user(username=username, email=email, password=password)
    return JsonResponse({"message": "Account created", "username": user.username}, status=201)


@csrf_exempt
@require_http_methods(["POST"])
def api_login(request):
    """POST /api/login/ — вход через React"""
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)

    username = (data.get("username") or "").strip()
    password = data.get("password") or ""

    if not username or not password:
        return JsonResponse({"error": "Username and password are required"}, status=400)

    user = authenticate(request, username=username, password=password)
    if user is not None:
        auth_login(request, user)
        return JsonResponse({"message": "Login successful", "username": user.username, "email": user.email})
    return JsonResponse({"error": "Invalid username or password"}, status=401)


@require_http_methods(["POST"])
def api_logout(request):
    """POST /api/logout/ — выход через React"""
    auth_logout(request)
    return JsonResponse({"message": "Logged out"})


@require_http_methods(["GET"])
def api_me(request):
    """GET /api/me/ — текущий пользователь (по сессии)"""
    if request.user.is_authenticated:
        return JsonResponse({
            "authenticated": True,
            "username": request.user.username,
            "email": request.user.email,
        })
    return JsonResponse({"authenticated": False}, status=401)
