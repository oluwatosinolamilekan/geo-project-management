<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class ResetAndMigrate extends Command
{
    protected $signature = 'migrate:reset-railway {--seed : Run seeders after migration}';
    protected $description = 'Reset database and run migrations for Railway deployment';

    public function handle()
    {
        $this->info('🔄 Starting Railway database reset and migration...');

        try {
            // Test database connection
            $this->info('🔍 Testing database connection...');
            try {
                $pdo = DB::connection()->getPdo();
                $this->info('✅ Database connection established');
                $this->info('📊 Database: ' . DB::connection()->getDatabaseName());
            } catch (\Exception $e) {
                $this->error('❌ Database connection failed: ' . $e->getMessage());
                throw $e;
            }

            // Drop all tables except migrations
            $this->info('🗑️ Dropping all existing tables...');
            $this->dropAllTables();

            // Clear migrations table
            $this->info('🧹 Clearing migrations table...');
            $this->clearMigrationsTable();

            // Run migrations
            $this->info('📦 Running migrations...');
            $this->runMigrations();

            $this->info('✅ Migrations completed successfully');

            if ($this->option('seed')) {
                $this->info('🌱 Running seeders...');
                $this->runSeeders();
            }

        } catch (\Exception $e) {
            $this->error('❌ Reset and migration failed: ' . $e->getMessage());
            return 1;
        }

        $this->info('🎉 Railway reset and migration completed successfully!');
        return 0;
    }

    private function dropAllTables()
    {
        try {
            // Get all table names
            $tables = DB::select("
                SELECT tablename 
                FROM pg_tables 
                WHERE schemaname = 'public'
            ");

            if (empty($tables)) {
                $this->info('📋 No existing tables to drop');
                return;
            }

            // Disable foreign key checks temporarily
            DB::statement('SET session_replication_role = replica');
            
            // Drop all tables
            foreach ($tables as $table) {
                $tableName = $table->tablename;
                $this->info("   Dropping table: {$tableName}");
                DB::statement("DROP TABLE IF EXISTS \"{$tableName}\" CASCADE");
            }
            
            // Re-enable foreign key checks
            DB::statement('SET session_replication_role = DEFAULT');
            
        } catch (\Exception $e) {
            $this->warn('⚠️ Could not drop all tables: ' . $e->getMessage());
            throw $e;
        }
    }

    private function clearMigrationsTable()
    {
        try {
            // Drop migrations table if it exists
            DB::statement('DROP TABLE IF EXISTS migrations CASCADE');
        } catch (\Exception $e) {
            $this->warn('⚠️ Could not clear migrations table: ' . $e->getMessage());
        }
    }

    private function runMigrations()
    {
        try {
            // Run migrations with force flag
            $this->call('migrate', [
                '--force' => true,
                '--no-interaction' => true,
            ]);
            
        } catch (\Exception $e) {
            $this->error('❌ Migration failed: ' . $e->getMessage());
            throw $e;
        }
    }

    private function runSeeders()
    {
        try {
            $this->call('db:seed', [
                '--force' => true,
                '--no-interaction' => true,
            ]);
            $this->info('✅ Seeding completed');
        } catch (\Exception $e) {
            $this->error('❌ Seeding failed: ' . $e->getMessage());
            throw $e;
        }
    }
}
