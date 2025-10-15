# api/posts/views.py
from django.db.models import Count
from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import JSONParser, FormParser, MultiPartParser

from .models import Post, PostLike
from .serializers import PostSerializer

class PostViewSet(viewsets.ModelViewSet):
    serializer_class = PostSerializer
    permission_classes = [permissions.AllowAny]
    parser_classes = (JSONParser, FormParser, MultiPartParser)

    def get_queryset(self):
        # 一覧/詳細どちらでも like_count を返す
        return Post.objects.all().annotate(like_count=Count("likes")).order_by("-created_at")

    @action(detail=True, methods=["post"], url_path="like",
            permission_classes=[permissions.IsAuthenticated])
    def like(self, request, pk=None):
        post = self.get_object()
        PostLike.objects.get_or_create(post=post, user=request.user)
        count = PostLike.objects.filter(post=post).count()
        return Response({"liked": True, "like_count": count})

    @like.mapping.delete
    def unlike(self, request, pk=None):
        post = self.get_object()
        PostLike.objects.filter(post=post, user=request.user).delete()
        count = PostLike.objects.filter(post=post).count()
        return Response({"liked": False, "like_count": count})
