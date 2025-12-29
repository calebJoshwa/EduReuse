from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import test_api, BookViewSet, login_view, logout_view, current_user, get_csrf, signup_view, ContactMessageViewSet, FavoriteViewSet, CartViewSet, users_list, order_view

router = DefaultRouter()
router.register(r'books', BookViewSet, basename='book')
router.register(r'messages', ContactMessageViewSet, basename='message')
router.register(r'favorites', FavoriteViewSet, basename='favorite')
router.register(r'cart', CartViewSet, basename='cart')

urlpatterns = [
    path('test/', test_api),
    path('auth/login/', login_view),
    path('auth/signup/', signup_view),
    path('auth/logout/', logout_view),
    path('auth/user/', current_user),
    path('auth/csrf/', get_csrf),
    path('users/', users_list),
    path('order/', order_view),
    path('', include(router.urls)),
]
