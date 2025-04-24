from django.urls import path
from rest_framework.authtoken.views import obtain_auth_token
from . import views

urlpatterns = [
    # Authentication
    path('auth/register/', views.register_user, name='register'),
    path('auth/login/', views.login_user, name='login'),
    
    # Recipes
    path('recipes/', views.RecipeListCreate.as_view(), name='recipe-list-create'),
    path('recipes/<int:pk>/', views.RecipeRetrieveUpdateDestroy.as_view(), name='recipe-detail'),
    path('recipes/<int:pk>/like/', views.toggle_recipe_like, name='recipe-like'),
    path('recipes/all/', views.AllRecipesListView.as_view(), name='all-recipes'),

    # Comments
    path('recipes/<int:recipe_id>/comments/', views.CommentListCreate.as_view(), name='comment-list-create'),
    path('comments/<int:pk>/', views.CommentDetail.as_view(), name='comment-detail'),
    
    # User Profiles
    path('profiles/', views.UserProfileList.as_view(), name='profile-list'),
    path('profiles/<int:pk>/', views.UserProfileDetail.as_view(), name='profile-detail'),
    path('profiles/<int:pk>/follow/', views.toggle_follow, name='profile-follow'),
    
    # Notifications
    path('notifications/', views.NotificationList.as_view(), name='notification-list'),
    path('notifications/mark-read/', views.mark_notifications_read, name='notifications-mark-read'),
]