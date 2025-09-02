<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\StoreRegionRequest;
use App\Http\Requests\UpdateRegionRequest;
use App\Http\Resources\RegionResource;
use App\Models\Region;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class RegionController extends BaseApiController
{
    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        return $this->handleRead(
            fn() => RegionResource::collection(Region::with('projects.pins')->get())
        );
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreRegionRequest $request): JsonResponse
    {
        return $this->handleCreate(
            function() use ($request) {
                // Check if region with same name already exists
                if (Region::where('name', $request->name)->exists()) {
                    throw ValidationException::withMessages([
                        'name' => ['A region with this name already exists.']
                    ]);
                }
                
                return new RegionResource(Region::create($request->validated()));
            }
        );
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id): JsonResponse
    {
        return $this->handleRead(
            fn() => new RegionResource(Region::with('projects.pins')->findOrFail($id))
        );
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateRegionRequest $request, string $id): JsonResponse
    {
        return $this->handleUpdate(
            function() use ($request, $id) {
                $region = Region::findOrFail($id);
                
                // Check if another region with the same name exists
                if (Region::where('name', $request->name)
                    ->where('id', '!=', $id)
                    ->exists()) {
                    throw ValidationException::withMessages([
                        'name' => ['A region with this name already exists.']
                    ]);
                }
                
                $region->update($request->validated());
                return new RegionResource($region->load('projects.pins'));
            }
        );
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id): JsonResponse
    {
        return $this->handleDelete(
            function() use ($id) {
                \Log::info('Attempting to delete region with ID: ' . $id);
                \Log::info('Database connection: ' . DB::connection()->getName());
                \Log::info('Transaction level: ' . DB::transactionLevel());
                
                $region = Region::findOrFail($id);
                \Log::info('Found region: ' . $region->name . ', attempting to delete...');
                
                // Check if region has projects
                $projectCount = $region->projects()->count();
                \Log::info('Region has ' . $projectCount . ' projects');
                
                $result = $region->delete();
                \Log::info('Delete result: ' . ($result ? 'success' : 'failed'));
                return $result;
            },
            'Region deleted successfully'
        );
    }
}
