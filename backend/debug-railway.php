<?php

// Railway Debug Script
// This script helps debug working directory and file system issues

echo "=== Railway Debug Information ===\n";

// Basic system information
echo "PHP Version: " . PHP_VERSION . "\n";
echo "Current working directory: " . getcwd() . "\n";
echo "Script location: " . __FILE__ . "\n";
echo "Document root: " . ($_SERVER['DOCUMENT_ROOT'] ?? 'not set') . "\n";

// Check if we're in a container
echo "Container environment: " . (file_exists('/.dockerenv') ? 'Yes' : 'No') . "\n";

// List current directory contents
echo "\n=== Current Directory Contents ===\n";
$files = scandir('.');
foreach ($files as $file) {
    if ($file !== '.' && $file !== '..') {
        $type = is_dir($file) ? 'DIR' : 'FILE';
        $size = is_file($file) ? filesize($file) : 'N/A';
        echo sprintf("%-20s %s %s\n", $file, $type, $size);
    }
}

// Check for Laravel files
echo "\n=== Laravel File Check ===\n";
$laravelFiles = ['artisan', 'composer.json', 'bootstrap/app.php', 'config/app.php'];
foreach ($laravelFiles as $file) {
    $exists = file_exists($file) ? 'EXISTS' : 'MISSING';
    echo sprintf("%-20s %s\n", $file, $exists);
}

// Check environment variables
echo "\n=== Environment Variables ===\n";
$envVars = ['APP_ENV', 'APP_DEBUG', 'DB_CONNECTION', 'DB_HOST', 'PORT'];
foreach ($envVars as $var) {
    $value = $_ENV[$var] ?? $_SERVER[$var] ?? 'not set';
    echo sprintf("%-20s %s\n", $var, $value);
}

// Check if we can write to storage
echo "\n=== Storage Permissions ===\n";
$storageDirs = ['storage', 'storage/logs', 'storage/framework', 'bootstrap/cache'];
foreach ($storageDirs as $dir) {
    if (is_dir($dir)) {
        $writable = is_writable($dir) ? 'WRITABLE' : 'NOT WRITABLE';
        echo sprintf("%-20s %s\n", $dir, $writable);
    } else {
        echo sprintf("%-20s %s\n", $dir, 'NOT FOUND');
    }
}

echo "\n=== Debug Complete ===\n";
