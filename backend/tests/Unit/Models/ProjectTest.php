<?php

namespace Tests\Unit\Models;

use App\Models\Pin;
use App\Models\Project;
use App\Models\Region;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProjectTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function it_extends_model()
    {
        $project = new Project();
        $this->assertInstanceOf(Model::class, $project);
    }

    /** @test */
    public function it_has_correct_fillable_attributes()
    {
        $project = new Project();
        $expected = ['region_id', 'name', 'geo_json'];
        $this->assertEquals($expected, $project->getFillable());
    }

    /** @test */
    public function it_casts_geo_json_to_array()
    {
        $project = new Project();
        $this->assertEquals('array', $project->getCasts()['geo_json']);
    }

    /** @test */
    public function it_can_create_project_with_valid_data()
    {
        $region = Region::create(['name' => 'Europe']);
        
        $projectData = [
            'region_id' => $region->id,
            'name' => 'Test Project',
            'geo_json' => ['type' => 'Point', 'coordinates' => [0, 0]],
        ];

        $project = Project::create($projectData);

        $this->assertInstanceOf(Project::class, $project);
        $this->assertEquals('Test Project', $project->name);
        $this->assertEquals($region->id, $project->region_id);
        $this->assertEquals(['type' => 'Point', 'coordinates' => [0, 0]], $project->geo_json);
        $this->assertDatabaseHas('projects', [
            'name' => 'Test Project',
            'region_id' => $region->id,
        ]);
    }

    /** @test */
    public function it_has_region_relationship()
    {
        $project = new Project();
        $relation = $project->region();
        
        $this->assertInstanceOf(BelongsTo::class, $relation);
        $this->assertEquals('region_id', $relation->getForeignKeyName());
        $this->assertEquals('id', $relation->getOwnerKeyName());
    }

    /** @test */
    public function it_has_pins_relationship()
    {
        $project = new Project();
        $relation = $project->pins();
        
        $this->assertInstanceOf(HasMany::class, $relation);
        $this->assertEquals('project_id', $relation->getForeignKeyName());
        $this->assertEquals('id', $relation->getLocalKeyName());
    }

    /** @test */
    public function it_belongs_to_a_region()
    {
        $region = Region::create(['name' => 'North America']);
        $project = Project::create([
            'region_id' => $region->id,
            'name' => 'Project Alpha',
            'geo_json' => ['type' => 'Point', 'coordinates' => [10, 20]],
        ]);

        $this->assertEquals($region->id, $project->region->id);
        $this->assertEquals('North America', $project->region->name);
    }

    /** @test */
    public function it_can_have_multiple_pins()
    {
        $region = Region::create(['name' => 'Asia']);
        $project = Project::create([
            'region_id' => $region->id,
            'name' => 'Project Beta',
            'geo_json' => ['type' => 'Point', 'coordinates' => [30, 40]],
        ]);
        
        $pin1 = Pin::create([
            'project_id' => $project->id,
            'latitude' => 12.345678,
            'longitude' => 98.765432,
        ]);
        
        $pin2 = Pin::create([
            'project_id' => $project->id,
            'latitude' => 23.456789,
            'longitude' => 87.654321,
        ]);

        $this->assertEquals(2, $project->pins()->count());
        $this->assertTrue($project->pins->contains($pin1));
        $this->assertTrue($project->pins->contains($pin2));
    }

    /** @test */
    public function it_stores_geo_json_as_array()
    {
        $region = Region::create(['name' => 'Africa']);
        $geoJsonData = [
            'type' => 'Polygon',
            'coordinates' => [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]],
        ];

        $project = Project::create([
            'region_id' => $region->id,
            'name' => 'Complex Geometry Project',
            'geo_json' => $geoJsonData,
        ]);

        $this->assertIsArray($project->geo_json);
        $this->assertEquals($geoJsonData, $project->geo_json);
    }

    /** @test */
    public function it_can_be_updated()
    {
        $region = Region::create(['name' => 'South America']);
        $project = Project::create([
            'region_id' => $region->id,
            'name' => 'Original Name',
            'geo_json' => ['type' => 'Point', 'coordinates' => [0, 0]],
        ]);

        $newGeoJson = ['type' => 'Point', 'coordinates' => [50, 60]];
        $project->update([
            'name' => 'Updated Name',
            'geo_json' => $newGeoJson,
        ]);

        $this->assertEquals('Updated Name', $project->name);
        $this->assertEquals($newGeoJson, $project->geo_json);
        $this->assertDatabaseHas('projects', [
            'id' => $project->id,
            'name' => 'Updated Name',
        ]);
    }

    /** @test */
    public function it_returns_correct_table_name()
    {
        $project = new Project();
        $this->assertEquals('projects', $project->getTable());
    }
}
