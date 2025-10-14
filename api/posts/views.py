from rest_framework import viewsets, permissions
from .models import Post
from .serializers import PostSerializer
from .permissions import IsAuthorOrReadOnly
from rest_framework.parsers import JSONParser, FormParser, MultiPartParser

class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.select_related("author").order_by("-id")
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsAuthorOrReadOnly]
    # parser_classes = [MultiPartParser, FormParser]
    parser_classes = (JSONParser, FormParser, MultiPartParser)

    def get_queryset(self):
        # 一覧/詳細で毎回通る。← ここにブレークポイント
        return super().get_queryset()

    def perform_create(self, serializer):
        # 送られてきた生の値
        req_data = dict(self.request.data)          # ← Debugで展開してOK
        # ファイルキー
        files = list(self.request.FILES.keys())     # ← Debugで展開してOK
        # バリデーション後の確定値
        vd = serializer.validated_data              # ← Debugで展開してOK（.data はまだ見ない）

        # ---- ここから保存（Step Overで実行）----
        obj = serializer.save()                     # ← ここを越えたら“保存後”

        # 保存“後”の返却JSON（= serializer.data と同等）を安全に見る
        data = self.get_serializer(obj).data        # ← Debugで展開してOK

        return serializer.save()

    def perform_update(self, serializer):
        # PATCH/PUT /posts/:id/ で通る。← ここにブレークポイント
        return serializer.save()

    def perform_destroy(self, instance):
        # DELETE /posts/:id/ で通る。← ここにブレークポイント
        return super().perform_destroy(instance)
