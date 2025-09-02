<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\StoreProjectRequest;
use App\Http\Requests\UpdateProjectRequest;
use App\Http\Resources\ProjectResource;
use App\Models\Project;
use App\Models\Region;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class ProjectController extends BaseApiController
{
    /**
     * Display a listing of projects for a specific region.
     */
    public function index(string $regionId): JsonResponse
    {
        return $this->handleRead(
            fn() => ProjectResource::collection(
                Region::findOrFail($regionId)
                    ->projects()
                    ->with('pins')
                    ->get()
            )
        );
    }

    /**
     * Store a newly created project in storage.
     */
    public function store(StoreProjectRequest $request, string $regionId): JsonResponse
    {
        return $this->handleCreate(
            function() use ($request, $regionId) {
                $region = Region::findOrFail($regionId);
                
                return new ProjectResource(
                    $region->projects()
                        ->create($request->validated())
                        ->load('pins')
                );
            }
        );
    }

    /**
     * Display the specified project.
     */
    public function show(string $id): JsonResponse
    {
        return $this->handleRead(
            fn() => new ProjectResource(
                Project::with(['region', 'pins'])
                    ->findOrFail($id)
            )
        );
    }

    /**
     * Update the specified project in storage.
     */
    public function update(UpdateProjectRequest $request, string $id): JsonResponse
    {
        return $this->handleUpdate(
            fn() => new ProjectResource(
                tap(
                    Project::findOrFail($id),
                    fn($project) => $project->update($request->validated())
                )->load(['region', 'pins'])
            )
        );
    }

    /**
     * Remove the specified project from storage.
     */
    public function destroy(string $id): JsonResponse
    {
        return $this->handleDelete(
            function() use ($id) {
                $project = Project::with('pins')->findOrFail($id);
                
                if ($project->pins()->exists()) {
                    Log::warning("Cannot delete project {$id} with existing pins");
                    return $this->badRequestResponse("Cannot delete project because it has associated pins");
                }
                
                return $project->delete();
            },
            'Project deleted successfully'
        );
    }
}
