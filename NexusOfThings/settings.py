# NexusOfThings/settings.py
import os
from pathlib import Path
import dotenv
import cloudinary
import cloudinary_storage

dotenv.load_dotenv()


BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.getenv('DJANGO_SECRET_KEY', 'your-development-secret-key-change-this-in-production')
CLOUD_NAME = os.getenv('CLOUD_NAME', 'your-development-cloud-name')
API_KEY = os.getenv('API_KEY', 'your-development-api-key-change-this-in-production')
API_SECRET = os.getenv('API_SECRET', 'your-development-api-secret-key-change-this-in-production')

DEBUG = True # Set to True for development

ALLOWED_HOSTS = [
    'localhost',
    '127.0.0.1',
    'nexusofthings.onrender.com',
    '.onrender.com',  # Wildcard for all subdomains    
]

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'events',
    'cloudinary',
    'cloudinary_storage'
]

COCloudinary_folder = 'nexusofthings'

CLOUDINARY_STORAGE = {
    'CLOUD_NAME': CLOUD_NAME,
    'API_KEY': API_KEY,
    'API_SECRET': API_SECRET,
    # Prefix all uploaded media into a dedicated folder in your Cloudinary account
    'MEDIA_PREFIX': COCloudinary_folder,
}

DEFAULT_FILE_STORAGE = 'cloudinary_storage.storage.MediaCloudinaryStorage'

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',  # ADD THIS - right after SecurityMiddleware
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'NexusOfThings.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'NexusOfThings.wsgi.application'

# MongoDB Configuration
DATABASES = {
    'default': {
        'ENGINE': 'djongo',
        'NAME': os.getenv('MONGODB_NAME', 'NexusOfThings'),
        'CLIENT': {
            'host': os.getenv('MONGODB_URI', 'mongodb+srv://Akhil2310:Hasi2310@nexora.j9i1s4f.mongodb.net/'),
            'username': os.getenv('MONGODB_USER', 'Akhil2310'),
            'password': os.getenv('MONGODB_PASS', 'Hasi2310'),
            'authSource': 'admin',
            'authMechanism': 'SCRAM-SHA-1',
        }
    }
}

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# Static files configuration
STATIC_URL = '/static/'
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'


# Development: Use STATICFILES_DIRS
STATICFILES_DIRS = [
    BASE_DIR / 'static',
]

# Production: STATIC_ROOT (for collectstatic)
STATIC_ROOT = BASE_DIR / 'staticfiles'

# Create directories if they don't exist
os.makedirs(BASE_DIR / 'static', exist_ok=True)
os.makedirs(BASE_DIR / 'staticfiles', exist_ok=True)
os.makedirs(BASE_DIR / 'static/css', exist_ok=True)
os.makedirs(BASE_DIR / 'static/js', exist_ok=True)
os.makedirs(BASE_DIR / 'static/images', exist_ok=True)
os.makedirs(BASE_DIR / 'static/videos', exist_ok=True)

# Media files
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'
os.makedirs(MEDIA_ROOT, exist_ok=True)

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Security settings (only when DEBUG=False)
if not DEBUG:
    SECURE_BROWSER_XSS_FILTER = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    X_FRAME_OPTIONS = 'DENY'
