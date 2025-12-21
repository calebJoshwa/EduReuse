from django.apps import AppConfig


class ApiConfig(AppConfig):
    name = 'api'
    def ready(self):
        # import signals to connect handlers
        try:
            from . import signals  # noqa: F401
        except Exception:
            pass
