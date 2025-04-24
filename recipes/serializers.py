from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Recipe, Comment, UserProfile, Notification

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']

class UserProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    followers_count = serializers.SerializerMethodField()
    following_count = serializers.SerializerMethodField()
    recipes_count = serializers.SerializerMethodField()

    class Meta:
        model = UserProfile
        fields = ['id', 'username', 'email', 'bio', 'favorite_cuisine', 
                 'followers_count', 'following_count', 'recipes_count']

    def get_followers_count(self, obj):
        return obj.followers.count()

    def get_following_count(self, obj):
        return obj.following.count()

    def get_recipes_count(self, obj):
        return obj.user.recipes.count()

class CommentSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'recipe', 'user', 'username', 'content', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

class RecipeSerializer(serializers.ModelSerializer):
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    is_liked = serializers.SerializerMethodField()
    comments = CommentSerializer(many=True, read_only=True)
    comments_count = serializers.SerializerMethodField()

    class Meta:
        model = Recipe
        fields = ['id', 'title', 'description', 'ingredients', 'instructions', 
                 'cooking_time', 'servings', 'image', 'category', 'created_by',
                 'created_by_username', 'created_at', 'updated_at', 'likes_count',
                 'is_liked', 'comments', 'comments_count']
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at', 
                           'likes_count', 'comments']

    def get_is_liked(self, obj):
        user = self.context['request'].user
        return user in obj.likes.all() if user.is_authenticated else False

    def get_comments_count(self, obj):
        return obj.comments.count()

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)

class NotificationSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    sender_username = serializers.CharField(source='sender.username', read_only=True)
    notification_type = serializers.CharField(read_only=True)
    recipe_title = serializers.CharField(source='recipe.title', read_only=True)
    created_at = serializers.DateTimeField(read_only=True)
    is_read = serializers.BooleanField()

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password']
    
    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        UserProfile.objects.create(user=user)
        return user