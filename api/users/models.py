# api/users/models.py
from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLE_CHOICES = (
        ("viewer", "viewer"),
        ("artist", "artist"),
        ("admin", "admin"),
    )
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default="viewer")
    bio = models.TextField(blank=True)
    avatar = models.ImageField(upload_to="avatars/", null=True, blank=True)
    links = models.JSONField(default=dict, blank=True)

    REQUIRED_FIELDS = ["email"]  # usernameはAbstractUserのまま
