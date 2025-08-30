<?php

// Railway Health Check Script
// This script helps diagnose 502 errors

echo "=== Railway Health Check ===\n";

// Basic system information
echo "PHP Version: " . PHP_VERSION . "\n";
echo "Current working directory: " . getcwd() . "\n";
echo "Script location: " . __FILE__ . "\n";

// Check Laravel application
echo "\n=== Laravel Application Check ===\n";
if (file_exists('artisan')) {
    echo "✓ artisan file exists\n";
    
    // Try to run a simple artisan command
    $output = shell_exec('php artisan --version 2>&1');
    echo "Artisan version: " . trim($output) . "\n";
} else {
    echo "✗ artisan file not found\n";
    exit(1);
}

// Check environment variables
echo "\n=== Environment Variables ===\n";
$criticalVars = ['APP_ENV', 'APP_DEBUG', 'DB_CONNECTION', 'DB_HOST', 'PORT'];
foreach ($criticalVars as $var) {
    $value = $_ENV[$var] ?? $_SERVER[$var] ?? 'not set';
    echo "$var: $value\n";
}

// Check database connection
echo "\n=== Database Connection Test ===\n";
try {
    // Load Laravel bootstrap
    require_once 'vendor/autoload.php';
    
    // Set up Laravel
    $app = require_once 'bootstrap/app.php';
    $app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();
    
    // Test database connection
    $pdo = DB::connection()->getPdo();
    echo "✓ Database connection successful\n";
    echo "Database: " . DB::connection()->getDatabaseName() . "\n";
} catch (Exception $e) {
    echo "✗ Database connection failed: " . $e->getMessage() . "\n";
}

// Check storage permissions
echo "\n=== Storage Permissions ===\n";
$storageDirs = ['storage', 'storage/logs', 'storage/framework', 'bootstrap/cache'];
foreach ($storageDirs as $dir) {
    if (is_dir($dir)) {
        $writable = is_writable($dir) ? '✓ WRITABLE' : '✗ NOT WRITABLE';
        echo "$dir: $writable\n";
    } else {
        echo "$dir: ✗ NOT FOUND\n";
    }
}

// Check if we can bind to the port
echo "\n=== Port Binding Test ===\n";
$port = $_ENV['PORT'] ?? $_SERVER['PORT'] ?? '8000';
echo "Testing port: $port\n";

// Simple port test
$socket = @socket_create(AF_INET, SOCK_STREAM, SOL_TCP);
if ($socket === false) {
    echo "✗ Could not create socket\n";
} else {
    $result = @socket_bind($socket, '0.0.0.0', $port);
    if ($result === false) {
        echo "✗ Could not bind to port $port\n";
    } else {
        echo "✓ Port $port is available\n";
        socket_close($socket);
    }
}

echo "\n=== Health Check Complete ===\n";
