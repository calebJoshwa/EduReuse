from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.mail import send_mail
from django.conf import settings
from .models import ContactMessage


@receiver(post_save, sender=ContactMessage)
def send_contact_email(sender, instance, created, **kwargs):
    if not created:
        return
    recipient = instance.recipient
    sender_user = instance.sender
    book = instance.book
    subject = f"Interest in your book: {book.name}"
    body = f"Hello {recipient.username},\n\nYou have received a new message about your book '{book.name}' from {sender_user.username} ({sender_user.email}).\n\nMessage:\n{instance.message}\n\nPlease reply to {sender_user.email} to continue the conversation.\n\n--\nEduReuse"
    # Use send_mail - for development EMAIL_BACKEND can be console.EmailBackend
    try:
        send_mail(subject, body, settings.DEFAULT_FROM_EMAIL, [recipient.email], fail_silently=False)
    except Exception:
        # avoid crashing on email issues in dev; logging could be added
        pass
