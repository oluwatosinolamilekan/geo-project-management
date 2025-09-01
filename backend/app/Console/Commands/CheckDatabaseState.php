<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class CheckDatabaseState extends Command
{
    protected $signature = 'db:check-state';
    protected $description = 'Check the current state of the database and migrations';

    public function handle()
    {
        $this->info('🔍 Checking database state...');

        try {
            // Test database connection
            $this->info('1. Database Connection:');
            try {
                $pdo = DB::connection()->getPdo();
                $this->info('   ✅ Connected to: ' . DB::connection()->getDatabaseName());
                $this->info('   🔌 Driver: ' . DB::connection()->getDriverName());
            } catch (\Exception $e) {
                $this->error('   ❌ Connection failed: ' . $e->getMessage());
                return 1;
            }

            // Check existing tables
            $this->info('2. Existing Tables:');
            $tables = DB::select("
                SELECT tablename 
                FROM pg_tables 
                WHERE schemaname = 'public' 
                ORDER BY tablename
            ");

            if (empty($tables)) {
                $this->info('   📋 No tables found');
            } else {
                foreach ($tables as $table) {
                    $this->info('   - ' . $table->tablename);
                }
            }

            // Check migrations table
            $this->info('3. Migrations Table:');
            if (Schema::hasTable('migrations')) {
                $this->info('   ✅ Migrations table exists');
                
                $migrations = DB::table('migrations')
                    ->orderBy('batch')
                    ->orderBy('migration')
                    ->get();

                if ($migrations->isEmpty()) {
                    $this->info('   📋 No migration records found');
                } else {
                    $this->info('   📋 Migration records:');
                    foreach ($migrations as $migration) {
                        $this->info('     - ' . $migration->migration . ' (batch ' . $migration->batch . ')');
                    }
                }
            } else {
                $this->info('   ❌ Migrations table does not exist');
            }

            // Check key tables
            $this->info('4. Key Tables Status:');
            $keyTables = ['users', 'regions', 'projects', 'pins'];
            
            foreach ($keyTables as $table) {
                if (Schema::hasTable($table)) {
                    $columns = Schema::getColumnListing($table);
                    $this->info('   ✅ ' . $table . ' table exists (' . count($columns) . ' columns)');
                } else {
                    $this->info('   ❌ ' . $table . ' table missing');
                }
            }

            // Check migration status
            $this->info('5. Laravel Migration Status:');
            $this->call('migrate:status', ['--no-interaction' => true]);

            // Provide recommendations
            $this->info('6. Recommendations:');
            
            if (!Schema::hasTable('migrations')) {
                $this->info('   🔄 Run: php artisan migrate:reset-railway --seed');
            } elseif (Schema::hasTable('users') && !Schema::hasTable('regions')) {
                $this->info('   🔄 Run: php artisan migrate:railway --seed');
            } elseif (!Schema::hasTable('users')) {
                $this->info('   🔄 Run: php artisan migrate:reset-railway --seed');
            } else {
                $this->info('   ✅ Database appears to be in good state');
            }

        } catch (\Exception $e) {
            $this->error('❌ Error checking database state: ' . $e->getMessage());
            return 1;
        }

        return 0;
    }
}
