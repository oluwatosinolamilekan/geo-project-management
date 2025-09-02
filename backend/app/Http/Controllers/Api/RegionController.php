<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\StoreRegionRequest;
use App\Http\Requests\UpdateRegionRequest;
use App\Http\Resources\RegionResource;
use App\Models\Region;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class RegionController extends BaseOperationController
{
    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        return $this->handleRead(
            fn() => RegionResource::collection(
                Region::with('projects.pins')->get()
            )
        );
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreRegionRequest $request): JsonResponse
    {
        return $this->handleCreate(
            fn() => new RegionResource(
                Region::create($request->validated())
            )
        );
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id): JsonResponse
    {
        return $this->handleRead(
            fn() => new RegionResource(
                Region::with('projects.pins')->findOrFail($id)
            )
        );
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateRegionRequest $request, string $id): JsonResponse
    {
        // Temporarily bypassing transaction handling for debugging
        try {
            $region = Region::findOrFail($id);
            $region->update($request->validated());
            
            // Load relationships outside the update operation
            return $this->successResponse(
                new RegionResource($region->fresh(['projects.pins']))
            );
        } catch (\Exception $e) {
            return $this->handleException($e, 'Region', 'Update operation failed');
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id): JsonResponse
    {
        // Check for related records outside the transaction
        $region = Region::with('projects')->findOrFail($id);
        $forceDelete = request()->boolean('force_delete', false);
        
        
        return $this->handleDelete(
            function() use ($region, $forceDelete) {
                if ($forceDelete) {
                    // First delete all pins related to projects in this region
                    foreach ($region->projects as $project) {
                        $project->pins()->delete();
                    }
                    // Then delete all projects
                    $region->projects()->delete();
                }
                // Finally delete the region
                return $region->delete();
            },
            'Region and all associated data deleted successfully'
        );
    }
}
