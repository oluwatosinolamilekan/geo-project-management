# Railway Deployment Fix for Working Directory Issue

## Problem
The error "The provided cwd `/app/public` does not exist" occurs because Railway is trying to run the Laravel application from an incorrect working directory.

## Root Cause
Railway's container environment may be setting the working directory to `/app/public` instead of `/app` (the Laravel root directory), or the application files are not in the expected location.

## Solutions

### Solution 1: Updated Startup Script (Recommended)
Use the updated `start-railway.sh` script which:
- Explicitly sets the working directory
- Verifies Laravel files exist before proceeding
- Provides detailed logging for debugging

```bash
# The script automatically handles working directory issues
chmod +x start-railway.sh && ./start-railway.sh
```

### Solution 2: Alternative Startup Script
Use `start-railway-alt.sh` which uses absolute paths:

```bash
chmod +x start-railway-alt.sh && ./start-railway-alt.sh
```

### Solution 3: Inline Command (Fallback)
Use the fallback configuration in `railway-fallback.json`:

```json
{
  "deploy": {
    "startCommand": "php bootstrap-railway.php && php artisan db:setup && php artisan serve --host=0.0.0.0 --port=$PORT"
  }
}
```

### Solution 4: Debug and Fix
Run the debug script to identify the exact issue:

```bash
php debug-railway.php
```

## Updated Files

1. **start-railway.sh** - Enhanced with working directory management
2. **start-railway-alt.sh** - Alternative approach using absolute paths
3. **bootstrap-railway.php** - Updated with directory validation
4. **railway.json** - Updated with proper permissions
5. **railway-fallback.json** - Simple fallback configuration
6. **debug-railway.php** - Debug script for troubleshooting

## Deployment Steps

1. **Choose a configuration file:**
   - Use `railway.json` for the enhanced script
   - Use `railway-fallback.json` for the simple approach
   - Rename your chosen file to `railway.json`

2. **Deploy to Railway:**
   ```bash
   # If using Railway CLI
   railway up
   
   # Or push to your repository if using GitHub integration
   git add .
   git commit -m "Fix Railway deployment working directory issue"
   git push
   ```

3. **Monitor deployment:**
   - Check Railway logs for any remaining issues
   - Use the debug script if needed: `php debug-railway.php`

## Troubleshooting

### If the issue persists:

1. **Check Railway logs** for the exact error message
2. **Run the debug script** to see the current environment
3. **Verify file structure** in the container
4. **Check environment variables** are properly set

### Common issues:

- **Missing artisan file**: Ensure the Laravel application is properly built
- **Permission issues**: The startup script now handles permissions
- **Environment variables**: The bootstrap script sets defaults

## Verification

After deployment, verify the application is working:

1. Check the application URL
2. Verify API endpoints are responding
3. Check database connectivity
4. Review application logs

The enhanced scripts provide detailed logging to help identify and resolve any remaining issues.
