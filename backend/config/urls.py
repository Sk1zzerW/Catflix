from django.contrib import admin
from django.shortcuts import redirect
from django.urls import path, include

from api.views import health

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/health/', health),

    path('', lambda request: redirect('/home/')),
    # Pages from users app (templates-based)
    path('', include('users.urls')),
]
