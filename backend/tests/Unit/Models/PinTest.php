<?php

namespace Tests\Unit\Models;

use App\Models\Pin;
use App\Models\Project;
use App\Models\Region;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PinTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function it_extends_model()
    {
        $pin = new Pin();
        $this->assertInstanceOf(Model::class, $pin);
    }

    /** @test */
    public function it_has_correct_fillable_attributes()
    {
        $pin = new Pin();
        $expected = ['project_id', 'latitude', 'longitude'];
        $this->assertEquals($expected, $pin->getFillable());
    }

    /** @test */
    public function it_casts_latitude_to_decimal()
    {
        $pin = new Pin();
        $this->assertEquals('decimal:8', $pin->getCasts()['latitude']);
    }

    /** @test */
    public function it_casts_longitude_to_decimal()
    {
        $pin = new Pin();
        $this->assertEquals('decimal:8', $pin->getCasts()['longitude']);
    }

    /** @test */
    public function it_can_create_pin_with_valid_data()
    {
        $region = Region::create(['name' => 'Europe']);
        $project = Project::create([
            'region_id' => $region->id,
            'name' => 'Test Project',
            'geo_json' => ['type' => 'Point', 'coordinates' => [0, 0]],
        ]);
        
        $pinData = [
            'project_id' => $project->id,
            'latitude' => 12.345678,
            'longitude' => 98.765432,
        ];

        $pin = Pin::create($pinData);

        $this->assertInstanceOf(Pin::class, $pin);
        $this->assertEquals($project->id, $pin->project_id);
        $this->assertEquals('12.34567800', $pin->latitude); // Decimal precision
        $this->assertEquals('98.76543200', $pin->longitude);
        $this->assertDatabaseHas('pins', [
            'project_id' => $project->id,
            'latitude' => 12.345678,
            'longitude' => 98.765432,
        ]);
    }

    /** @test */
    public function it_has_project_relationship()
    {
        $pin = new Pin();
        $relation = $pin->project();
        
        $this->assertInstanceOf(BelongsTo::class, $relation);
        $this->assertEquals('project_id', $relation->getForeignKeyName());
        $this->assertEquals('id', $relation->getOwnerKeyName());
    }

    /** @test */
    public function it_belongs_to_a_project()
    {
        $region = Region::create(['name' => 'North America']);
        $project = Project::create([
            'region_id' => $region->id,
            'name' => 'Project Alpha',
            'geo_json' => ['type' => 'Point', 'coordinates' => [10, 20]],
        ]);
        $pin = Pin::create([
            'project_id' => $project->id,
            'latitude' => 45.123456,
            'longitude' => -75.654321,
        ]);

        $this->assertEquals($project->id, $pin->project->id);
        $this->assertEquals('Project Alpha', $pin->project->name);
    }

    /** @test */
    public function it_handles_precision_for_coordinates()
    {
        $region = Region::create(['name' => 'Asia']);
        $project = Project::create([
            'region_id' => $region->id,
            'name' => 'Precision Test Project',
            'geo_json' => ['type' => 'Point', 'coordinates' => [30, 40]],
        ]);

        $pin = Pin::create([
            'project_id' => $project->id,
            'latitude' => 12.123456789, // More precision than allowed
            'longitude' => 98.987654321,
        ]);

        // Should be truncated to 8 decimal places
        $this->assertEquals('12.12345679', $pin->latitude);
        $this->assertEquals('98.98765432', $pin->longitude);
    }

    /** @test */
    public function it_can_handle_negative_coordinates()
    {
        $region = Region::create(['name' => 'Antarctica']);
        $project = Project::create([
            'region_id' => $region->id,
            'name' => 'South Pole Project',
            'geo_json' => ['type' => 'Point', 'coordinates' => [-90, 0]],
        ]);

        $pin = Pin::create([
            'project_id' => $project->id,
            'latitude' => -89.123456,
            'longitude' => -179.654321,
        ]);

        $this->assertEquals('-89.12345600', $pin->latitude);
        $this->assertEquals('-179.65432100', $pin->longitude);
    }

    /** @test */
    public function it_can_be_updated()
    {
        $region = Region::create(['name' => 'Australia']);
        $project = Project::create([
            'region_id' => $region->id,
            'name' => 'Update Test Project',
            'geo_json' => ['type' => 'Point', 'coordinates' => [0, 0]],
        ]);
        $pin = Pin::create([
            'project_id' => $project->id,
            'latitude' => 10.000000,
            'longitude' => 20.000000,
        ]);

        $pin->update([
            'latitude' => 15.555555,
            'longitude' => 25.666666,
        ]);

        $this->assertEquals('15.55555500', $pin->latitude);
        $this->assertEquals('25.66666600', $pin->longitude);
        $this->assertDatabaseHas('pins', [
            'id' => $pin->id,
            'latitude' => 15.555555,
            'longitude' => 25.666666,
        ]);
    }

    /** @test */
    public function it_returns_correct_table_name()
    {
        $pin = new Pin();
        $this->assertEquals('pins', $pin->getTable());
    }
}
