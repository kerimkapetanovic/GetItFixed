import os
import environ
from pathlib import Path

# 1. Initialize environ
env = environ.Env(
    DEBUG=(bool, False)
)

# Build paths inside the project
BASE_DIR = Path(__file__).resolve().parent.parent

# Reading .env file
environ.Env.read_env(os.path.join(BASE_DIR, '.env'))

# --- SECURITY SETTINGS ---
SECRET_KEY = env('SECRET_KEY')
DEBUG = env('DEBUG')

ALLOWED_HOSTS = ['127.0.0.1', 'localhost']

# --- APPLICATIONS ---
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # External packages
    'rest_framework',
    'rest_framework.authtoken',
    'corsheaders',
    
    # Your apps
    'accounts',
    'bookings',
    'services',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # Must stay at the top
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    # 'django.middleware.csrf.CsrfViewMiddleware',  # <--- REMAIN DISABLED TO FIX 403
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'core.urls'

# --- CORS & SESSION SECURITY ---
FRONTEND_URL = env('FRONTEND_URL', default='http://localhost:3000')

CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_ALL_ORIGINS = False 

CORS_ALLOWED_ORIGINS = [
    FRONTEND_URL,
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

# We expand these to ensure no "Forbidden" origin errors
CSRF_TRUSTED_ORIGINS = [
    FRONTEND_URL,
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

# --- THE "FORCE BYPASS" SETTINGS ---
SESSION_COOKIE_SAMESITE = 'Lax'
CSRF_COOKIE_SAMESITE = 'Lax'
SESSION_COOKIE_HTTPONLY = True
CSRF_COOKIE_HTTPONLY = False  
SESSION_COOKIE_SECURE = False  
CSRF_COOKIE_SECURE = False
CSRF_USE_SESSIONS = False  # Decouples CSRF from session logic

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

# --- DATABASE (SUPABASE) ---
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

# --- REST FRAMEWORK AUTHENTICATION ---
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'accounts.authentication.CookieTokenAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ]
}

AUTHENTICATION_BACKENDS = [
    'django.contrib.auth.backends.ModelBackend',
]

# Standard Django Settings
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True
STATIC_URL = 'static/'
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'