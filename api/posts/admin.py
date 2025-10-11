from django.contrib import admin
from .models import Post

@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "author", "type", "created_at")
    list_filter = ("type", "created_at")
    search_fields = ("title", "description", "author__email", "author__username")
    autocomplete_fields = ("author",)
    ordering = ("-id",)
