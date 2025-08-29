<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\StoreRegionRequest;
use App\Http\Requests\UpdateRegionRequest;
use App\Http\Resources\RegionResource;
use App\Models\Region;
use Illuminate\Http\JsonResponse;

class RegionController extends BaseApiController
{
    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        return $this->handleRead(
            fn() => RegionResource::collection(Region::with('projects')->get())
        );
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreRegionRequest $request): JsonResponse
    {
        return $this->handleCreate(
            fn() => new RegionResource(Region::create($request->validated()))
        );
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id): JsonResponse
    {
        return $this->handleRead(
            fn() => new RegionResource(Region::with('projects')->findOrFail($id))
        );
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateRegionRequest $request, string $id): JsonResponse
    {
        return $this->handleUpdate(
            fn() => new RegionResource(
                tap(Region::findOrFail($id), fn($region) => $region->update($request->validated()))
            )
        );
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id): JsonResponse
    {
        return $this->handleDelete(
            fn() => Region::findOrFail($id)->delete(),
            'Region deleted successfully'
        );
    }
}
