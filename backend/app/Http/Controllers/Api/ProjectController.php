<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProjectRequest;
use App\Http\Requests\UpdateProjectRequest;
use App\Http\Resources\ProjectResource;
use App\Models\Project;
use App\Models\Region;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class ProjectController extends Controller
{
    use ApiResponseTrait;
    /**
     * Display a listing of projects for a specific region.
     */
    public function index(string $regionId): JsonResponse
    {
        try {
            $projects = Region::findOrFail($regionId)
                ->projects()
                ->with('pins')
                ->get();
            
            return $this->successResponse(ProjectResource::collection($projects));
        } catch (\Exception $e) {
            Log::error('Read operation failed: ' . $e->getMessage(), [
                'exception' => $e,
                'controller' => get_class($this)
            ]);
            return $this->handleException($e, 'Project', 'Failed to retrieve projects');
        }
    }

    /**
     * Store a newly created project in storage.
     */
    public function store(StoreProjectRequest $request, string $regionId): JsonResponse
    {
        try {
            $region = Region::findOrFail($regionId);
            
            $project = $region->projects()
                ->create($request->validated())
                ->load('pins');
                
            return $this->createdResponse(new ProjectResource($project));
        } catch (\Exception $e) {
            Log::error('Create operation failed: ' . $e->getMessage(), [
                'exception' => $e,
                'controller' => get_class($this)
            ]);
            return $this->handleException($e, 'Project', 'Failed to create project');
        }
    }

    /**
     * Display the specified project.
     */
    public function show(string $id): JsonResponse
    {
        try {
            $project = Project::with(['region', 'pins'])->findOrFail($id);
            return $this->successResponse(new ProjectResource($project));
        } catch (\Exception $e) {
            Log::error('Read operation failed: ' . $e->getMessage(), [
                'exception' => $e,
                'controller' => get_class($this)
            ]);
            return $this->handleException($e, 'Project', 'Failed to retrieve project');
        }
    }

    /**
     * Update the specified project in storage.
     */
    public function update(UpdateProjectRequest $request, string $id): JsonResponse
    {
        try {
            $project = Project::findOrFail($id);
            $project->update($request->validated());
            $project->load(['region', 'pins']);
            
            return $this->successResponse(new ProjectResource($project));
        } catch (\Exception $e) {
            Log::error('Update operation failed: ' . $e->getMessage(), [
                'exception' => $e,
                'controller' => get_class($this)
            ]);
            return $this->handleException($e, 'Project', 'Failed to update project');
        }
    }

    /**
     * Remove the specified project from storage.
     */
    public function destroy(string $id): JsonResponse
    {
        try {
            $project = Project::with('pins')->findOrFail($id);
            
            if ($project->pins()->exists()) {
                Log::warning("Cannot delete project {$id} with existing pins");
                return $this->badRequestResponse("Cannot delete project because it has associated pins");
            }
            
            $project->delete();
            return $this->successMessageResponse('Project deleted successfully');
        } catch (\Exception $e) {
            Log::error('Delete operation failed: ' . $e->getMessage(), [
                'exception' => $e,
                'controller' => get_class($this)
            ]);
            return $this->handleException($e, 'Project', 'Failed to delete project');
        }
    }
}
