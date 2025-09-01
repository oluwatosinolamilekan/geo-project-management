<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class MigratePostgresql extends Command
{
    protected $signature = 'migrate:postgresql {--fresh : Run fresh migrations} {--seed : Run seeders after migration}';
    protected $description = 'Run migrations optimized for PostgreSQL with better error handling';

    public function handle()
    {
        $this->info('🐘 Starting PostgreSQL-optimized migrations...');

        try {
            // Test database connection
            $this->info('🔍 Testing database connection...');
            try {
                $pdo = DB::connection()->getPdo();
                $this->info('✅ Database connection established');
                $this->info('📊 Database: ' . DB::connection()->getDatabaseName());
                $this->info('🔌 Driver: ' . DB::connection()->getDriverName());
            } catch (\Exception $e) {
                $this->error('❌ Database connection failed: ' . $e->getMessage());
                throw $e;
            }

            // Handle fresh migrations
            if ($this->option('fresh')) {
                $this->info('🧹 Preparing for fresh migration...');
                $this->prepareFreshMigration();
            }

            // Run migrations with PostgreSQL-specific handling
            $this->info('📦 Running PostgreSQL migrations...');
            $this->runPostgresqlMigrations();

            $this->info('✅ Migrations completed successfully');

            if ($this->option('seed')) {
                $this->info('🌱 Running seeders...');
                $this->runSeeders();
            }

        } catch (\Exception $e) {
            $this->error('❌ Migration failed: ' . $e->getMessage());
            return 1;
        }

        $this->info('🎉 PostgreSQL migration completed successfully!');
        return 0;
    }

    private function prepareFreshMigration()
    {
        try {
            // Check if migrations table exists
            if (!Schema::hasTable('migrations')) {
                $this->info('📋 Migrations table does not exist, will be created during migration');
                return;
            }

            // Get all table names except migrations
            $tables = DB::select("
                SELECT tablename 
                FROM pg_tables 
                WHERE schemaname = 'public' 
                AND tablename != 'migrations'
            ");

            if (empty($tables)) {
                $this->info('📋 No existing tables to drop');
                return;
            }

            $this->info('🗑️ Dropping existing tables...');
            
            // Disable foreign key checks temporarily
            DB::statement('SET session_replication_role = replica');
            
            // Drop tables
            foreach ($tables as $table) {
                $tableName = $table->tablename;
                $this->info("   Dropping table: {$tableName}");
                DB::statement("DROP TABLE IF EXISTS \"{$tableName}\" CASCADE");
            }
            
            // Re-enable foreign key checks
            DB::statement('SET session_replication_role = DEFAULT');
            
            // Clear migrations table
            $this->info('🧹 Clearing migrations table...');
            DB::table('migrations')->truncate();
            
        } catch (\Exception $e) {
            $this->warn('⚠️ Could not prepare fresh migration: ' . $e->getMessage());
            $this->info('🔄 Will attempt standard migration...');
        }
    }

    private function runPostgresqlMigrations()
    {
        try {
            // First, try to create migrations table if it doesn't exist
            if (!Schema::hasTable('migrations')) {
                $this->info('📋 Creating migrations table...');
                $this->createMigrationsTable();
            }

            // Run migrations with force flag
            $this->info('📦 Running pending migrations...');
            $this->call('migrate', [
                '--force' => true,
                '--no-interaction' => true,
            ]);
            
        } catch (\Exception $e) {
            $this->error('❌ Standard migration failed: ' . $e->getMessage());
            
            // Try alternative approach - run migrations one by one
            $this->info('🔄 Attempting alternative migration approach...');
            $this->runMigrationsAlternative();
        }
    }

    private function createMigrationsTable()
    {
        $sql = "
            CREATE TABLE IF NOT EXISTS migrations (
                id SERIAL PRIMARY KEY,
                migration VARCHAR(255) NOT NULL,
                batch INTEGER NOT NULL
            )
        ";
        
        DB::statement($sql);
        $this->info('✅ Migrations table created');
    }

    private function runMigrationsAlternative()
    {
        try {
            // Define migration order based on dependencies
            $migrationOrder = [
                '0001_01_01_000000_create_users_table',
                '0001_01_01_000001_create_cache_table', 
                '0001_01_01_000002_create_jobs_table',
                '0001_01_01_000003_create_sessions_table',
                '2025_08_28_140523_create_regions_table',
                '2025_08_28_140613_create_projects_table',
                '2025_08_28_140618_create_pins_table'
            ];

            $this->info('📁 Running migrations in dependency order...');
            
            // Get already run migrations
            $runMigrations = $this->getRunMigrations();
            
            $batch = 1;
            foreach ($migrationOrder as $migrationName) {
                $this->info("   Checking: {$migrationName}");
                
                // Check if migration already exists
                if (in_array($migrationName, $runMigrations)) {
                    $this->info("   ⏭️ {$migrationName} already exists");
                    continue;
                }
                
                // Check if table already exists
                $tableName = $this->getTableNameFromMigration($migrationName);
                if ($tableName && Schema::hasTable($tableName)) {
                    $this->info("   ⏭️ Table {$tableName} already exists, marking migration as run");
                    $this->markMigrationAsRun($migrationName, $batch);
                    continue;
                }
                
                try {
                    // Find the migration file
                    $migrationPath = database_path('migrations');
                    $files = glob($migrationPath . '/*.php');
                    $targetFile = null;
                    
                    foreach ($files as $file) {
                        if (strpos($file, $migrationName) !== false) {
                            $targetFile = $file;
                            break;
                        }
                    }
                    
                    if ($targetFile) {
                        $this->info("   Running: {$migrationName}");
                        
                        // Use Laravel's migrate command with the specific migration file
                        $this->call('migrate', [
                            '--path' => dirname($targetFile),
                            '--force' => true,
                            '--no-interaction' => true,
                        ]);
                        
                        $this->info("   ✅ {$migrationName} completed");
                    } else {
                        $this->warn("   ⚠️ Migration file not found: {$migrationName}");
                    }
                    
                } catch (\Exception $e) {
                    $this->error("   ❌ {$migrationName} failed: " . $e->getMessage());
                    
                    // If it's a duplicate table error, mark it as run
                    if (strpos($e->getMessage(), 'Duplicate table') !== false || 
                        strpos($e->getMessage(), 'already exists') !== false) {
                        $this->info("   🔄 Marking {$migrationName} as run due to existing table");
                        $this->markMigrationAsRun($migrationName, $batch);
                    } else {
                        throw $e;
                    }
                }
                
                $batch++;
            }
            
        } catch (\Exception $e) {
            $this->error('❌ Alternative migration approach failed: ' . $e->getMessage());
            throw $e;
        }
    }

    private function getRunMigrations()
    {
        try {
            return DB::table('migrations')->pluck('migration')->toArray();
        } catch (\Exception $e) {
            return [];
        }
    }

    private function getTableNameFromMigration($migrationName)
    {
        // Extract table name from migration filename
        if (preg_match('/create_(\w+)_table/', $migrationName, $matches)) {
            return $matches[1];
        }
        return null;
    }

    private function markMigrationAsRun($migrationName, $batch)
    {
        try {
            DB::table('migrations')->insert([
                'migration' => $migrationName,
                'batch' => $batch
            ]);
        } catch (\Exception $e) {
            $this->warn("   ⚠️ Could not mark migration as run: " . $e->getMessage());
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
