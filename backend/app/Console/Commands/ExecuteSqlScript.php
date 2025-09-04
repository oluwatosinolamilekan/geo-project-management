<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

class ExecuteSqlScript extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'db:execute-sql {script : Path to the SQL script file}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Execute a SQL script file directly';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $scriptPath = $this->argument('script');
        
        if (!File::exists($scriptPath)) {
            $this->error("SQL script file not found: {$scriptPath}");
            return 1;
        }
        
        $sql = File::get($scriptPath);
        
        $this->info('Executing SQL script...');
        
        try {
            // Split SQL by semicolons to execute each statement separately
            $statements = array_filter(array_map('trim', explode(';', $sql)), function($statement) {
                return !empty($statement);
            });
            
            foreach ($statements as $statement) {
                $this->line('Executing: ' . substr($statement, 0, 50) . '...');
                DB::unprepared($statement);
            }
            
            $this->info('SQL script executed successfully!');
            return 0;
        } catch (\Exception $e) {
            $this->error('Error executing SQL script: ' . $e->getMessage());
            return 1;
        }
    }
}
