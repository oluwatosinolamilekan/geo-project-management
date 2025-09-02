<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

abstract class BaseOperationController extends Controller
{
    use ApiResponseTrait;

    /**
     * Default cache TTL in seconds (5 minutes)
     */
    protected const CACHE_TTL = 300;

    /**
     * Handle create operations
     */
    protected function handleCreate(callable $operation): JsonResponse
    {
        try {
            $result = $operation();
            $this->invalidateRelatedCache();
            return $this->createdResponse($result);
        } catch (\Exception $e) {
            Log::error('Create operation failed: ' . $e->getMessage(), [
                'exception' => $e,
                'controller' => get_class($this)
            ]);
            return $this->handleException($e, 'Resource', 'Create operation failed');
        }
    }

    /**
     * Handle update operations
     */
    protected function handleUpdate(callable $operation): JsonResponse
    {
        try {
            $result = $operation();
            $this->invalidateRelatedCache();
            return $this->successResponse($result);
        } catch (\Exception $e) {
            Log::error('Update operation failed: ' . $e->getMessage(), [
                'exception' => $e,
                'controller' => get_class($this)
            ]);
            return $this->handleException($e, 'Resource', 'Update operation failed');
        }
    }

    /**
     * Handle delete operations
     */
    protected function handleDelete(callable $operation, string $successMessage = 'Resource deleted successfully'): JsonResponse
    {
        try {
            $result = $operation();
            $this->invalidateRelatedCache();
            return $this->successMessageResponse($successMessage);
        } catch (\Exception $e) {
            Log::error('Delete operation failed: ' . $e->getMessage(), [
                'exception' => $e,
                'controller' => get_class($this)
            ]);
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
            Log::error('Read operation failed: ' . $e->getMessage(), [
                'exception' => $e,
                'controller' => get_class($this)
            ]);
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
        Cache::flush();
    }
}
