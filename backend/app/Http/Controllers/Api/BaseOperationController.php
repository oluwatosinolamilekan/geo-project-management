<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

abstract class BaseOperationController extends Controller
{
    use ApiResponseTrait;


    /**
     * Handle create operations
     */
    protected function handleCreate(callable $operation): JsonResponse
    {
        try {
            $result = $operation();
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
     * Handle read operations
     */
    protected function handleRead(callable $operation): JsonResponse
    {
        try {
            $result = $operation();
            return $this->successResponse($result);
        } catch (\Exception $e) {
            Log::error('Read operation failed: ' . $e->getMessage(), [
                'exception' => $e,
                'controller' => get_class($this)
            ]);
            return $this->handleException($e, 'Resource', 'Read operation failed');
        }
    }

}
