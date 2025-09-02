<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class ResetDatabaseConnection extends Command
{
    protected $signature = 'db:reset-connection';
    protected $description = 'Reset the database connection to clear any aborted transactions';

    public function handle()
    {
        $this->info('🔄 Resetting database connection...');
        
        try {
            // Get current connection info
            $connectionName = DB::connection()->getName();
            $this->info("📊 Current connection: {$connectionName}");
            
            // Disconnect
            $this->info('🔌 Disconnecting...');
            DB::disconnect();
            
            // Reconnect
            $this->info('🔌 Reconnecting...');
            DB::reconnect();
            
            // Test the new connection
            $this->info('🧪 Testing new connection...');
            $pdo = DB::connection()->getPdo();
            
            // Test a simple query
            $result = DB::select('SELECT 1 as test');
            $this->info('✅ Connection reset successful');
            
            // Test transaction handling
            $this->info('🔄 Testing transaction handling...');
            DB::beginTransaction();
            try {
                DB::select('SELECT 1 as transaction_test');
                DB::commit();
                $this->info('✅ Transaction handling working correctly');
            } catch (\Exception $e) {
                DB::rollBack();
                $this->error('❌ Transaction test failed: ' . $e->getMessage());
                return 1;
            }
            
            $this->info('🎉 Database connection reset completed successfully!');
            return 0;
            
        } catch (\Exception $e) {
            $this->error('❌ Failed to reset database connection: ' . $e->getMessage());
            return 1;
        }
    }
}
