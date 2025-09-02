<?php

namespace App\Traits;

use Illuminate\Http\JsonResponse;
use Illuminate\Database\Eloquent\ModelNotFoundException;

trait ApiResponseTrait
{
    /**
     * Return a 404 error response for resource not found
     * 
     * @param string $model The name of the model/resource
     * @param string|int|null $id The ID of the resource that was not found
     * @return JsonResponse
     */
    protected function notFoundResponse(string $model = 'Resource', string|int|null $id = null): JsonResponse
    {
        $message = $id !== null 
            ? sprintf('%s with ID %s not found', $model, $id)
            : sprintf('%s not found', $model);
            
        return response()->json(['error' => $message], 404);
    }

    /**
     * Return a 500 error response for server errors
     */
    protected function serverErrorResponse(string $action = 'Failed to process request'): JsonResponse
    {
        return response()->json(['error' => $action], 500);
    }

    /**
     * Return a 400 error response for bad requests
     */
    protected function badRequestResponse(string $message = 'Bad request'): JsonResponse
    {
        return response()->json(['error' => $message], 400);
    }

    /**
     * Return a 422 error response for validation errors
     */
    protected function validationErrorResponse(string $message = 'Validation failed'): JsonResponse
    {
        return response()->json(['error' => $message], 422);
    }

    /**
     * Return a 201 success response for resource creation
     */
    protected function createdResponse($data): JsonResponse
    {
        return response()->json($data, 201);
    }

    /**
     * Return a 200 success response
     */
    protected function successResponse($data): JsonResponse
    {
        return response()->json($data);
    }

    /**
     * Return a 200 success response with message
     */
    protected function successMessageResponse(string $message): JsonResponse
    {
        return response()->json(['message' => $message]);
    }

    /**
     * Handle common exceptions and return appropriate responses
     */
    protected function handleException(\Exception $e, string $resource = 'Resource', string $action = 'Failed to process request'): JsonResponse
    {
        if ($e instanceof ModelNotFoundException) {
            $id = collect($e->getIds())->first();
            return $this->notFoundResponse($resource, $id);
        }

        // Handle PostgreSQL transaction abort errors
        if ($e instanceof \Illuminate\Database\QueryException) {
            $errorCode = $e->getCode();
            $errorMessage = $e->getMessage();
            
            // PostgreSQL transaction abort error
            if (str_contains($errorMessage, 'current transaction is aborted') || $errorCode == '25P02') {
                return $this->serverErrorResponse('Transaction failed: ' . $errorMessage . '. Please try again.');
            }
            
            // PostgreSQL unique constraint violation
            if ($errorCode == 23505) {
                if (str_contains($errorMessage, 'regions_name_unique')) {
                    return $this->badRequestResponse('A region with this name already exists.');
                }
                return $this->badRequestResponse('Duplicate entry: ' . $errorMessage);
            }
            
            if ($errorCode == 23000) { // MySQL foreign key constraint violation
                return $this->badRequestResponse('Cannot delete ' . strtolower($resource) . ' because it has associated data: ' . $e->getMessage());
            }
            if ($errorCode == 23503) { // PostgreSQL foreign key constraint violation
                return $this->badRequestResponse('Cannot delete ' . strtolower($resource) . ' because it has associated data: ' . $e->getMessage());
            }
            // For other database query exceptions, return the actual error message
            return $this->serverErrorResponse('Database error: ' . $e->getMessage());
        }

        // Handle database connection errors
        if ($e instanceof \Illuminate\Database\ConnectionException) {
            return $this->serverErrorResponse('Database connection error: ' . $e->getMessage());
        }

        // Log the exception for debugging (optional)
        \Log::error('API Exception: ' . $e->getMessage(), [
            'exception' => $e,
            'resource' => $resource,
            'action' => $action
        ]);

        // Return the actual exception message instead of generic message
        return $this->serverErrorResponse($e->getMessage());
    }
}
