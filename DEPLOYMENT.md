# Deployment Guide - Monorepo Structure

This guide explains how to deploy the Geo-Project Management App from a monorepo structure to Railway.app (backend) and Vercel (frontend).

## 🏗️ Monorepo Structure

```
geo-project-management-app/
├── backend/                 # Deploy to Railway.app
│   ├── app/
│   ├── database/
│   ├── routes/
│   ├── composer.json
│   └── railway.json         # Railway configuration
├── frontend/               # Deploy to Vercel
│   ├── src/
│   ├── package.json
│   └── vercel.json         # Vercel configuration
├── package.json            # Root workspace config
└── README.md
```

## 🚀 Railway.app Backend Deployment

### Step 1: Connect Repository to Railway

1. Go to [Railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. **Important**: Set the **Root Directory** to `backend`

### Step 2: Configure Environment Variables

In Railway dashboard, add these environment variables:

```env
APP_NAME="Geo-Project Management"
APP_ENV=production
APP_KEY=base64:your-generated-key
APP_DEBUG=false
APP_URL=https://your-railway-app.railway.app

DB_CONNECTION=mysql
DB_HOST=your-mysql-host
DB_PORT=3306
DB_DATABASE=your-database-name
DB_USERNAME=your-username
DB_PASSWORD=your-password

CORS_ALLOWED_ORIGINS=https://your-vercel-app.vercel.app
```

### Step 3: Database Setup

1. Add a MySQL plugin in Railway
2. Update the database environment variables
3. Run migrations: `php artisan migrate`

### Step 4: Deploy

Railway will automatically deploy when you push to the main branch.

## ⚡ Vercel Frontend Deployment

### Step 1: Connect Repository to Vercel

1. Go to [Vercel.com](https://vercel.com)
2. Click "New Project" → "Import Git Repository"
3. Select your repository
4. **Important**: Set the **Root Directory** to `frontend`

### Step 2: Configure Build Settings

Vercel will automatically detect Next.js, but verify these settings:

- **Framework Preset**: Next.js
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### Step 3: Environment Variables

Add these environment variables in Vercel:

```env
NEXT_PUBLIC_API_URL=https://your-railway-app.railway.app
```

### Step 4: Deploy

Vercel will automatically deploy when you push to the main branch.

## 🔧 Manual Deployment Commands

### Railway CLI (Backend)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Link to your project
cd backend
railway link

# Deploy
railway up
```

### Vercel CLI (Frontend)

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
cd frontend
vercel --prod
```

## 🔄 Automated Deployment with GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Railway and Vercel

on:
  push:
    branches: [ main ]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
    - name: Deploy to Railway
      uses: railway/deploy@v1
      with:
        service: backend
        token: ${{ secrets.RAILWAY_TOKEN }}

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v25
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
        vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
        working-directory: ./frontend
```

## 🔐 Required Secrets

### Railway Secrets
- `RAILWAY_TOKEN`: Your Railway API token

### Vercel Secrets
- `VERCEL_TOKEN`: Your Vercel API token
- `VERCEL_ORG_ID`: Your Vercel organization ID
- `VERCEL_PROJECT_ID`: Your Vercel project ID

## 📋 Deployment Checklist

### Backend (Railway)
- [ ] Repository connected with `backend` root directory
- [ ] Environment variables configured
- [ ] Database plugin added
- [ ] Migrations run successfully
- [ ] API endpoints responding correctly
- [ ] CORS configured for frontend domain

### Frontend (Vercel)
- [ ] Repository connected with `frontend` root directory
- [ ] Environment variables set
- [ ] Build completing successfully
- [ ] Frontend connecting to backend API
- [ ] Map functionality working
- [ ] All features tested

## 🚨 Troubleshooting

### Common Issues

1. **Build Failures**
   - Check if all dependencies are in the correct directories
   - Verify package.json files are in the right locations

2. **API Connection Issues**
   - Ensure CORS is configured correctly
   - Verify environment variables are set
   - Check if Railway URL is accessible

3. **Database Issues**
   - Run migrations manually if needed
   - Check database connection settings
   - Verify database plugin is active

### Debug Commands

```bash
# Check Railway logs
railway logs

# Check Vercel logs
vercel logs

# Test API locally
curl https://your-railway-app.railway.app/api/regions

# Test frontend build locally
cd frontend && npm run build
```

## 📞 Support

- **Railway**: [Railway Documentation](https://docs.railway.app)
- **Vercel**: [Vercel Documentation](https://vercel.com/docs)
- **GitHub Actions**: [GitHub Actions Documentation](https://docs.github.com/en/actions)
