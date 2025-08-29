<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        //
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Helper function to generate error details
        $generateErrorDetails = function ($e, $request, $additionalData = []) {
            $baseDetails = [
                "env" => config("app.env"),
                "where" => __METHOD__,
                "type" => get_class($e),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'code' => $e->getCode(),
                'message' => $e->getMessage(),
                'request_url' => $request->fullUrl(),
                'request_method' => $request->method(),
                'user_agent' => $request->userAgent(),
                'ip_address' => $request->ip(),
                'user_id' => $request->user()?->id,
                'timestamp' => now()->toISOString(),
            ];
            
            return array_merge($baseDetails, $additionalData);
        };

        // Handle ModelNotFoundException for API requests
        $exceptions->render(function (\Illuminate\Database\Eloquent\ModelNotFoundException $e, $request) {
            if ($request->wantsJson()) {
                $model = class_basename($e->getModel());
                
                $errorDetails = $generateErrorDetails($e, $request, ['model' => $e->getModel()]);
                
                // Enhanced error logging
                $errorLog = collect([$errorDetails])->concat(collect($e->getTrace()))->toArray();
                logger()->error('ModelNotFoundException occurred', $errorLog);
                
                return response()->json([
                    'error' => ucfirst($model) . ' not found',
                    'details' => $errorDetails
                ], 404);
            }
        });

        // Handle NotFoundHttpException for API requests
        $exceptions->render(function (\Symfony\Component\HttpKernel\Exception\NotFoundHttpException $e, $request) {
            if ($request->wantsJson()) {
                if ($e->getPrevious() && $e->getPrevious() instanceof \Illuminate\Database\Eloquent\ModelNotFoundException) {
                    $model = class_basename($e->getPrevious()->getModel());
                    
                    $errorDetails = $generateErrorDetails($e, $request, [
                        'previous_exception' => $e->getPrevious() ? get_class($e->getPrevious()) : null,
                        'model' => $e->getPrevious() && method_exists($e->getPrevious(), 'getModel') ? $e->getPrevious()->getModel() : null,
                    ]);
                    
                    // Enhanced error logging
                    $errorLog = collect([$errorDetails])->concat(collect($e->getTrace()))->toArray();
                    logger()->error('NotFoundHttpException with ModelNotFoundException occurred', $errorLog);
                    
                    return response()->json([
                        'error' => ucfirst($model) . ' not found',
                        'details' => $errorDetails
                    ], 404);
                }
                
                $errorDetails = $generateErrorDetails($e, $request, [
                    'previous_exception' => $e->getPrevious() ? get_class($e->getPrevious()) : null,
                ]);
                
                // Enhanced error logging
                $errorLog = collect([$errorDetails])->concat(collect($e->getTrace()))->toArray();
                logger()->error('NotFoundHttpException occurred', $errorLog);
                
                return response()->json([
                    'error' => 'Page not found',
                    'details' => $errorDetails
                ], 404);
            }
        });

        // Handle ValidationException for API requests
        $exceptions->render(function (\Illuminate\Validation\ValidationException $e, $request) {
            if ($request->wantsJson()) {
                $errorDetails = $generateErrorDetails($e, $request, [
                    'errors' => $e->errors(),
                    'request_data' => $request->all(),
                ]);
                
                // Enhanced error logging
                $errorLog = collect([$errorDetails])->concat(collect($e->getTrace()))->toArray();
                logger()->error('ValidationException occurred', $errorLog);
                
                return response()->json([
                    'error' => $e->getMessage(),
                    'details' => $errorDetails
                ], 422);
            }
        });

        // Handle AuthenticationException for API requests
        $exceptions->render(function (\Illuminate\Auth\AuthenticationException $e, $request) {
            if ($request->wantsJson()) {
                $errorDetails = $generateErrorDetails($e, $request, [
                    'guards' => $e->guards(),
                ]);
                
                // Enhanced error logging
                $errorLog = collect([$errorDetails])->concat(collect($e->getTrace()))->toArray();
                logger()->error('AuthenticationException occurred', $errorLog);
                
                return response()->json([
                    'error' => $e->getMessage(),
                    'details' => $errorDetails
                ], 401);
            }
        });

        // Handle MethodNotAllowedHttpException for API requests
        $exceptions->render(function (\Symfony\Component\HttpKernel\Exception\MethodNotAllowedHttpException $e, $request) {
            if ($request->wantsJson()) {
                $errorDetails = $generateErrorDetails($e, $request, [
                    'allowed_methods' => $e->getHeaders(),
                ]);
                
                // Enhanced error logging
                $errorLog = collect([$errorDetails])->concat(collect($e->getTrace()))->toArray();
                logger()->error('MethodNotAllowedHttpException occurred', $errorLog);
                
                return response()->json([
                    'error' => $e->getMessage(),
                    'details' => $errorDetails
                ], 405);
            }
        });

        // Handle general exceptions for API requests
        $exceptions->render(function (\Throwable $e, $request) {
            if ($request->wantsJson()) {
                $errorDetails = $generateErrorDetails($e, $request, [
                    'request_data' => $request->all(),
                    'session_id' => $request->session()?->getId(),
                    'headers' => $request->headers->all(),
                ]);
                
                // Enhanced error logging
                $errorLog = collect([$errorDetails])->concat(collect($e->getTrace()))->toArray();
                logger()->error('General exception occurred', $errorLog);
                
                return response()->json([
                    'error' => 'An unexpected error occurred',
                    'details' => $errorDetails
                ], 500);
            }
        });
    })->create();
