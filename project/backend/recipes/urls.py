from django.urls import path
from .views import RecipeListCreateView, RecipeDetailView, CommentListCreateView, CategoryListCreateView

urlpatterns = [
    path('recipes/', RecipeListCreateView.as_view(), name='recipe-list'),
    path('recipes/<int:pk>/', RecipeDetailView.as_view(), name='recipe-detail'),
    path('comments/', CommentListCreateView.as_view(), name='comment-list'),
    path('categories/', CategoryListCreateView.as_view(), name='category-list'),
]
