# api/config/urls.py
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import HttpResponse
from rest_framework_simplejwt.views import (
    TokenObtainPairView, TokenRefreshView, TokenVerifyView
)

urlpatterns = [
    path("admin/", admin.site.urls),

    # JWT (Next は /api/token/.. を利用)
    path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/token/verify/", TokenVerifyView.as_view(), name="token_verify"),

    # 
    path("auth/jwt/create", TokenObtainPairView.as_view(), name="jwt-create"),
    path("auth/jwt/refresh", TokenRefreshView.as_view(), name="jwt-refresh"),
    path("auth/jwt/verify", TokenVerifyView.as_view(), name="jwt-verify"),

    # apps
    path("users/", include("users.urls")),
    path("api/", include("posts.urls")),          # ← posts は /api/posts/... に載る
    path("api-auth/", include("rest_framework.urls")),  # DRFブラウザログイン

    # health check
    path("healthz/", lambda r: HttpResponse("ok")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
