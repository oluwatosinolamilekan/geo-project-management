<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\RegionController;
use App\Http\Controllers\Api\ProjectController;
use App\Http\Controllers\Api\PinController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Health check endpoint for Railway
Route::get('/health', function () {
    try {
        // Basic health check - just return success
        return response()->json([
            'status' => 'healthy',
            'timestamp' => now()->toISOString(),
            'service' => 'Geo-Project Management API',
            'version' => '1.0.0',
            'environment' => config('app.env')
        ], 200);
    } catch (\Exception $e) {
        // If there's any error, still return a response but with error status
        return response()->json([
            'status' => 'unhealthy',
            'timestamp' => now()->toISOString(),
            'service' => 'Geo-Project Management API',
            'error' => $e->getMessage()
        ], 500);
    }
});

// Regions routes
Route::apiResource('regions', RegionController::class);

// Projects routes (nested under regions)
Route::get('/regions/{region}/projects', [ProjectController::class, 'index']);
Route::post('/regions/{region}/projects', [ProjectController::class, 'store']);

// Individual project routes
Route::apiResource('projects', ProjectController::class)->except(['index', 'store']);

// Pins routes (nested under projects)
Route::get('/projects/{project}/pins', [PinController::class, 'index']);
Route::post('/projects/{project}/pins', [PinController::class, 'store']);

// Individual pin routes
Route::apiResource('pins', PinController::class)->except(['index', 'store']);
