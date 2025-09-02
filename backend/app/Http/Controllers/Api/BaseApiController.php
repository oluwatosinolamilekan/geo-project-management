<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Eloquent\ModelNotFoundException;

abstract class BaseApiController extends Controller
{
    use ApiResponseTrait;

    /**
     * Execute an operation within a database transaction
     */
    protected function withTransaction(callable $operation)
    {
        try {
            return DB::transaction($operation);
        } catch (\Exception $e) {
            // If it's a PostgreSQL transaction abort error, reset the connection and retry once
            if ($e instanceof \Illuminate\Database\QueryException && 
                str_contains($e->getMessage(), 'current transaction is aborted')) {
                
                \Log::warning('PostgreSQL transaction abort detected, resetting connection and retrying...');
                
                // Reset the database connection
                $this->resetDatabaseConnection();
                
                // Retry the operation without a transaction
                return $this->withoutTransaction($operation);
            }
            
            throw $e;
        }
    }

    /**
     * Execute an operation without a database transaction
     */
    protected function withoutTransaction(callable $operation)
    {
        return $operation();
    }

    /**
     * Handle create operations with DB transaction
     */
    protected function handleCreate(callable $operation): JsonResponse
    {
        try {
            $result = $this->withTransaction($operation);
            return $this->createdResponse($result);
        } catch (\Exception $e) {
            // Reset connection on any database error
            if ($e instanceof \Illuminate\Database\QueryException) {
                $this->resetDatabaseConnection();
            }
            return $this->handleException($e, 'Resource', 'Create operation failed: ' . $e->getMessage());
        }
    }

    /**
     * Handle update operations with DB transaction
     */
    protected function handleUpdate(callable $operation): JsonResponse
    {
        try {
            $result = $this->withTransaction($operation);
            return $this->successResponse($result);
        } catch (\Exception $e) {
            // Reset connection on any database error
            if ($e instanceof \Illuminate\Database\QueryException) {
                $this->resetDatabaseConnection();
            }
            return $this->handleException($e, 'Resource', 'Update operation failed: ' . $e->getMessage());
        }
    }

    /**
     * Reset database connection to clear any aborted transactions
     */
    protected function resetDatabaseConnection()
    {
        try {
            DB::disconnect();
            DB::reconnect();
            \Log::info('Database connection reset successfully');
        } catch (\Exception $e) {
            \Log::error('Failed to reset database connection: ' . $e->getMessage());
        }
    }

    /**
     * Execute an operation with a fresh database connection
     */
    protected function withFreshConnection(callable $operation)
    {
        $originalConnection = DB::connection()->getName();
        DB::purge($originalConnection);
        DB::reconnect($originalConnection);
        
        try {
            return $operation();
        } finally {
            // Ensure we're back to the original connection
            DB::purge($originalConnection);
            DB::reconnect($originalConnection);
        }
    }

    /**
     * Handle delete operations without DB transaction (delete operations are atomic)
     */
    protected function handleDelete(callable $operation, string $successMessage = 'Resource deleted successfully'): JsonResponse
    {
        try {
            // Use a fresh connection to avoid transaction abort issues
            $this->withFreshConnection($operation);
            return $this->successMessageResponse($successMessage);
        } catch (\Exception $e) {
            return $this->handleException($e, 'Resource', 'Delete operation failed: ' . $e->getMessage());
        }
    }

    /**
     * Handle read operations without DB transaction
     */
    protected function handleRead(callable $operation): JsonResponse
    {
        try {
            $result = $this->withoutTransaction($operation);
            return $this->successResponse($result);
        } catch (\Exception $e) {
            return $this->handleException($e, 'Resource', 'Read operation failed: ' . $e->getMessage());
        }
    }
}
