from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.shortcuts import get_object_or_404
from django.db.models import Q
from .models import Recipe, Comment, UserProfile, Notification
from .serializers import (RecipeSerializer, CommentSerializer, UserProfileSerializer,
                        NotificationSerializer, UserRegistrationSerializer, UserSerializer)

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def register_user(request):
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        return Response({
            'message': 'User registered successfully'
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login_user(request):
    username = request.data.get('username')
    password = request.data.get('password')
    
    user = authenticate(username=username, password=password)
    
    if user:
        refresh = RefreshToken.for_user(user)
        user_serializer = UserSerializer(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': user_serializer.data
        })
    
    return Response({
        'detail': 'Invalid credentials'
    }, status=status.HTTP_401_UNAUTHORIZED)

class RecipeListCreate(generics.ListCreateAPIView):
    serializer_class = RecipeSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        following = user.profile.following.values_list('user', flat=True)
        return Recipe.objects.filter(
            Q(created_by=user) | Q(created_by__in=following)
        ).order_by('-created_at')
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({'request': self.request})
        return context

class RecipeRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = RecipeSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Recipe.objects.all()
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({'request': self.request})
        return context
    
class AllRecipesListView(generics.ListAPIView):
    queryset = Recipe.objects.all().order_by('-created_at')
    serializer_class = RecipeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({'request': self.request})
        return context

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def toggle_recipe_like(request, pk):
    recipe = get_object_or_404(Recipe, pk=pk)
    user = request.user
    
    if user in recipe.likes.all():
        recipe.likes.remove(user)
        liked = False
    else:
        recipe.likes.add(user)
        liked = True
        if user != recipe.created_by:
            Notification.objects.create(
                recipient=recipe.created_by,
                sender=user,
                notification_type='like',
                recipe=recipe
            )
    
    recipe.update_likes_count()
    return Response({'liked': liked, 'likes_count': recipe.likes_count})

class CommentListCreate(generics.ListCreateAPIView):
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Comment.objects.filter(recipe_id=self.kwargs['recipe_id'])

    def perform_create(self, serializer):
        recipe = get_object_or_404(Recipe, pk=self.kwargs['recipe_id'])
        comment = serializer.save(recipe=recipe)
        if comment.user != recipe.created_by:
            Notification.objects.create(
                recipient=recipe.created_by,
                sender=comment.user,
                notification_type='comment',
                recipe=recipe
            )

class CommentDetail(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Comment.objects.all()

    def perform_destroy(self, instance):
        if instance.user == self.request.user:
            instance.delete()
        else:
            raise permissions.PermissionDenied()

class UserProfileList(generics.ListAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = UserProfile.objects.all()

class UserProfileDetail(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = UserProfile.objects.all()

    def get_object(self):
        pk = self.kwargs.get('pk')
        if pk == 'me':
            return self.request.user.profile
        return super().get_object()

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def toggle_follow(request, pk):
    profile_to_follow = get_object_or_404(UserProfile, pk=pk)
    user_profile = request.user.profile
    
    if profile_to_follow == user_profile:
        return Response({'detail': 'Cannot follow yourself'}, 
                      status=status.HTTP_400_BAD_REQUEST)
    
    if profile_to_follow in user_profile.following.all():
        user_profile.following.remove(profile_to_follow)
        following = False
    else:
        user_profile.following.add(profile_to_follow)
        following = True
        Notification.objects.create(
            recipient=profile_to_follow.user,
            sender=request.user,
            notification_type='follow'
        )
    
    return Response({
        'following': following,
        'followers_count': profile_to_follow.followers.count()
    })

class NotificationList(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(
            recipient=self.request.user
        ).order_by('-created_at')

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def mark_notifications_read(request):
    Notification.objects.filter(
        recipient=request.user,
        is_read=False
    ).update(is_read=True)
    return Response({'status': 'notifications marked as read'})