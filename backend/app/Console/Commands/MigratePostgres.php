<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class MigratePostgres extends Command
{
    protected $signature = 'migrate:postgres {--fresh : Run fresh migrations} {--seed : Run seeders after migration}';
    protected $description = 'Run migrations with PostgreSQL-specific handling';

    public function handle()
    {
        $this->info('🚀 Starting PostgreSQL-optimized migrations...');

        try {
            // Test database connection with detailed error reporting
            $this->info('🔍 Testing database connection...');
            try {
                $pdo = DB::connection()->getPdo();
                $this->info('✅ Database connection established');
                $this->info('📊 Database: ' . DB::connection()->getDatabaseName());
                $this->info('🔌 Driver: ' . DB::connection()->getDriverName());
            } catch (\Exception $e) {
                $this->error('❌ Database connection failed: ' . $e->getMessage());
                $this->error('🔍 Connection details:');
                $this->error('   Host: ' . config('database.connections.pgsql.host'));
                $this->error('   Port: ' . config('database.connections.pgsql.port'));
                $this->error('   Database: ' . config('database.connections.pgsql.database'));
                $this->error('   Username: ' . config('database.connections.pgsql.username'));
                throw $e;
            }

            // Check if we have superuser privileges for session_replication_role
            $this->info('🔍 Checking PostgreSQL privileges...');
            $hasSuperuserPrivileges = false;
            try {
                DB::statement('SET session_replication_role = replica;');
                DB::statement('SET session_replication_role = DEFAULT;');
                $hasSuperuserPrivileges = true;
                $this->info('✅ Superuser privileges available - using optimized migration');
            } catch (\Exception $e) {
                $this->warn('⚠️ Limited privileges - using standard migration approach');
                $this->warn('   This is normal on Railway PostgreSQL');
            }

            // Run migrations with appropriate approach
            if ($this->option('fresh')) {
                $this->info('🔄 Running fresh migrations...');
                
                if ($hasSuperuserPrivileges) {
                    // Use optimized approach with foreign key disabling
                    DB::statement('SET session_replication_role = replica;');
                    $this->call('migrate:fresh', [
                        '--force' => true,
                        '--no-interaction' => true,
                    ]);
                    DB::statement('SET session_replication_role = DEFAULT;');
                } else {
                    // Use standard approach without foreign key manipulation
                    $this->call('migrate:fresh', [
                        '--force' => true,
                        '--no-interaction' => true,
                    ]);
                }
            } else {
                $this->info('📦 Running migrations...');
                
                if ($hasSuperuserPrivileges) {
                    // Use optimized approach with foreign key disabling
                    DB::statement('SET session_replication_role = replica;');
                    $this->call('migrate', [
                        '--force' => true,
                        '--no-interaction' => true,
                    ]);
                    DB::statement('SET session_replication_role = DEFAULT;');
                } else {
                    // Use standard approach without foreign key manipulation
                    $this->call('migrate', [
                        '--force' => true,
                        '--no-interaction' => true,
                    ]);
                }
            }

            $this->info('✅ Migrations completed successfully');

            if ($this->option('seed')) {
                $this->info('🌱 Running seeders...');
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

        } catch (\Exception $e) {
            $this->error('❌ Migration failed: ' . $e->getMessage());
            $this->error('🔍 Stack trace:');
            $this->error($e->getTraceAsString());
            
            // Try to re-enable foreign key checks if we disabled them
            if (isset($hasSuperuserPrivileges) && $hasSuperuserPrivileges) {
                try {
                    $this->info('🔧 Attempting to re-enable foreign key checks...');
                    DB::statement('SET session_replication_role = DEFAULT;');
                    $this->info('✅ Foreign key checks re-enabled');
                } catch (\Exception $e2) {
                    $this->warn('⚠️ Could not re-enable foreign key checks: ' . $e2->getMessage());
                }
            }
            
            return 1;
        }

        $this->info('🎉 PostgreSQL migration completed successfully!');
        return 0;
    }
}
