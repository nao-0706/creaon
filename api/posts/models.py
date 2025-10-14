from __future__ import annotations
import os
from uuid import uuid4

from django.conf import settings
from django.db import models


class PostType(models.TextChoices):
    IMAGE = 'image', 'Image'
    AUDIO = 'audio', 'Audio'
    VIDEO = 'video', 'Video'
    OTHER = 'other', 'Other'


def post_media_path(instance: "Post", filename: str) -> str:
    # posts/<author_id>/<uuid>.<ext>
    base, ext = os.path.splitext(filename)
    return f"posts/{instance.author_id}/{uuid4().hex}{ext.lower()}"


class Post(models.Model):
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="posts",
    )
    title = models.CharField(max_length=140)
    description = models.TextField(blank=True)
    type = models.CharField(
        max_length=10,
        choices=PostType.choices,
        default=PostType.OTHER,
    )
    media = models.FileField(upload_to=post_media_path, blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-id']

    def __str__(self) -> str:
        return f"{self.title} (#{self.id})"
