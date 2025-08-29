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

// Regions
Route::apiResource('regions', RegionController::class);

// Projects (nested under regions)
Route::prefix('regions/{regionId}')->group(function () {
    Route::get('projects', [ProjectController::class, 'index']);
    Route::post('projects', [ProjectController::class, 'store']);
});

// Individual project operations
Route::apiResource('projects', ProjectController::class)->except(['index', 'store']);

// Pins (nested under projects)
Route::prefix('projects/{projectId}')->group(function () {
    Route::get('pins', [PinController::class, 'index']);
    Route::post('pins', [PinController::class, 'store']);
});

// Individual pin operations
Route::apiResource('pins', PinController::class)->except(['index', 'store']);
