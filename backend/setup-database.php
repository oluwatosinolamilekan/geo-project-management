<?php

// Database Setup Script for Railway
// This script manually creates the required tables for the Geo-Project Management app

echo "Setting up database tables manually...\n";

// Load Laravel environment
require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

// Get database connection
$pdo = DB::connection()->getPdo();

try {
    echo "Creating regions table...\n";
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS regions (
            id BIGSERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            created_at TIMESTAMP NULL,
            updated_at TIMESTAMP NULL
        )
    ");

    echo "Creating projects table...\n";
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS projects (
            id BIGSERIAL PRIMARY KEY,
            region_id BIGINT NOT NULL,
            name VARCHAR(255) NOT NULL,
            geo_json JSONB NOT NULL,
            created_at TIMESTAMP NULL,
            updated_at TIMESTAMP NULL,
            FOREIGN KEY (region_id) REFERENCES regions(id) ON DELETE CASCADE
        )
    ");

    echo "Creating pins table...\n";
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS pins (
            id BIGSERIAL PRIMARY KEY,
            project_id BIGINT NOT NULL,
            latitude DECIMAL(10, 8) NOT NULL,
            longitude DECIMAL(11, 8) NOT NULL,
            created_at TIMESTAMP NULL,
            updated_at TIMESTAMP NULL,
            FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
        )
    ");

    echo "Database tables created successfully!\n";

    // Insert sample data
    echo "Inserting sample data...\n";
    
    // Insert sample regions
    $pdo->exec("
        INSERT INTO regions (name, created_at, updated_at) VALUES 
        ('North America', NOW(), NOW()),
        ('Europe', NOW(), NOW()),
        ('Asia', NOW(), NOW())
        ON CONFLICT DO NOTHING
    ");

    // Insert sample projects
    $pdo->exec("
        INSERT INTO projects (region_id, name, geo_json, created_at, updated_at) VALUES 
        (1, 'Central Park Project', '{\"type\":\"Polygon\",\"coordinates\":[[[-73.97,40.76],[-73.95,40.76],[-73.95,40.78],[-73.97,40.78],[-73.97,40.76]]]}', NOW(), NOW()),
        (2, 'London Bridge Project', '{\"type\":\"Polygon\",\"coordinates\":[[[-0.09,51.50],[-0.07,51.50],[-0.07,51.52],[-0.09,51.52],[-0.09,51.50]]]}', NOW(), NOW())
        ON CONFLICT DO NOTHING
    ");

    // Insert sample pins
    $pdo->exec("
        INSERT INTO pins (project_id, latitude, longitude, created_at, updated_at) VALUES 
        (1, 40.77, -73.96, NOW(), NOW()),
        (1, 40.77, -73.95, NOW(), NOW()),
        (2, 51.51, -0.08, NOW(), NOW())
        ON CONFLICT DO NOTHING
    ");

    echo "Sample data inserted successfully!\n";
    echo "Database setup complete!\n";

} catch (Exception $e) {
    echo "Error setting up database: " . $e->getMessage() . "\n";
    exit(1);
}
