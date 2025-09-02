<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\StorePinRequest;
use App\Http\Requests\UpdatePinRequest;
use App\Http\Resources\PinResource;
use App\Models\Pin;
use App\Models\Project;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class PinController extends BaseOperationController
{
    /**
     * Display a listing of pins for a specific project.
     */
    public function index(string $projectId): JsonResponse
    {
        return $this->handleRead(
            fn() => PinResource::collection(
                Project::findOrFail($projectId)
                    ->pins()
                    ->get()
            )
        );
    }

    /**
     * Store a newly created pin in storage.
     */
    public function store(StorePinRequest $request, string $projectId): JsonResponse
    {
        return $this->handleCreate(
            function() use ($request, $projectId) {
                $project = Project::findOrFail($projectId);
                
                return new PinResource(
                    $project->pins()
                        ->create($request->validated())
                );
            }
        );
    }

    /**
     * Display the specified pin.
     */
    public function show(string $id): JsonResponse
    {
        return $this->handleRead(
            fn() => new PinResource(
                Pin::with('project.region')
                    ->findOrFail($id)
            )
        );
    }

    /**
     * Update the specified pin in storage.
     */
    public function update(UpdatePinRequest $request, string $id): JsonResponse
    {
        return $this->handleUpdate(
            fn() => new PinResource(
                tap(
                    Pin::findOrFail($id),
                    fn($pin) => $pin->update($request->validated())
                )->load('project.region')
            )
        );
    }

    /**
     * Remove the specified pin from storage.
     */
    public function destroy(string $id): JsonResponse
    {
        return $this->handleDelete(
            function() use ($id) {
                $pin = Pin::findOrFail($id);
                Log::info("Deleting pin {$id}");
                return $pin->delete();
            },
            'Pin deleted successfully'
        );
    }
}
