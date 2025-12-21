from django.contrib import admin
from .models import Book, ContactMessage


@admin.register(Book)
class BookAdmin(admin.ModelAdmin):
	list_display = ('id', 'name', 'author', 'owner', 'price', 'created_at')
	list_filter = ('category', 'condition')
	search_fields = ('name', 'author', 'category')


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
	list_display = ('id', 'book', 'sender', 'recipient', 'created_at')
	list_filter = ('created_at',)
	search_fields = ('book__name', 'sender__username', 'recipient__username', 'message')
