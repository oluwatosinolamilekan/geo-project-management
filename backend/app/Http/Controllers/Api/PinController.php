<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePinRequest;
use App\Http\Requests\UpdatePinRequest;
use App\Http\Resources\PinResource;
use App\Models\Pin;
use App\Models\Project;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class PinController extends Controller
{
    use ApiResponseTrait;
    /**
     * Display a listing of pins for a specific project.
     */
    public function index(string $projectId): JsonResponse
    {
        try {
            $pins = Project::findOrFail($projectId)
                ->pins()
                ->get();
                
            return $this->successResponse(PinResource::collection($pins));
        } catch (\Exception $e) {
            Log::error('Read operation failed: ' . $e->getMessage(), [
                'exception' => $e,
                'controller' => get_class($this)
            ]);
            return $this->handleException($e, 'Pin', 'Failed to retrieve pins');
        }
    }

    /**
     * Store a newly created pin in storage.
     */
    public function store(StorePinRequest $request, string $projectId): JsonResponse
    {
        try {
            $project = Project::findOrFail($projectId);
            
            $pin = $project->pins()
                ->create($request->validated());
                
            return $this->createdResponse(new PinResource($pin));
        } catch (\Exception $e) {
            Log::error('Create operation failed: ' . $e->getMessage(), [
                'exception' => $e,
                'controller' => get_class($this)
            ]);
            return $this->handleException($e, 'Pin', 'Failed to create pin');
        }
    }

    /**
     * Display the specified pin.
     */
    public function show(string $id): JsonResponse
    {
        try {
            $pin = Pin::with('project.region')->findOrFail($id);
            return $this->successResponse(new PinResource($pin));
        } catch (\Exception $e) {
            Log::error('Read operation failed: ' . $e->getMessage(), [
                'exception' => $e,
                'controller' => get_class($this)
            ]);
            return $this->handleException($e, 'Pin', 'Failed to retrieve pin');
        }
    }

    /**
     * Update the specified pin in storage.
     */
    public function update(UpdatePinRequest $request, string $id): JsonResponse
    {
        try {
            $pin = Pin::findOrFail($id);
            $pin->update($request->validated());
            $pin->load('project.region');
            
            return $this->successResponse(new PinResource($pin));
        } catch (\Exception $e) {
            Log::error('Update operation failed: ' . $e->getMessage(), [
                'exception' => $e,
                'controller' => get_class($this)
            ]);
            return $this->handleException($e, 'Pin', 'Failed to update pin');
        }
    }

    /**
     * Remove the specified pin from storage.
     */
    public function destroy(string $id): JsonResponse
    {
        try {
            $pin = Pin::findOrFail($id);
            Log::info("Deleting pin {$id}");
            $pin->delete();
            
            return $this->successMessageResponse('Pin deleted successfully');
        } catch (\Exception $e) {
            Log::error('Delete operation failed: ' . $e->getMessage(), [
                'exception' => $e,
                'controller' => get_class($this)
            ]);
            return $this->handleException($e, 'Pin', 'Failed to delete pin');
        }
    }
}
