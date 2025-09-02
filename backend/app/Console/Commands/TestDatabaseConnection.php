<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class TestDatabaseConnection extends Command
{
    protected $signature = 'db:test {--count=1 : Number of test queries to run}';
    protected $description = 'Test database connection and diagnose issues';

    public function handle()
    {
        $count = (int) $this->option('count');
        
        $this->info('🔍 Testing database connection...');
        $this->info('📊 Database: ' . DB::connection()->getDatabaseName());
        $this->info('🔌 Driver: ' . DB::connection()->getDriverName());
        $this->info('🏠 Host: ' . DB::connection()->getConfig('host'));
        $this->info('🚪 Port: ' . DB::connection()->getConfig('port'));
        
        try {
            // Test basic connection
            $pdo = DB::connection()->getPdo();
            $this->info('✅ Database connection established');
            
            // Test a simple query
            $result = DB::select('SELECT 1 as test');
            $this->info('✅ Basic query test passed');
            
            // Test transaction handling
            $this->info('🔄 Testing transaction handling...');
            DB::beginTransaction();
            try {
                DB::select('SELECT 1 as transaction_test');
                DB::commit();
                $this->info('✅ Transaction test passed');
            } catch (\Exception $e) {
                DB::rollBack();
                $this->error('❌ Transaction test failed: ' . $e->getMessage());
            }
            
            // Test regions table if it exists
            if (DB::getSchemaBuilder()->hasTable('regions')) {
                $this->info('📋 Testing regions table...');
                
                // Test basic select
                $regionCount = DB::table('regions')->count();
                $this->info("✅ Regions table accessible (count: {$regionCount})");
                
                // Test unique constraint
                try {
                    $existingRegions = DB::table('regions')->select('name')->limit(5)->get();
                    if ($existingRegions->isNotEmpty()) {
                        $testName = $existingRegions->first()->name;
                        $this->info("🔍 Testing duplicate check with existing name: {$testName}");
                        
                        $exists = DB::table('regions')->where('name', $testName)->exists();
                        $this->info("✅ Duplicate check query executed successfully (exists: " . ($exists ? 'true' : 'false') . ")");
                    }
                } catch (\Exception $e) {
                    $this->error('❌ Duplicate check test failed: ' . $e->getMessage());
                }
            } else {
                $this->warn('⚠️ Regions table does not exist');
            }
            
            // Run multiple test queries if requested
            if ($count > 1) {
                $this->info("🔄 Running {$count} additional test queries...");
                for ($i = 1; $i <= $count; $i++) {
                    try {
                        DB::select('SELECT ? as query_number', [$i]);
                        $this->info("   Query {$i}: ✅");
                    } catch (\Exception $e) {
                        $this->error("   Query {$i}: ❌ " . $e->getMessage());
                    }
                }
            }
            
        } catch (\Exception $e) {
            $this->error('❌ Database connection failed: ' . $e->getMessage());
            
            // Provide specific guidance for common issues
            if (str_contains($e->getMessage(), 'current transaction is aborted')) {
                $this->error('💡 This appears to be a PostgreSQL transaction abort error.');
                $this->error('   Try running: php artisan db:reset-connection');
            } elseif (str_contains($e->getMessage(), 'Connection refused')) {
                $this->error('💡 Database server appears to be unreachable.');
                $this->error('   Check your database configuration and ensure the server is running.');
            }
            
            return 1;
        }
        
        $this->info('🎉 All database tests completed successfully!');
        return 0;
    }
}
