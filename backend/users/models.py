from django.db import models
class UserProfile(models.Model):

    from django.contrib.auth.models import User
    user       = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    created_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        db_table = 'user_profiles'
        verbose_name = 'User Profile'
    def __str__(self):
        return self.user.username
