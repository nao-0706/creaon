from rest_framework import serializers
from .models import Post, PostType

class PostSerializer(serializers.ModelSerializer):
    author = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Post
        fields = [
            "id", "author", "title", "description", "type", "media",
            "created_at", "updated_at",
        ]
        read_only_fields = ["id", "author", "created_at", "updated_at"]

    def create(self, validated_data):
        # ログインユーザーを author にセット
        request = self.context.get("request")
        validated_data["author"] = request.user
        return super().create(validated_data)
