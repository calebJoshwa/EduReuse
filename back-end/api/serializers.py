from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Book, ContactMessage, Favorite, Cart

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    book_count = serializers.SerializerMethodField()
    phone = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 'book_count', 'phone']

    def get_book_count(self, obj):
        return obj.books.count()

    def get_phone(self, obj):
        try:
            return obj.profile.phone
        except:
            return ''


class BookSerializer(serializers.ModelSerializer):
    owner = UserSerializer(read_only=True)
    image = serializers.URLField(required=False)

    class Meta:
        model = Book
        fields = ['id', 'name', 'author', 'category', 'condition', 'price', 'description', 'image', 'owner', 'created_at']
        read_only_fields = ['owner', 'created_at']


class ContactMessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)
    recipient = UserSerializer(read_only=True)

    class Meta:
        model = ContactMessage
        fields = ['id', 'sender', 'recipient', 'book', 'message', 'created_at']


class FavoriteSerializer(serializers.ModelSerializer):
    book = BookSerializer(read_only=True)

    class Meta:
        model = Favorite
        fields = ['id', 'book', 'created_at']
        read_only_fields = ['created_at']


class CartSerializer(serializers.ModelSerializer):
    book = BookSerializer(read_only=True)

    class Meta:
        model = Cart
        fields = ['id', 'book', 'quantity', 'added_at']
        read_only_fields = ['added_at']
