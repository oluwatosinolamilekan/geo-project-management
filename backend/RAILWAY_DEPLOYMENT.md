# Railway Deployment Guide

This guide explains how to deploy your Laravel application to Railway using Docker.

## Files Created

### 1. `Dockerfile` (Multi-stage)
- **Stage 1**: Composer dependencies installation (production only)
- **Stage 2**: PHP 8.2 FPM with required extensions
- **Stage 3**: Nginx serving Laravel from `/public`

### 2. `docker/nginx/nginx.conf`
- Main Nginx configuration with production optimizations
- Gzip compression, security headers, rate limiting

### 3. `docker/nginx/default.conf`
- Laravel-specific server configuration
- Proper `try_files` rules for Laravel routing
- PHP-FPM integration on port 9000

### 4. `railway.json`
- Railway deployment configuration
- Uses Dockerfile builder
- Post-deploy migrations and optimizations

### 5. `docker-compose.yml`
- Local development environment
- Includes PostgreSQL, Redis, and Adminer

## Railway Environment Variables

Set these in your Railway project:

```bash
APP_NAME="Geo-Project Management"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-app.railway.app

# Railway auto-provides DATABASE_URL
# But you can also set individual DB vars if needed

CORS_ALLOWED_ORIGINS=https://your-frontend-domain.vercel.app
SESSION_SECURE_COOKIE=true
```

## Deployment Steps

### 1. Connect to Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and link project
railway login
railway link
```

### 2. Set Environment Variables
```bash
railway variables set APP_KEY=$(php artisan key:generate --show)
railway variables set APP_ENV=production
railway variables set APP_DEBUG=false
railway variables set APP_URL=https://your-app.railway.app
```

### 3. Add PostgreSQL Database
- Go to Railway dashboard
- Add PostgreSQL addon
- Railway will automatically set DATABASE_URL

### 4. Deploy
```bash
railway up
```

## Local Development

### Using Docker Compose
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f app

# Access application
# App: http://localhost:8080
# Adminer: http://localhost:8081

# Stop services
docker-compose down
```

### Using Laravel Sail (Alternative)
```bash
# If you prefer Laravel Sail
./vendor/bin/sail up -d
```

## Production Optimizations

### Enabled Features:
- ✅ OPcache for PHP bytecode caching
- ✅ Nginx gzip compression
- ✅ Composer autoloader optimization
- ✅ Laravel config/route/view caching
- ✅ Security headers
- ✅ Rate limiting
- ✅ Health checks

### File Permissions:
- `storage/` and `bootstrap/cache/` properly configured
- Nginx user has appropriate access

### PHP Extensions:
- `pdo_pgsql` for PostgreSQL
- `mbstring` for string handling
- `zip` for compression
- `opcache` for performance

## Health Checks

The application includes a health endpoint at `/health` that returns:
```
HTTP 200 OK
healthy
```

## Troubleshooting

### Common Issues:

1. **Database Connection**
   - Ensure DATABASE_URL is set by Railway
   - Check PostgreSQL addon is running

2. **File Permissions**
   - Storage and cache directories are automatically configured
   - Check logs: `railway logs`

3. **Assets Not Loading**
   - Ensure `APP_URL` matches your Railway domain
   - Check Nginx configuration for static file serving

4. **502 Bad Gateway**
   - PHP-FPM might not be starting
   - Check supervisor logs in container

### Debug Commands:
```bash
# View application logs
railway logs

# Connect to running container
railway shell

# Check processes inside container
supervisorctl status
```

## Performance Monitoring

- Use Railway's built-in metrics
- Monitor `/health` endpoint uptime
- Check PHP-FPM status at `/fpm-status` (internal)

## Security Considerations

- HTTPS enforced via Railway
- Security headers configured in Nginx
- PHP expose_php disabled
- Sensitive files blocked by Nginx
- Rate limiting on API routes
