<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class TestDatabaseConnection extends Command
{
    protected $signature = 'db:test {--count=1 : Number of test queries to run}';
    protected $description = 'Test database connection with detailed error reporting';

    public function handle()
    {
        $this->info('🔍 Testing database connection...');

        try {
            // Test basic connection
            $pdo = DB::connection()->getPdo();
            $this->info('✅ Database connection established');
            $this->info('📊 Database: ' . DB::connection()->getDatabaseName());
            $this->info('🔌 Driver: ' . DB::connection()->getDriverName());
            $this->info('🌐 Host: ' . config('database.connections.' . config('database.default') . '.host'));

            // Test query execution
            $count = (int) $this->option('count');
            for ($i = 1; $i <= $count; $i++) {
                $result = DB::select('SELECT 1 as test');
                $this->info("✅ Query $i/$count successful: " . json_encode($result));
            }

            $this->info('🎉 Database connection test completed successfully!');
            return 0;

        } catch (\Exception $e) {
            $this->error('❌ Database connection failed: ' . $e->getMessage());
            $this->error('🔍 Connection details:');
            
            $connection = config('database.default');
            $config = config("database.connections.$connection");
            
            $this->error('   Connection: ' . $connection);
            $this->error('   Host: ' . ($config['host'] ?? 'not set'));
            $this->error('   Port: ' . ($config['port'] ?? 'not set'));
            $this->error('   Database: ' . ($config['database'] ?? 'not set'));
            $this->error('   Username: ' . ($config['username'] ?? 'not set'));
            $this->error('   Driver: ' . ($config['driver'] ?? 'not set'));
            
            return 1;
        }
    }
}
