# Deployment Guide - Fly.io

This guide explains how to deploy the Geo-Project Management App to Fly.io.

## 🏗️ Project Structure

```
sqd/
├── backend/                 # Laravel API
│   ├── app/
│   ├── database/
│   ├── routes/
│   ├── Dockerfile          # Backend Docker configuration
│   ├── fly.toml           # Backend Fly.io configuration
│   └── composer.json
├── frontend/               # Next.js Frontend
│   ├── src/
│   ├── Dockerfile         # Frontend Docker configuration
│   ├── fly.toml          # Frontend Fly.io configuration
│   └── package.json
└── README.md
```

## 🚀 Prerequisites

1. Install the [Fly CLI](https://fly.io/docs/hands-on/install-flyctl/)
2. Sign up for a [Fly.io account](https://fly.io/app/sign-up)
3. Login to Fly.io: `flyctl auth login`

## 📊 Backend Deployment (Laravel)

### Step 1: Navigate to Backend Directory

```bash
cd backend
```

### Step 2: Create Fly.io App

```bash
flyctl apps create sqd-backend --org personal
```

### Step 3: Set Up Database

Create a PostgreSQL database:

```bash
flyctl postgres create --name sqd-backend-db --org personal
flyctl postgres attach --app sqd-backend sqd-backend-db
```

### Step 4: Set Environment Variables

```bash
flyctl secrets set APP_NAME="Geo-Project Management" --app sqd-backend
flyctl secrets set APP_ENV=production --app sqd-backend
flyctl secrets set APP_DEBUG=false --app sqd-backend
flyctl secrets set APP_KEY=$(php artisan key:generate --show) --app sqd-backend
flyctl secrets set APP_URL=https://sqd-backend.fly.dev --app sqd-backend
```

### Step 5: Deploy Backend

```bash
flyctl deploy --app sqd-backend
```

### Step 6: Verify Backend Deployment

```bash
curl https://sqd-backend.fly.dev/api/health
```

## ⚡ Frontend Deployment (Next.js)

### Step 1: Navigate to Frontend Directory

```bash
cd ../frontend
```

### Step 2: Create Fly.io App

```bash
flyctl apps create sqd-frontend --org personal
```

### Step 3: Set Environment Variables

```bash
flyctl secrets set NEXT_PUBLIC_API_URL=https://sqd-backend.fly.dev --app sqd-frontend
```

### Step 4: Deploy Frontend

```bash
flyctl deploy --app sqd-frontend
```

### Step 5: Verify Frontend Deployment

Visit: https://sqd-frontend.fly.dev

## 🔧 Configuration Details

### Backend Configuration (fly.toml)

- **App Name**: `sqd-backend`
- **Internal Port**: 8080 (Laravel runs on Apache)
- **Health Check**: `/api/health`
- **Database**: PostgreSQL (automatically attached)
- **Memory**: 1GB
- **Auto-scaling**: Enabled (0 minimum machines)

### Frontend Configuration (fly.toml)

- **App Name**: `sqd-frontend`
- **Internal Port**: 3000 (Next.js default)
- **Health Check**: `/`
- **Memory**: 1GB
- **Auto-scaling**: Enabled (0 minimum machines)

## 🔄 Updating Your Apps

### Update Backend

```bash
cd backend
flyctl deploy --app sqd-backend
```

### Update Frontend

```bash
cd frontend
flyctl deploy --app sqd-frontend
```

## 🛠️ Useful Commands

### View App Status

```bash
flyctl status --app sqd-backend
flyctl status --app sqd-frontend
```

### View Logs

```bash
flyctl logs --app sqd-backend
flyctl logs --app sqd-frontend
```

### Scale Apps

```bash
flyctl scale count 2 --app sqd-backend  # Scale to 2 instances
flyctl scale memory 2048 --app sqd-backend  # Scale to 2GB RAM
```

### Access Database

```bash
flyctl postgres connect --app sqd-backend-db
```

## 🔍 Environment Variables

### Backend Environment Variables

```env
APP_NAME="Geo-Project Management"
APP_ENV=production
APP_DEBUG=false
APP_KEY=base64:your-generated-key
APP_URL=https://sqd-backend.fly.dev
DB_CONNECTION=pgsql
DB_HOST=top2.nearest.of.sqd-backend-db.internal
DB_PORT=5432
DB_DATABASE=sqd_backend
DB_USERNAME=postgres
DB_PASSWORD=your-generated-password
LOG_CHANNEL=stderr
LOG_LEVEL=info
CACHE_DRIVER=file
SESSION_DRIVER=file
QUEUE_CONNECTION=sync
```

### Frontend Environment Variables

```env
NEXT_PUBLIC_API_URL=https://sqd-backend.fly.dev
NODE_ENV=production
```

## 🚨 Troubleshooting

### Backend Issues

1. **Database Connection**: Ensure the database is attached and running
   ```bash
   flyctl postgres list
   flyctl status --app sqd-backend-db
   ```

2. **Migration Issues**: Run migrations manually
   ```bash
   flyctl ssh console --app sqd-backend
   php artisan migrate --force
   ```

3. **View Logs**: Check application logs for errors
   ```bash
   flyctl logs --app sqd-backend
   ```

### Frontend Issues

1. **Build Failures**: Check if all dependencies are installed
   ```bash
   flyctl logs --app sqd-frontend
   ```

2. **API Connection**: Verify the backend URL is correct
   ```bash
   flyctl secrets list --app sqd-frontend
   ```

### General Issues

1. **App Not Starting**: Check resource limits
   ```bash
   flyctl scale show --app your-app-name
   ```

2. **SSL Certificate**: Fly.io automatically provides SSL certificates
   ```bash
   flyctl certs list --app your-app-name
   ```

## 💰 Cost Optimization

- **Auto-scaling**: Both apps are configured to scale down to 0 machines when idle
- **Shared CPU**: Using shared CPU instances for cost efficiency
- **Database**: PostgreSQL database will incur costs when running

## 🔐 Security

- **HTTPS**: Automatically enabled with Let's Encrypt certificates
- **Environment Variables**: Stored securely as Fly.io secrets
- **Database**: Private network connection between app and database

## 📚 Documentation

- **Fly.io**: [Fly.io Documentation](https://fly.io/docs/)
- **Laravel on Fly.io**: [Laravel Deployment Guide](https://fly.io/docs/laravel/)
- **Next.js on Fly.io**: [Next.js Deployment Guide](https://fly.io/docs/js/frameworks/nextjs/)

## 🎯 Production Checklist

- [ ] Backend deployed and accessible
- [ ] Database migrations completed
- [ ] Frontend deployed and accessible
- [ ] API endpoints working from frontend
- [ ] SSL certificates active
- [ ] Environment variables configured
- [ ] Health checks passing
- [ ] Auto-scaling configured
- [ ] Monitoring set up (optional)