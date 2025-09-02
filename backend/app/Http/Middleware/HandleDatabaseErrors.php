<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\QueryException;
use Symfony\Component\HttpFoundation\Response;

class HandleDatabaseErrors
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        try {
            return $next($request);
        } catch (QueryException $e) {
            // Handle PostgreSQL transaction abort errors
            if (str_contains($e->getMessage(), 'current transaction is aborted') || 
                $e->getCode() == '25P02') {
                
                \Log::warning('PostgreSQL transaction abort detected in middleware, resetting connection...');
                
                // Reset the database connection
                try {
                    DB::disconnect();
                    DB::reconnect();
                    \Log::info('Database connection reset successfully in middleware');
                } catch (\Exception $resetError) {
                    \Log::error('Failed to reset database connection in middleware: ' . $resetError->getMessage());
                }
                
                // Return a proper error response
                return response()->json([
                    'error' => 'Database transaction failed. Please try again.',
                    'details' => 'The previous operation caused a database transaction to abort. Please retry your request.'
                ], 500);
            }
            
            // Re-throw other database exceptions
            throw $e;
        }
    }
}
