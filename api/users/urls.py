from django.urls import path
from .views import SignupView, MeView

urlpatterns = [
    path("", SignupView.as_view(), name="user-signup"),   # POST /users/
    path("me", MeView.as_view(), name="user-me"),         # GET/PATCH /users/me
]
