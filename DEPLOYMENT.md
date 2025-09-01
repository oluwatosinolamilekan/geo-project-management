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
APP_URL=https://sublime-forgiveness-production-1f9b.up.railway.app

DB_CONNECTION=pgsql
# Railway will automatically set these:
# DB_HOST, DB_PORT, DB_DATABASE, DB_USERNAME, DB_PASSWORD
# Or you can use DATABASE_URL

CORS_ALLOWED_ORIGINS=https://geo-map-ten.vercel.app
```

### Database Setup

The application is configured to use PostgreSQL for deployment:

1. **Railway PostgreSQL**: Railway automatically provides PostgreSQL database credentials
2. Migrations are automatically run during the build process
3. Initial data is seeded automatically

**Railway will automatically set these environment variables:**
- `DATABASE_URL` (Railway's PostgreSQL connection string)
- Or individual variables: `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`

For local development, you can use any database by updating your local `.env` file:
```env
# PostgreSQL (recommended for production parity)
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=geo_project_local
DB_USERNAME=postgres
DB_PASSWORD=your_password

# Or SQLite for simple local development
DB_CONNECTION=sqlite
DB_DATABASE=database/database.sqlite
```

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

Add these environment variables in Vercel Dashboard:

1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add the following variables:

**For Production:**
```env
NEXT_PUBLIC_API_URL=https://your-railway-backend-url.railway.app
NEXT_PUBLIC_LARAVEL_API_URL=https://your-railway-backend-url.railway.app
```

**For Preview/Development:**
```env
NEXT_PUBLIC_API_URL=https://your-railway-backend-url.railway.app
NEXT_PUBLIC_LARAVEL_API_URL=https://your-railway-backend-url.railway.app
```

**Important Notes:**
- Replace `your-railway-backend-url.railway.app` with your actual Railway deployment URL
- `NEXT_PUBLIC_API_URL` is used for client-side API calls
- `NEXT_PUBLIC_LARAVEL_API_URL` is used for server-side API calls (Next.js API routes)
- Both should point to your Laravel backend deployed on Railway

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
php artisan key:generate --force --no-interaction

# Run migrations
php artisan migrate --force --no-interaction

# Seed the database
php artisan db:seed --force --no-interaction

# Cache configuration
php artisan config:cache --no-interaction
php artisan route:cache --no-interaction
php artisan view:cache --no-interaction

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

## 🔧 Troubleshooting

### Common Deployment Issues

#### APP_KEY Generation Error
If you see "Unable to set application key. No APP_KEY variable was found in the .env file":

1. **Root Cause**: The `.env` file is copied from `env.example` but the `APP_KEY` is empty
2. **Solution**: The `php artisan key:generate --force --no-interaction` command should automatically generate a key
3. **Manual Fix**: If the issue persists, set the `APP_KEY` environment variable in your deployment platform

#### Database Connection Issues
If migrations fail:

1. **PostgreSQL Connection**: Ensure Railway's PostgreSQL service is running
2. **Environment Variables**: Verify that Railway has set the database environment variables
3. **Connection String**: Check if `DATABASE_URL` is set, or individual DB_* variables
4. **Network**: Ensure the app can connect to the PostgreSQL instance

#### CORS Issues
If frontend can't connect to backend:

1. Update `CORS_ALLOWED_ORIGINS` in your backend environment variables
2. Include your frontend domain (e.g., `https://your-app.vercel.app`)
3. For development, include `http://localhost:3000`

#### Build Failures
If the build process fails:

1. Check that all required PHP extensions are installed
2. Verify composer dependencies are compatible
3. Ensure adequate memory and disk space
4. Check the build logs for specific error messages

### Environment Variables Checklist

**Backend (Railway):**
```env
APP_KEY=base64:generated-key-will-be-here
APP_ENV=production
APP_DEBUG=false
APP_URL=https://sublime-forgiveness-production-1f9b.up.railway.app
DB_CONNECTION=pgsql
# Railway automatically sets: DB_HOST, DB_PORT, DB_DATABASE, DB_USERNAME, DB_PASSWORD
CORS_ALLOWED_ORIGINS=https://geo-map-ten.vercel.app
```

**Frontend (Vercel):**
```env
NEXT_PUBLIC_API_URL=https://your-backend-domain.railway.app
NEXT_PUBLIC_LARAVEL_API_URL=https://your-backend-domain.railway.app
```

## 📚 Documentation

- **Laravel**: [Laravel Documentation](https://laravel.com/docs)
- **Next.js**: [Next.js Documentation](https://nextjs.org/docs)
- **Vercel**: [Vercel Documentation](https://vercel.com/docs)
- **Railway**: [Railway Documentation](https://docs.railway.app)