# api/users/views.py
from rest_framework import generics, permissions, status            # ← status を追加
from rest_framework.response import Response                        # ← 追加
from rest_framework_simplejwt.tokens import RefreshToken            # ← 追加
from django.contrib.auth import get_user_model
from .serializers import UserCreateSerializer, MeSerializer

User = get_user_model()

class SignupView(generics.CreateAPIView):
    """
    POST /users/ でユーザー作成（匿名OK）
    成功時は { user, access, refresh } を返す
    """
    serializer_class = UserCreateSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        # 1) 入力を検証（エラーなら400を自動で返す）
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # 2) ユーザー作成（passwordはserializer側でハッシュ化）
        user = serializer.save()

        # 3) JWT発行（refresh と access）
        tokens = RefreshToken.for_user(user)
        access = str(tokens.access_token)
        refresh = str(tokens)

        # 4) 返却用のユーザーデータ（パスワードは含めない）
        user_data = MeSerializer(user).data

        # 5) 201 Created でまとめて返す
        return Response(
            {"user": user_data, "access": access, "refresh": refresh},
            status=status.HTTP_201_CREATED,
        )

class MeView(generics.RetrieveUpdateAPIView):
    serializer_class = MeSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_object(self):
        return self.request.user
