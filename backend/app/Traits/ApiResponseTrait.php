<?php

namespace App\Traits;

use Illuminate\Http\JsonResponse;
use Illuminate\Database\Eloquent\ModelNotFoundException;

trait ApiResponseTrait
{
    /**
     * Return a 404 error response for resource not found
     */
    protected function notFoundResponse(string $resource = 'Resource'): JsonResponse
    {
        return response()->json(['error' => $resource . ' not found'], 404);
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
            return $this->notFoundResponse($resource);
        }

        return $this->serverErrorResponse($action);
    }
}
