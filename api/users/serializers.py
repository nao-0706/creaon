# api/users/serializers.py
from django.contrib.auth import get_user_model
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password

User = get_user_model()

class UserCreateSerializer(serializers.ModelSerializer):
    """
    サインアップ用。
    - password は書き込み専用（レスポンスには含めない）
    - 保存時に set_password でハッシュ化
    """
    password = serializers.CharField(write_only=True, validators=[validate_password])

    class Meta:
        model = User
        fields = ("id", "username", "email", "password", "role")
        read_only_fields = ("id", "role")  # 役割は後で昇格させる運用

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class MeSerializer(serializers.ModelSerializer):
    """
    ログイン中ユーザーの表示/更新用。
    - username, email, bio などを返す
    """
    class Meta:
        model = User
        fields = ("id", "username", "email", "role", "bio", "avatar", "links")
        read_only_fields = ("id", "role",)
