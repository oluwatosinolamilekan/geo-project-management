<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\StorePinRequest;
use App\Http\Requests\UpdatePinRequest;
use App\Http\Resources\PinResource;
use App\Models\Pin;
use App\Models\Project;
use Illuminate\Http\JsonResponse;

class PinController extends BaseApiController
{
    /**
     * Display a listing of pins for a specific project.
     */
    public function index(string $projectId): JsonResponse
    {
        return $this->handleRead(
            fn() => PinResource::collection(
                Project::findOrFail($projectId)->pins()->get()
            )
        );
    }

    /**
     * Store a newly created pin in storage.
     */
    public function store(StorePinRequest $request, string $projectId): JsonResponse
    {
        return $this->handleCreate(
            fn() => new PinResource(
                Project::findOrFail($projectId)->pins()->create($request->validated())
            )
        );
    }

    /**
     * Display the specified pin.
     */
    public function show(string $id): JsonResponse
    {
        return $this->handleRead(
            fn() => new PinResource(Pin::with('project')->findOrFail($id))
        );
    }

    /**
     * Update the specified pin in storage.
     */
    public function update(UpdatePinRequest $request, string $id): JsonResponse
    {
        return $this->handleUpdate(
            fn() => new PinResource(
                tap(Pin::findOrFail($id), fn($pin) => $pin->update($request->validated()))->load('project')
            )
        );
    }

    /**
     * Remove the specified pin from storage.
     */
    public function destroy(string $id): JsonResponse
    {
        return $this->handleDelete(
            fn() => Pin::findOrFail($id)->delete(),
            'Pin deleted successfully'
        );
    }
}
