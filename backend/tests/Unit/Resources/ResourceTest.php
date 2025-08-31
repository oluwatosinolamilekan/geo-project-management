<?php

namespace Tests\Unit\Resources;

use App\Http\Resources\PinResource;
use App\Http\Resources\ProjectResource;
use App\Http\Resources\RegionResource;
use App\Models\Pin;
use App\Models\Project;
use App\Models\Region;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ResourceTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function region_resource_returns_correct_structure()
    {
        $region = Region::create(['name' => 'Test Region']);

        $resource = new RegionResource($region);
        $array = $resource->toArray(request());

        $expectedKeys = ['id', 'name', 'created_at', 'updated_at', 'projects'];
        $this->assertEquals($expectedKeys, array_keys($array));
        
        $this->assertEquals($region->id, $array['id']);
        $this->assertEquals('Test Region', $array['name']);
        $this->assertNotNull($array['created_at']);
        $this->assertNotNull($array['updated_at']);
    }

    /** @test */
    public function region_resource_includes_projects_when_loaded()
    {
        $region = Region::create(['name' => 'Test Region']);
        $project = Project::create([
            'region_id' => $region->id,
            'name' => 'Test Project',
            'geo_json' => ['type' => 'Point', 'coordinates' => [0, 0]],
        ]);

        $regionWithProjects = Region::with('projects')->find($region->id);
        $resource = new RegionResource($regionWithProjects);
        $array = $resource->toArray(request());

        $this->assertArrayHasKey('projects', $array);
        $this->assertNotNull($array['projects']);
        // Projects will be a ResourceCollection when loaded
        $projectsArray = $array['projects']->toArray(request());
        $this->assertCount(1, $projectsArray);
        $this->assertEquals($project->id, $projectsArray[0]['id']);
    }

    /** @test */
    public function project_resource_returns_correct_structure()
    {
        $region = Region::create(['name' => 'Test Region']);
        $project = Project::create([
            'region_id' => $region->id,
            'name' => 'Test Project',
            'geo_json' => ['type' => 'Point', 'coordinates' => [10, 20]],
        ]);

        $resource = new ProjectResource($project);
        $array = $resource->toArray(request());

        $expectedKeys = ['id', 'name', 'geo_json', 'region_id', 'created_at', 'updated_at', 'region', 'pins'];
        $this->assertEquals($expectedKeys, array_keys($array));
        
        $this->assertEquals($project->id, $array['id']);
        $this->assertEquals('Test Project', $array['name']);
        $this->assertEquals(['type' => 'Point', 'coordinates' => [10, 20]], $array['geo_json']);
        $this->assertEquals($region->id, $array['region_id']);
    }

    /** @test */
    public function project_resource_includes_region_when_loaded()
    {
        $region = Region::create(['name' => 'Test Region']);
        $project = Project::create([
            'region_id' => $region->id,
            'name' => 'Test Project',
            'geo_json' => ['type' => 'Point', 'coordinates' => [0, 0]],
        ]);

        $projectWithRegion = Project::with('region')->find($project->id);
        $resource = new ProjectResource($projectWithRegion);
        $array = $resource->toArray(request());

        $this->assertArrayHasKey('region', $array);
        $this->assertNotNull($array['region']);
        // Region will be a RegionResource when loaded
        $regionArray = $array['region']->toArray(request());
        $this->assertEquals($region->id, $regionArray['id']);
        $this->assertEquals('Test Region', $regionArray['name']);
    }

    /** @test */
    public function project_resource_includes_pins_when_loaded()
    {
        $region = Region::create(['name' => 'Test Region']);
        $project = Project::create([
            'region_id' => $region->id,
            'name' => 'Test Project',
            'geo_json' => ['type' => 'Point', 'coordinates' => [0, 0]],
        ]);
        $pin = Pin::create([
            'project_id' => $project->id,
            'latitude' => 12.345678,
            'longitude' => 98.765432,
        ]);

        $projectWithPins = Project::with('pins')->find($project->id);
        $resource = new ProjectResource($projectWithPins);
        $array = $resource->toArray(request());

        $this->assertArrayHasKey('pins', $array);
        $this->assertNotNull($array['pins']);
        // Pins will be a ResourceCollection when loaded
        $pinsArray = $array['pins']->toArray(request());
        $this->assertCount(1, $pinsArray);
        $this->assertEquals($pin->id, $pinsArray[0]['id']);
    }

    /** @test */
    public function pin_resource_returns_correct_structure()
    {
        $region = Region::create(['name' => 'Test Region']);
        $project = Project::create([
            'region_id' => $region->id,
            'name' => 'Test Project',
            'geo_json' => ['type' => 'Point', 'coordinates' => [0, 0]],
        ]);
        $pin = Pin::create([
            'project_id' => $project->id,
            'latitude' => 45.123456,
            'longitude' => -75.654321,
        ]);

        $resource = new PinResource($pin);
        $array = $resource->toArray(request());

        $expectedKeys = ['id', 'latitude', 'longitude', 'project_id', 'created_at', 'updated_at', 'project'];
        $this->assertEquals($expectedKeys, array_keys($array));
        
        $this->assertEquals($pin->id, $array['id']);
        $this->assertEquals('45.12345600', $array['latitude']);
        $this->assertEquals('-75.65432100', $array['longitude']);
        $this->assertEquals($project->id, $array['project_id']);
    }

    /** @test */
    public function pin_resource_includes_project_when_loaded()
    {
        $region = Region::create(['name' => 'Test Region']);
        $project = Project::create([
            'region_id' => $region->id,
            'name' => 'Test Project',
            'geo_json' => ['type' => 'Point', 'coordinates' => [0, 0]],
        ]);
        $pin = Pin::create([
            'project_id' => $project->id,
            'latitude' => 45.123456,
            'longitude' => -75.654321,
        ]);

        $pinWithProject = Pin::with('project')->find($pin->id);
        $resource = new PinResource($pinWithProject);
        $array = $resource->toArray(request());

        $this->assertArrayHasKey('project', $array);
        $this->assertNotNull($array['project']);
        // Project will be a ProjectResource when loaded
        $projectArray = $array['project']->toArray(request());
        $this->assertEquals($project->id, $projectArray['id']);
        $this->assertEquals('Test Project', $projectArray['name']);
    }

    /** @test */
    public function resource_collection_works_correctly()
    {
        $region1 = Region::create(['name' => 'Region 1']);
        $region2 = Region::create(['name' => 'Region 2']);

        $regions = Region::all();
        $collection = RegionResource::collection($regions);
        $array = $collection->toArray(request());

        $this->assertCount(2, $array);
        $this->assertEquals($region1->id, $array[0]['id']);
        $this->assertEquals($region2->id, $array[1]['id']);
    }

    /** @test */
    public function resources_handle_null_relationships_gracefully()
    {
        $region = Region::create(['name' => 'Test Region']);
        $project = Project::create([
            'region_id' => $region->id,
            'name' => 'Test Project',
            'geo_json' => ['type' => 'Point', 'coordinates' => [0, 0]],
        ]);

        // Test without loading relationships
        $regionResource = new RegionResource($region);
        $projectResource = new ProjectResource($project);

        $regionArray = $regionResource->toArray(request());
        $projectArray = $projectResource->toArray(request());

        // Should not include unloaded relationships
        $this->assertArrayHasKey('projects', $regionArray);
        $this->assertArrayHasKey('region', $projectArray);
        $this->assertArrayHasKey('pins', $projectArray);
    }
}
