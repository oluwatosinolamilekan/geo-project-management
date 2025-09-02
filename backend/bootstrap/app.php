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
        // Add global middleware to handle database errors
        $middleware->append(\App\Http\Middleware\HandleDatabaseErrors::class);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Handle ModelNotFoundException for API requests
        $exceptions->render(function (\Illuminate\Database\Eloquent\ModelNotFoundException $e, $request) {
            if ($request->wantsJson()) {
                return response()->json([
                    'error' => 'Resource not found'
                ], 404);
            }
        });

        // Handle NotFoundHttpException for API requests
        $exceptions->render(function (\Symfony\Component\HttpKernel\Exception\NotFoundHttpException $e, $request) {
            if ($request->wantsJson()) {
                if ($e->getPrevious() && $e->getPrevious() instanceof \Illuminate\Database\Eloquent\ModelNotFoundException) {
                    return response()->json([
                        'error' => 'Resource not found'
                    ], 404);
                }
                
                return response()->json([
                    'error' => 'Page not found'
                ], 404);
            }
        });

        // Handle ValidationException for API requests
        $exceptions->render(function (\Illuminate\Validation\ValidationException $e, $request) {
            if ($request->wantsJson()) {
                return response()->json([
                    'message' => $e->getMessage(),
                    'errors' => $e->errors()
                ], 422);
            }
        });
    })->create();
