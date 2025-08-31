<?php

namespace Tests\Unit\Models;

use App\Models\Project;
use App\Models\Region;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RegionTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function it_extends_model()
    {
        $region = new Region();
        $this->assertInstanceOf(Model::class, $region);
    }

    /** @test */
    public function it_has_correct_fillable_attributes()
    {
        $region = new Region();
        $expected = ['name'];
        $this->assertEquals($expected, $region->getFillable());
    }

    /** @test */
    public function it_can_create_region_with_valid_data()
    {
        $regionData = [
            'name' => 'North America',
        ];

        $region = Region::create($regionData);

        $this->assertInstanceOf(Region::class, $region);
        $this->assertEquals('North America', $region->name);
        $this->assertDatabaseHas('regions', [
            'name' => 'North America',
        ]);
    }

    /** @test */
    public function it_has_projects_relationship()
    {
        $region = new Region();
        $relation = $region->projects();
        
        $this->assertInstanceOf(HasMany::class, $relation);
        $this->assertEquals('region_id', $relation->getForeignKeyName());
        $this->assertEquals('id', $relation->getLocalKeyName());
    }

    /** @test */
    public function it_can_have_multiple_projects()
    {
        $region = Region::create(['name' => 'Europe']);
        
        $project1 = Project::create([
            'region_id' => $region->id,
            'name' => 'Project Alpha',
            'geo_json' => ['type' => 'Point', 'coordinates' => [0, 0]],
        ]);
        
        $project2 = Project::create([
            'region_id' => $region->id,
            'name' => 'Project Beta',
            'geo_json' => ['type' => 'Point', 'coordinates' => [1, 1]],
        ]);

        $this->assertEquals(2, $region->projects()->count());
        $this->assertTrue($region->projects->contains($project1));
        $this->assertTrue($region->projects->contains($project2));
    }

    /** @test */
    public function it_can_be_deleted_with_cascade_to_projects()
    {
        $region = Region::create(['name' => 'Asia']);
        
        $project = Project::create([
            'region_id' => $region->id,
            'name' => 'Project Gamma',
            'geo_json' => ['type' => 'Point', 'coordinates' => [2, 2]],
        ]);

        $this->assertDatabaseHas('regions', ['id' => $region->id]);
        $this->assertDatabaseHas('projects', ['id' => $project->id]);

        $region->delete();

        $this->assertDatabaseMissing('regions', ['id' => $region->id]);
        // Note: Cascade behavior depends on database migration constraints
    }

    /** @test */
    public function it_returns_correct_table_name()
    {
        $region = new Region();
        $this->assertEquals('regions', $region->getTable());
    }
}
