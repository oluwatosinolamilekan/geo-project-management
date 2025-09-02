<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Database\QueryException;

abstract class BaseApiController extends Controller
{
    use ApiResponseTrait;

    /**
     * Default cache TTL in seconds (5 minutes)
     */
    protected const CACHE_TTL = 300;

    /**
     * Maximum retries for transaction operations
     */
    protected const MAX_RETRIES = 3;

    /**
     * Execute an operation within a database transaction with retry logic
     */
    protected function withTransaction(callable $operation, int $retries = 0)
    {
        try {
            // Ensure we're not in a transaction before starting a new one
            if (DB::transactionLevel() > 0) {
                DB::rollBack();
                Log::warning('Rolling back existing transaction before starting new one');
            }
            
            return DB::transaction(function() use ($operation) {
                try {
                    $result = $operation();
                    
                    // If operation returns a response, check if it's an error response
                    if ($result instanceof JsonResponse && $result->getStatusCode() >= 400) {
                        DB::rollBack();
                        return $result;
                    }
                    
                    return $result;
                } catch (\Exception $e) {
                    DB::rollBack();
                    throw $e;
                }
            }, 5); // 5 attempts for deadlock scenarios
        } catch (QueryException $e) {
            // Handle Neon-specific connection issues
            if ($this->isConnectionIssue($e) && $retries < self::MAX_RETRIES) {
                Log::warning('Connection issue detected, attempting retry ' . ($retries + 1));
                return $this->withRetry($operation, $retries);
            }
            
            // Handle transaction conflicts
            if ($this->isTransactionConflict($e) && $retries < self::MAX_RETRIES) {
                Log::warning('Transaction conflict detected, attempting retry ' . ($retries + 1));
                return $this->withRetry($operation, $retries);
            }
            
            throw $e;
        }
    }

    /**
     * Retry an operation with exponential backoff
     */
    protected function withRetry(callable $operation, int $retries): mixed
    {
        // Exponential backoff: 100ms, 200ms, 400ms, etc.
        $backoff = (int) (100 * pow(2, $retries));
        usleep($backoff * 1000);

        return $this->withTransaction($operation, $retries + 1);
    }

    /**
     * Check if the exception is related to connection issues
     */
    protected function isConnectionIssue(QueryException $e): bool
    {
        $message = strtolower($e->getMessage());
        return str_contains($message, 'connection') || 
               str_contains($message, 'timeout') ||
               str_contains($message, 'too many connections');
    }

    /**
     * Check if the exception is related to transaction conflicts
     */
    protected function isTransactionConflict(QueryException $e): bool
    {
        $message = strtolower($e->getMessage());
        return str_contains($message, 'deadlock') || 
               str_contains($message, 'could not serialize') ||
               str_contains($message, 'current transaction is aborted');
    }

    /**
     * Handle create operations with optimized transaction handling
     */
    protected function handleCreate(callable $operation): JsonResponse
    {
        try {
            $result = $this->withTransaction($operation);
            $this->invalidateRelatedCache();
            return $this->createdResponse($result);
        } catch (\Exception $e) {
            return $this->handleException($e, 'Resource', 'Create operation failed');
        }
    }

    /**
     * Handle update operations with optimized transaction handling
     */
    protected function handleUpdate(callable $operation): JsonResponse
    {
        try {
            $result = $this->withTransaction($operation);
            $this->invalidateRelatedCache();
            return $this->successResponse($result);
        } catch (\Exception $e) {
            return $this->handleException($e, 'Resource', 'Update operation failed');
        }
    }

    /**
     * Handle delete operations with optimized handling
     */
    protected function handleDelete(callable $operation, string $successMessage = 'Resource deleted successfully'): JsonResponse
    {
        try {
            $result = $this->withTransaction($operation);
            $this->invalidateRelatedCache();
            return $this->successMessageResponse($successMessage);
        } catch (\Exception $e) {
            return $this->handleException($e, 'Resource', 'Delete operation failed');
        }
    }

    /**
     * Handle read operations with caching
     */
    protected function handleRead(callable $operation): JsonResponse
    {
        try {
            // Generate a cache key based on the current request
            $cacheKey = $this->generateCacheKey();
            
            // Try to get from cache first
            $result = Cache::remember($cacheKey, self::CACHE_TTL, function() use ($operation) {
                return $operation();
            });
            
            return $this->successResponse($result);
        } catch (\Exception $e) {
            return $this->handleException($e, 'Resource', 'Read operation failed');
        }
    }

    /**
     * Generate a cache key based on the current request
     */
    protected function generateCacheKey(): string
    {
        $request = request();
        return sprintf(
            '%s:%s:%s:%s',
            $request->path(),
            $request->getMethod(),
            md5(json_encode($request->query())),
            md5(json_encode($request->input()))
        );
    }

    /**
     * Invalidate related cache entries
     */
    protected function invalidateRelatedCache(): void
    {
        // Clear the entire cache since we can't use tags with file driver
        Cache::flush();
    }

    /**
     * Get the model name from the controller name
     */
    protected function getModelName(): ?string
    {
        $className = class_basename($this);
        if (str_ends_with($className, 'Controller')) {
            return str_replace('Controller', '', $className);
        }
        return null;
    }
}
