from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

class CustomUserAdmin(UserAdmin):
    model = User
    
    # Šta vidiš u tabeli kad otvoriš listu korisnika
    # Dodao sam first_name i last_name jer su bitni za biznis
    list_display = ['email', 'username', 'first_name', 'last_name', 'role','service_type', 'city', 'county', 'is_staff']
    
    # Bočni filteri (ovo ti je spas kad budeš imao puno korisnika)
    list_filter = ('role', 'is_staff', 'is_superuser', 'city', 'county')
    
    # Omogućava pretragu po ovim poljima na vrhu stranice
    search_fields = ('email', 'username', 'first_name', 'last_name', 'phone')
    
    # Redoslijed prikazivanja (opciono, ali email je obično prvi kod ovakvih app)
    ordering = ('email',)

    # Uređivanje postojećeg korisnika
    fieldsets = UserAdmin.fieldsets + (
        ('Dodatne informacije', {
            'fields': (
                'role', 
                'phone', 
                'county', 
                'city', 
                'zip_code', 
                'service_type'  # DODATO: Jako bitno za majstore
            )
        }),
    )
    
    # Kreiranje novog korisnika kroz Admin panel
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Dodatne informacije', {
            'fields': (
                'role', 
                'phone', 
                'county', 
                'city', 
                'zip_code', 
                'service_type' # DODATO
            )
        }),
    )

# Registracija modela
admin.site.register(User, CustomUserAdmin)