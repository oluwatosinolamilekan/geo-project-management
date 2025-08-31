# Multi-stage Dockerfile for Laravel on Railway
# Stage 1: Composer dependencies
FROM composer:2.7 AS composer

WORKDIR /app

# Copy composer files
COPY composer.json composer.lock ./

# Install production dependencies
RUN composer install --no-dev --optimize-autoloader --no-scripts --no-interaction --prefer-dist

# Stage 2: PHP-FPM with required extensions
FROM php:8.2-fpm-alpine AS php

# Install system dependencies and PHP extensions
RUN apk add --no-cache \
    postgresql-dev \
    zip \
    libzip-dev \
    oniguruma-dev \
    && docker-php-ext-configure pgsql -with-pgsql=/usr/local/pgsql \
    && docker-php-ext-install \
        pdo \
        pdo_pgsql \
        mbstring \
        zip \
        opcache

# Configure PHP for production
COPY docker/php/php.ini /usr/local/etc/php/conf.d/99-custom.ini
COPY docker/php/opcache.ini /usr/local/etc/php/conf.d/opcache.ini

# Create application directory
WORKDIR /var/www/html

# Copy application code
COPY . .

# Copy vendor from composer stage
COPY --from=composer /app/vendor ./vendor

# Set proper permissions
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 775 /var/www/html/storage \
    && chmod -R 775 /var/www/html/bootstrap/cache

# Generate optimized autoloader and clear caches
RUN php artisan config:clear \
    && php artisan route:clear \
    && php artisan view:clear \
    && php artisan cache:clear

# Stage 3: Nginx with PHP-FPM
FROM nginx:1.25-alpine AS nginx

# Install PHP-FPM
RUN apk add --no-cache \
    php82 \
    php82-fpm \
    php82-pdo \
    php82-pdo_pgsql \
    php82-mbstring \
    php82-zip \
    php82-opcache \
    php82-session \
    php82-tokenizer \
    php82-xml \
    php82-ctype \
    php82-json \
    php82-bcmath \
    php82-fileinfo \
    supervisor

# Copy Nginx configuration
COPY docker/nginx/nginx.conf /etc/nginx/nginx.conf
COPY docker/nginx/default.conf /etc/nginx/conf.d/default.conf

# Copy PHP-FPM configuration
COPY docker/php/www.conf /etc/php82/php-fpm.d/www.conf
COPY docker/php/php.ini /etc/php82/conf.d/99-custom.ini
COPY docker/php/opcache.ini /etc/php82/conf.d/opcache.ini

# Copy supervisor configuration
COPY docker/supervisor/supervisord.conf /etc/supervisord.conf

# Copy application from PHP stage
COPY --from=php /var/www/html /var/www/html

# Set working directory
WORKDIR /var/www/html

# Create required directories and set permissions
RUN mkdir -p /var/www/html/storage/logs \
    && mkdir -p /var/www/html/bootstrap/cache \
    && chown -R nginx:nginx /var/www/html \
    && chmod -R 775 /var/www/html/storage \
    && chmod -R 775 /var/www/html/bootstrap/cache \
    && chown -R nginx:nginx /var/log/nginx \
    && chown -R nginx:nginx /var/cache/nginx \
    && chown -R nginx:nginx /etc/nginx/conf.d

# Create startup script
COPY docker/start.sh /usr/local/bin/start.sh
RUN chmod +x /usr/local/bin/start.sh

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# Start services
CMD ["/usr/local/bin/start.sh"]