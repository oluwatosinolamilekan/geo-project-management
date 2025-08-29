<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

abstract class BaseApiController extends Controller
{
    use ApiResponseTrait;

    /**
     * Execute an operation within a database transaction
     */
    protected function withTransaction(callable $operation)
    {
        return DB::transaction($operation);
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
        $result = $this->withTransaction($operation);
        return $this->createdResponse($result);
    }

    /**
     * Handle update operations with DB transaction
     */
    protected function handleUpdate(callable $operation): JsonResponse
    {
        $result = $this->withTransaction($operation);
        return $this->successResponse($result);
    }

    /**
     * Handle delete operations with DB transaction
     */
    protected function handleDelete(callable $operation, string $successMessage = 'Resource deleted successfully'): JsonResponse
    {
        $this->withTransaction($operation);
        return $this->successMessageResponse($successMessage);
    }

    /**
     * Handle read operations without DB transaction
     */
    protected function handleRead(callable $operation): JsonResponse
    {
        $result = $this->withoutTransaction($operation);
        return $this->successResponse($result);
    }
}
