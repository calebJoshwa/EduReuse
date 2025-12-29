from django.shortcuts import render
from django.contrib.auth import authenticate, login, logout
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status, viewsets
from rest_framework.authentication import SessionAuthentication
from django.db.models import Q
from django.core.mail import send_mail
import traceback
from django.conf import settings

from .models import Book
from .serializers import BookSerializer, UserSerializer
from .serializers import ContactMessageSerializer
from .models import ContactMessage
from .models import Favorite
from .models import Profile
from .models import Cart
from .serializers import FavoriteSerializer
from .serializers import CartSerializer
from django.contrib.auth import get_user_model

User = get_user_model()


@api_view(['GET'])
def test_api(request):
    return Response({"message": "Backend connected successfully"})


@api_view(['GET'])
@ensure_csrf_cookie
@permission_classes([])
def get_csrf(request):
    return Response({'detail': 'CSRF cookie set'})


@api_view(['POST'])
@permission_classes([])
def login_view(request):
    try:
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            serializer = UserSerializer(user)
            return Response(serializer.data)
        return Response({'detail': 'Invalid credentials'}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'detail': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def users_list(request):
    if not request.user.is_staff:
        return Response({'detail': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
    users = User.objects.all()
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([])
def current_user(request):
    if request.user.is_authenticated:
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
    return Response({'detail': 'Not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['POST'])
@permission_classes([])
def signup_view(request):
    username = request.data.get('username')
    email = request.data.get('email')
    password = request.data.get('password')
    phone = request.data.get('phone', '')
    if not username or not password:
        return Response({'detail': 'Username and password required'}, status=status.HTTP_400_BAD_REQUEST)
    if User.objects.filter(username=username).exists():
        return Response({'detail': 'Username already exists'}, status=status.HTTP_400_BAD_REQUEST)
    user = User(username=username, email=email)
    user.set_password(password)
    user.save()
    Profile.objects.create(user=user, phone=phone)
    serializer = UserSerializer(user)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([])
def logout_view(request):
    logout(request)
    return Response({'detail': 'Logged out'})


class BookViewSet(viewsets.ModelViewSet):
    queryset = Book.objects.all().order_by('-created_at')
    serializer_class = BookSerializer
    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        qs = Book.objects.all().order_by('-created_at')
        search = self.request.query_params.get('search')
        category = self.request.query_params.get('category')
        if search:
            q = search.strip()
            qs = qs.filter(Q(name__icontains=q) | Q(author__icontains=q) | Q(category__icontains=q))
        if category:
            qs = qs.filter(category__iexact=category)
        return qs

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    def get_permissions(self):
        # Allow read-only for unauthenticated users, require auth to create/update/delete
        return super().get_permissions()


class ContactMessageViewSet(viewsets.ModelViewSet):
    serializer_class = ContactMessageSerializer
    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        inbox = self.request.query_params.get('inbox')
        sent = self.request.query_params.get('sent')
        if inbox == 'true':
            return ContactMessage.objects.filter(recipient=self.request.user).order_by('-created_at')
        if sent == 'true':
            return ContactMessage.objects.filter(sender=self.request.user).order_by('-created_at')
        return ContactMessage.objects.filter(recipient=self.request.user).order_by('-created_at')

    def create(self, request, *args, **kwargs):
        book_id = request.data.get('book')
        message_text = request.data.get('message')
        if not book_id or not message_text:
            return Response({'detail': 'book and message are required'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            book = Book.objects.get(pk=book_id)
        except Book.DoesNotExist:
            return Response({'detail': 'Book not found'}, status=status.HTTP_404_NOT_FOUND)
        recipient = book.owner
        cm = ContactMessage.objects.create(sender=request.user, recipient=recipient, book=book, message=message_text)
        print(f"Sending message from {request.user.username} to {recipient.username}, email={recipient.email}")
        # Send email to seller
        if recipient.email:
            send_mail(
                f'New message about your book: {book.name}',
                f'Hi {recipient.username},\n\nYou have received a new message from {request.user.username} about your book "{book.name}":\n\n"{message_text}"\n\nPlease log in to EduReuse to respond.\n\nBest,\nEduReuse Team',
                None,  # from email will use DEFAULT_FROM_EMAIL
                [recipient.email],
                fail_silently=False,
            )
        serializer = ContactMessageSerializer(cm)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class FavoriteViewSet(viewsets.ModelViewSet):
    serializer_class = FavoriteSerializer
    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Favorite.objects.filter(user=self.request.user).order_by('-created_at')

    def create(self, request, *args, **kwargs):
        book_id = request.data.get('book')
        if not book_id:
            return Response({'detail': 'book is required'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            book = Book.objects.get(pk=book_id)
        except Book.DoesNotExist:
            return Response({'detail': 'Book not found'}, status=status.HTTP_404_NOT_FOUND)
        print(f"Favorite create request: user={request.user.username}, book_id={book_id}")
        favorite, created = Favorite.objects.get_or_create(user=request.user, book=book)
        if not created:
            print(f"Favorite already exists: user={request.user.username}, book_id={book_id}, fav_id={favorite.id}")
            # return the existing favorite object (idempotent)
            serializer = FavoriteSerializer(favorite)
            return Response(serializer.data, status=status.HTTP_200_OK)
        print(f"Favorite created: user={request.user.username}, fav_id={favorite.id}")
        serializer = FavoriteSerializer(favorite)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


from django.conf import settings

class CartViewSet(viewsets.ModelViewSet):
    serializer_class = CartSerializer
    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        print(f"Fetching cart for user={self.request.user.username}")
        return Cart.objects.filter(user=self.request.user).order_by('-added_at')

    def create(self, request, *args, **kwargs):
        book_id = request.data.get('book')
        quantity = request.data.get('quantity', 1)
        if not book_id:
            return Response({'detail': 'book is required'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            book = Book.objects.get(pk=book_id)
        except Book.DoesNotExist:
            return Response({'detail': 'Book not found'}, status=status.HTTP_404_NOT_FOUND)
        cart_item, created = Cart.objects.get_or_create(user=request.user, book=book, defaults={'quantity': quantity})
        if not created:
            cart_item.quantity += int(quantity)
            cart_item.save()
        print(f"Added to cart: user={request.user.username}, book={book.name}, quantity={cart_item.quantity}")
        serializer = CartSerializer(cart_item)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def order_view(request):
    """Create a simple order and send order details to site email host and seller via email."""
    try:
        print('order_view called by user:', getattr(request.user, 'username', None), 'authenticated:', request.user.is_authenticated)
        print('order_view request.data:', request.data)
        # DEBUG: print email-related settings to diagnose configuration issues
        try:
            print('settings.EMAIL_HOST:', repr(settings.EMAIL_HOST))
            print('settings.EMAIL_BACKEND:', getattr(settings, 'EMAIL_BACKEND', None))
            print('settings.EMAIL_HOST_USER:', getattr(settings, 'EMAIL_HOST_USER', None))
            import os
            print('ENV EMAIL_HOST:', os.environ.get('EMAIL_HOST'))
            print('ENV EMAIL_HOST_USER:', os.environ.get('EMAIL_HOST_USER'))
        except Exception as e:
            print('Failed to read email settings for debug:', e)

        book_id = request.data.get('book')
        quantity = int(request.data.get('quantity', 1))
        shipping = request.data.get('shipping', '')
        if not book_id:
            return Response({'detail': 'book is required'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            book = Book.objects.get(pk=book_id)
        except Book.DoesNotExist:
            return Response({'detail': 'Book not found'}, status=status.HTTP_404_NOT_FOUND)

        buyer = request.user
        seller = book.owner

        # require seller email (user requested message go to seller email shown on book detail)
        if not seller.email:
            return Response({'detail': 'Seller does not have an email address configured'}, status=status.HTTP_400_BAD_REQUEST)

        # try to get buyer full name and phone from Profile
        buyer_fullname = f"{buyer.first_name or ''} {buyer.last_name or ''}".strip() or buyer.username
        buyer_email = buyer.email or 'No email provided'
        buyer_phone = ''
        try:
            buyer_phone = getattr(buyer, 'profile', None) and getattr(buyer.profile, 'phone', '') or ''
        except Exception:
            buyer_phone = ''

        subject = f'New order placed for: {book.name}'
        message = (
            f'Order details:\n'
            f'Book: {book.name} (ID: {book.id})\n'
            f'Price: {book.price}\n'
            f'Quantity: {quantity}\n\n'
            f'Buyer Name: {buyer_fullname}\n'
            f'Buyer Email: {buyer_email}\n'
            f'Buyer Phone: {buyer_phone or "Not provided"}\n\n'
            f'Seller: {seller.username} ({seller.email})\n'
            f'Shipping/Notes: {shipping}\n\n'
            'Please follow up to complete the sale.'
        )

        # quick config validation: EMAIL_HOST must be a host, not an email address
        email_backend = getattr(settings, 'EMAIL_BACKEND', '')
        email_host = getattr(settings, 'EMAIL_HOST', '')
        # If using console backend for development, skip host validation so testing isn't blocked by stray env vars
        if email_backend and 'console' in str(email_backend):
            print('Console email backend in use; skipping EMAIL_HOST validation', email_backend)
        else:
            if email_host and '@' in str(email_host):
                # Don't block the request for local development — warn and allow send to attempt.
                # The send() block below will fallback to console if SMTP fails.
                print('Warning: EMAIL_HOST looks like an email address (misconfigured):', email_host)

        # send to seller email and optionally site admin
        recipients = [seller.email]
        if getattr(settings, 'EMAIL_HOST_USER', None):
            recipients.append(settings.EMAIL_HOST_USER)

        sent_via = None
        try:
            send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, list(set(recipients)), fail_silently=False)
            sent_via = settings.EMAIL_BACKEND
        except Exception as e:
            # If SMTP is configured but EMAIL_HOST looks like an email address (misconfigured),
            # fallback to console backend for this send so local dev can proceed.
            backend = str(getattr(settings, 'EMAIL_BACKEND', '')).lower()
            email_host = str(getattr(settings, 'EMAIL_HOST', '') or '')
            if 'smtp' in backend and '@' in email_host:
                print('Invalid EMAIL_HOST detected at send time; falling back to console backend for this order', email_host)
                from django.test.utils import override_settings
                with override_settings(EMAIL_BACKEND='django.core.mail.backends.console.EmailBackend'):
                    try:
                        send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, list(set(recipients)), fail_silently=False)
                        sent_via = 'console'
                    except Exception as e2:
                        print('Fallback console email also failed', e2)
                        traceback.print_exc()
                        return Response({'detail': str(e2)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            else:
                print('Order email failed', e)
                traceback.print_exc()
                return Response({'detail': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        print(f"Order placed: buyer={buyer.username}, book={book.name}, qty={quantity}, recipients={recipients}, sent_via={sent_via}")
        return Response({'detail': 'Order sent successfully', 'recipients': list(set(recipients)), 'sent_via': sent_via}, status=status.HTTP_201_CREATED)
    except Exception as e:
        print('Unexpected error in order_view:', e)
        traceback.print_exc()
        return Response({'detail': 'Internal server error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
