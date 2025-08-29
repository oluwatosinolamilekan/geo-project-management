<?php

// Railway Environment Bootstrap Script
// This script sets up the Laravel environment for Railway deployment

echo "Setting up Laravel environment for Railway...\n";

// Debug: Show current working directory and environment
echo "Current working directory: " . getcwd() . "\n";
echo "Script location: " . __FILE__ . "\n";
echo "Document root: " . ($_SERVER['DOCUMENT_ROOT'] ?? 'not set') . "\n";

// Ensure we're in the correct directory
$scriptDir = dirname(__FILE__);
if (getcwd() !== $scriptDir) {
    echo "Changing working directory to script directory: $scriptDir\n";
    chdir($scriptDir);
    echo "New working directory: " . getcwd() . "\n";
}

// Verify Laravel files exist
if (!file_exists('artisan')) {
    echo "Error: artisan file not found in current directory\n";
    echo "Available files:\n";
    $files = scandir('.');
    foreach ($files as $file) {
        if ($file !== '.' && $file !== '..') {
            echo "  - $file\n";
        }
    }
    exit(1);
}

echo "Laravel application found at: " . getcwd() . "\n";

// Set default environment variables if not provided
$envVars = [
    'APP_NAME' => $_ENV['APP_NAME'] ?? 'Geo-Project Management',
    'APP_ENV' => $_ENV['APP_ENV'] ?? 'production',
    'APP_DEBUG' => $_ENV['APP_DEBUG'] ?? 'false',
    'APP_URL' => $_ENV['APP_URL'] ?? 'http://localhost',
    'LOG_CHANNEL' => $_ENV['LOG_CHANNEL'] ?? 'stack',
    'LOG_LEVEL' => $_ENV['LOG_LEVEL'] ?? 'debug',
    'DB_CONNECTION' => $_ENV['DB_CONNECTION'] ?? 'pgsql',
    'DB_HOST' => $_ENV['DB_HOST'] ?? '127.0.0.1',
    'DB_PORT' => $_ENV['DB_PORT'] ?? '5432',
    'DB_DATABASE' => $_ENV['DB_DATABASE'] ?? 'laravel',
    'DB_USERNAME' => $_ENV['DB_USERNAME'] ?? 'root',
    'DB_PASSWORD' => $_ENV['DB_PASSWORD'] ?? '',
    'CACHE_DRIVER' => $_ENV['CACHE_DRIVER'] ?? 'file',
    'SESSION_DRIVER' => $_ENV['SESSION_DRIVER'] ?? 'file',
    'QUEUE_CONNECTION' => $_ENV['QUEUE_CONNECTION'] ?? 'sync',
    'CORS_ALLOWED_ORIGINS' => $_ENV['CORS_ALLOWED_ORIGINS'] ?? '*',
];

// Set environment variables
foreach ($envVars as $key => $value) {
    putenv("$key=$value");
    $_ENV[$key] = $value;
    $_SERVER[$key] = $value;
}

echo "Environment variables set successfully.\n";
echo "Database connection: " . ($_ENV['DB_CONNECTION'] ?? 'not set') . "\n";

// Generate APP_KEY if not set
if (empty($_ENV['APP_KEY'])) {
    echo "Generating application key...\n";
    $key = 'base64:' . base64_encode(random_bytes(32));
    putenv("APP_KEY=$key");
    $_ENV['APP_KEY'] = $key;
    $_SERVER['APP_KEY'] = $key;
    echo "Application key generated: $key\n";
}

echo "Laravel environment setup complete.\n";
