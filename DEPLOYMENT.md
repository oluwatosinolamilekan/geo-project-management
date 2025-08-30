t# Deployment Guide - Monorepo Structure

This guide explains how to deploy the Geo-Project Management App from a monorepo structure.

## 🏗️ Monorepo Structure

```
geo-project-management-app/
├── backend/                 # Laravel API
│   ├── app/
│   ├── database/
│   ├── routes/
│   └── composer.json
├── frontend/               # Next.js Frontend
│   ├── src/
│   ├── package.json
│   └── vercel.json         # Vercel configuration
├── package.json            # Root workspace config
└── README.md
```

## 🚀 Backend Deployment

### Environment Variables

Configure these environment variables for your backend deployment:

```env
APP_NAME="Geo-Project Management"
APP_ENV=production
APP_KEY=base64:your-generated-key
APP_DEBUG=false
APP_URL=https://your-backend-domain.com

DB_CONNECTION=mysql
DB_HOST=your-database-host
DB_PORT=3306
DB_DATABASE=your-database-name
DB_USERNAME=your-username
DB_PASSWORD=your-password

CORS_ALLOWED_ORIGINS=https://your-frontend-domain.com
```

### Database Setup

1. Set up your database (MySQL, PostgreSQL, etc.)
2. Update the database environment variables
3. Run migrations: `php artisan migrate`

### Deployment Options

You can deploy the backend to any platform that supports PHP/Laravel:
- Heroku
- DigitalOcean App Platform
- AWS Elastic Beanstalk
- Google Cloud Run
- Any VPS with PHP support

## ⚡ Frontend Deployment

### Step 1: Connect Repository to Vercel

1. Go to [Vercel.com](https://vercel.com)
2. Click "New Project" → "Import Git Repository"
3. Select your repository
4. **Important**: Set the **Root Directory** to `frontend`

### Step 2: Configure Build Settings

Vercel will automatically detect Next.js, but verify these settings:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install"
}
```

### Step 3: Environment Variables

Add these environment variables in Vercel:

```env
NEXT_PUBLIC_API_URL=https://your-backend-domain.com
```

### Step 4: Deploy

Vercel will automatically deploy when you push to the main branch.

## 🔧 Local Development

### Backend Setup

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

## 🚀 Deployment Commands

### Backend Commands

```bash
# Install dependencies
composer install --no-dev --optimize-autoloader

# Generate application key
php artisan key:generate --force

# Run migrations
php artisan migrate --force

# Cache configuration
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Start the server
php artisan serve --host=0.0.0.0 --port=$PORT
```

### Frontend Commands

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Start production server
npm start
```

## 🔍 Verification

After deployment, verify:

### Backend Health Check
```bash
curl https://your-backend-domain.com/api/health
```

### API Endpoints
```bash
# Test regions endpoint
curl https://your-backend-domain.com/api/regions

# Test projects endpoint
curl https://your-backend-domain.com/api/projects
```

### Frontend
- Check if the frontend loads correctly
- Verify API calls are working
- Test the application functionality

## 📚 Documentation

- **Laravel**: [Laravel Documentation](https://laravel.com/docs)
- **Next.js**: [Next.js Documentation](https://nextjs.org/docs)
- **Vercel**: [Vercel Documentation](https://vercel.com/docs)
