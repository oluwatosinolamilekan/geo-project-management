<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreRegionRequest;
use App\Http\Requests\UpdateRegionRequest;
use App\Http\Resources\RegionResource;
use App\Models\Region;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class RegionController extends Controller
{
    use ApiResponseTrait;
    /**
     * Get region details with all projects and pins in a single request.
     */
    public function getRegionDetails(string $regionId): JsonResponse
    {
        try {
            // Get the region with all its projects and pins
            $region = Region::with(['projects.pins'])->findOrFail($regionId);
            
            // Structure the response to match the frontend's expected format
            $data = [
                'region' => new RegionResource($region),
                'projects' => $region->projects->map(function ($project) {
                    return [
                        'id' => $project->id,
                        'name' => $project->name,
                        'geo_json' => $project->geo_json,
                        'region_id' => $project->region_id,
                        'created_at' => $project->created_at,
                        'updated_at' => $project->updated_at,
                        'pins' => $project->pins->map(function ($pin) {
                            return [
                                'id' => $pin->id,
                                'latitude' => $pin->latitude,
                                'longitude' => $pin->longitude,
                                'project_id' => $pin->project_id,
                                'created_at' => $pin->created_at,
                                'updated_at' => $pin->updated_at,
                            ];
                        })
                    ];
                })
            ];
            
            return $this->successResponse($data);
        } catch (\Exception $e) {
            Log::error('Read operation failed: ' . $e->getMessage(), [
                'exception' => $e,
                'controller' => get_class($this)
            ]);
            return $this->handleException($e, 'Region', 'Failed to retrieve region details');
        }
    }
    
    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        try {
            $regions = Region::with('projects.pins')->get();
            return $this->successResponse(RegionResource::collection($regions));
        } catch (\Exception $e) {
            Log::error('Read operation failed: ' . $e->getMessage(), [
                'exception' => $e,
                'controller' => get_class($this)
            ]);
            return $this->handleException($e, 'Region', 'Failed to retrieve regions');
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreRegionRequest $request): JsonResponse
    {
        try {
            $region = Region::create($request->validated());
            return $this->createdResponse(new RegionResource($region));
        } catch (\Exception $e) {
            Log::error('Create operation failed: ' . $e->getMessage(), [
                'exception' => $e,
                'controller' => get_class($this)
            ]);
            return $this->handleException($e, 'Region', 'Failed to create region');
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id): JsonResponse
    {
        try {
            $region = Region::with('projects.pins')->findOrFail($id);
            return $this->successResponse(new RegionResource($region));
        } catch (\Exception $e) {
            Log::error('Read operation failed: ' . $e->getMessage(), [
                'exception' => $e,
                'controller' => get_class($this)
            ]);
            return $this->handleException($e, 'Region', 'Failed to retrieve region');
        }
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
        try {
            // Check for related records outside the transaction
            $region = Region::with('projects')->findOrFail($id);
            $forceDelete = request()->boolean('force_delete', false);
            
            if ($forceDelete) {
                // First delete all pins related to projects in this region
                foreach ($region->projects as $project) {
                    $project->pins()->delete();
                }
                // Then delete all projects
                $region->projects()->delete();
            }
            // Finally delete the region
            $region->delete();
            
            return $this->successMessageResponse('Region and all associated data deleted successfully');
        } catch (\Exception $e) {
            Log::error('Delete operation failed: ' . $e->getMessage(), [
                'exception' => $e,
                'controller' => get_class($this)
            ]);
            return $this->handleException($e, 'Region', 'Failed to delete region');
        }
    }
}
