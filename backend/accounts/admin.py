from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

class CustomUserAdmin(UserAdmin):
    model = User
    # Ovdje smo ispravili 'country' u 'county'
    list_display = ['username', 'email', 'role', 'city', 'county', 'is_staff']
    
    # I ovdje u fieldsets provjeri da piše 'county'
    fieldsets = UserAdmin.fieldsets + (
        ('Dodatne informacije', {'fields': ('role', 'phone', 'county', 'city', 'zip_code')}),
    )
    
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Dodatne informacije', {'fields': ('role', 'phone', 'county', 'city', 'zip_code')}),
    )

admin.site.register(User, CustomUserAdmin)