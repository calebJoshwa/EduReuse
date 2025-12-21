from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class Book(models.Model):
	CONDITION_CHOICES = [
		('new', 'New'),
		('good', 'Good'),
		('fair', 'Fair'),
		('poor', 'Poor'),
	]

	name = models.CharField(max_length=255)
	author = models.CharField(max_length=255)
	category = models.CharField(max_length=100, blank=True)
	condition = models.CharField(max_length=10, choices=CONDITION_CHOICES, default='good')
	price = models.DecimalField(max_digits=10, decimal_places=2)
	description = models.TextField(blank=True)
	# Use URLField to avoid Pillow dependency for local dev; can switch to ImageField later
	image = models.URLField(blank=True, null=True)
	owner = models.ForeignKey(User, related_name='books', on_delete=models.CASCADE)
	created_at = models.DateTimeField(auto_now_add=True)

	def __str__(self):
		return f"{self.name} by {self.author}"


class ContactMessage(models.Model):
	sender = models.ForeignKey(User, related_name='sent_messages', on_delete=models.CASCADE)
	recipient = models.ForeignKey(User, related_name='received_messages', on_delete=models.CASCADE)
	book = models.ForeignKey(Book, related_name='messages', on_delete=models.CASCADE)
	message = models.TextField()
	created_at = models.DateTimeField(auto_now_add=True)

	def __str__(self):
		return f"Message from {self.sender} to {self.recipient} about {self.book}"


class Favorite(models.Model):
	user = models.ForeignKey(User, related_name='favorites', on_delete=models.CASCADE)
	book = models.ForeignKey(Book, related_name='favorited_by', on_delete=models.CASCADE)
	created_at = models.DateTimeField(auto_now_add=True)

	class Meta:
		unique_together = ('user', 'book')

	def __str__(self):
		return f"{self.user.username} favorited {self.book.name}"


class Profile(models.Model):
	user = models.OneToOneField(User, on_delete=models.CASCADE)
	phone = models.CharField(max_length=15, blank=True)

	def __str__(self):
		return f'{self.user.username} Profile'


class Cart(models.Model):
	user = models.ForeignKey(User, on_delete=models.CASCADE)
	book = models.ForeignKey(Book, on_delete=models.CASCADE)
	quantity = models.PositiveIntegerField(default=1)
	added_at = models.DateTimeField(auto_now_add=True)

	class Meta:
		unique_together = ('user', 'book')

	def __str__(self):
		return f'{self.user.username} cart: {self.book.name}' 
