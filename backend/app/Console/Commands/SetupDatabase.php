<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class SetupDatabase extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'db:setup';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Set up database tables manually';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Setting up database tables manually...');

        try {
            // Get database connection
            $pdo = DB::connection()->getPdo();

            $this->info('Creating regions table...');
            $pdo->exec("
                CREATE TABLE IF NOT EXISTS regions (
                    id BIGSERIAL PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    created_at TIMESTAMP NULL,
                    updated_at TIMESTAMP NULL
                )
            ");

            $this->info('Creating projects table...');
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

            $this->info('Creating pins table...');
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

            $this->info('Database tables created successfully!');

            // Insert sample data
            $this->info('Inserting sample data...');
            
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

            $this->info('Sample data inserted successfully!');
            $this->info('Database setup complete!');

        } catch (\Exception $e) {
            $this->error('Error setting up database: ' . $e->getMessage());
            return 1;
        }

        return 0;
    }
}
