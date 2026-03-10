import os
import environ
from pathlib import Path

# Inicijalizacija environ-a
env = environ.Env(
    DEBUG=(bool, False)
)

# Putanja do root foldera (backend/)
BASE_DIR = Path(__file__).resolve().parent.parent

# Čitanje .env fajla
environ.Env.read_env(os.path.join(BASE_DIR, '.env'))

# --- SIGURNOSNE POSTAVKE IZ .ENV ---
SECRET_KEY = env('SECRET_KEY')
DEBUG = env('DEBUG')

ALLOWED_HOSTS = ['127.0.0.1', 'localhost']

# --- APLIKACIJE ---
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Eksterni paketi
    'rest_framework',
    'rest_framework.authtoken',
    'corsheaders',
    
    # Tvoje aplikacije
    'accounts',
    'bookings',
    'services',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware', # Mora biti na vrhu!
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'core.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'core.wsgi.application'

# --- BAZA PODATAKA (IZ .ENV) ---
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': env('DB_NAME'),
        'USER': env('DB_USER'),
        'PASSWORD': env('DB_PASSWORD'),
        'HOST': env('DB_HOST'),
        'PORT': env('DB_PORT'),
    }
}

# --- CUSTOM USER MODEL ---
AUTH_USER_MODEL = 'accounts.User'

FRONTEND_URL = env('FRONTEND_URL') # URL tvog React frontenda, npr. http://localhost:3000

# --- CORS (Dozvola za React/Frontend kasnije) ---
CORS_ALLOW_ALL_ORIGINS = True # Za razvojnu fazu je OK

# Ostale standardne postavke
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
    ],
}
AUTHENTICATION_BACKENDS = [
    'django.contrib.auth.backends.ModelBackend',
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True
STATIC_URL = 'static/'
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'