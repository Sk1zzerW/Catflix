from django.conf import settings
from django.contrib import admin
from django.shortcuts import redirect
from django.urls import path, include
from django.conf.urls.static import static

from api.views import health

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/health/', health),
    static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT),
    path('', lambda request: redirect('/home/')),
    # Pages from users app (templates-based)
    path('', include('users.urls')),
]
