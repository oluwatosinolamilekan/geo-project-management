<?php

namespace Tests\Feature\Api;

use App\Models\Pin;
use App\Models\Project;
use App\Models\Region;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class PinControllerTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected Region $region;
    protected Project $project;

    protected function setUp(): void
    {
        parent::setUp();
        $this->region = Region::create(['name' => 'Test Region']);
        $this->project = Project::create([
            'region_id' => $this->region->id,
            'name' => 'Test Project',
            'geo_json' => ['type' => 'Point', 'coordinates' => [0, 0]],
        ]);
    }

    /** @test */
    public function it_can_list_pins_for_a_project()
    {
        $pin1 = Pin::create([
            'project_id' => $this->project->id,
            'latitude' => 12.345678,
            'longitude' => 98.765432,
        ]);
        
        $pin2 = Pin::create([
            'project_id' => $this->project->id,
            'latitude' => 23.456789,
            'longitude' => 87.654321,
        ]);

        $response = $this->getJson("/api/projects/{$this->project->id}/pins");

        $response->assertStatus(200)
            ->assertJsonStructure([
                '*' => [
                    'id',
                    'project_id',
                    'latitude',
                    'longitude',
                    'created_at',
                    'updated_at',
                ]
            ])
            ->assertJsonCount(2)
            ->assertJson([
                [
                    'id' => $pin1->id,
                    'project_id' => $this->project->id,
                    'latitude' => '12.34567800',
                    'longitude' => '98.76543200',
                ],
                [
                    'id' => $pin2->id,
                    'project_id' => $this->project->id,
                    'latitude' => '23.45678900',
                    'longitude' => '87.65432100',
                ]
            ]);
    }

    /** @test */
    public function it_returns_404_when_listing_pins_for_non_existent_project()
    {
        $response = $this->getJson('/api/projects/999/pins');

        $response->assertStatus(404);
    }

    /** @test */
    public function it_can_create_a_pin_for_a_project()
    {
        $pinData = [
            'latitude' => 45.123456,
            'longitude' => -75.654321,
        ];

        $response = $this->postJson("/api/projects/{$this->project->id}/pins", $pinData);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'id',
                'project_id',
                'latitude',
                'longitude',
                'created_at',
                'updated_at',
            ])
            ->assertJson([
                'project_id' => $this->project->id,
                'latitude' => '45.12345600',
                'longitude' => '-75.65432100',
            ]);

        $this->assertDatabaseHas('pins', [
            'project_id' => $this->project->id,
            'latitude' => 45.123456,
            'longitude' => -75.654321,
        ]);
    }

    /** @test */
    public function it_validates_required_fields_when_creating_pin()
    {
        $response = $this->postJson("/api/projects/{$this->project->id}/pins", []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['latitude', 'longitude']);
    }

    /** @test */
    public function it_validates_latitude_is_numeric_when_creating_pin()
    {
        $response = $this->postJson("/api/projects/{$this->project->id}/pins", [
            'latitude' => 'invalid',
            'longitude' => 98.765432,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['latitude']);
    }

    /** @test */
    public function it_validates_longitude_is_numeric_when_creating_pin()
    {
        $response = $this->postJson("/api/projects/{$this->project->id}/pins", [
            'latitude' => 12.345678,
            'longitude' => 'invalid',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['longitude']);
    }

    /** @test */
    public function it_validates_latitude_range_when_creating_pin()
    {
        // Test latitude out of valid range (-90 to 90)
        $response = $this->postJson("/api/projects/{$this->project->id}/pins", [
            'latitude' => 91.0, // Invalid: > 90
            'longitude' => 0.0,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['latitude']);

        $response = $this->postJson("/api/projects/{$this->project->id}/pins", [
            'latitude' => -91.0, // Invalid: < -90
            'longitude' => 0.0,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['latitude']);
    }

    /** @test */
    public function it_validates_longitude_range_when_creating_pin()
    {
        // Test longitude out of valid range (-180 to 180)
        $response = $this->postJson("/api/projects/{$this->project->id}/pins", [
            'latitude' => 0.0,
            'longitude' => 181.0, // Invalid: > 180
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['longitude']);

        $response = $this->postJson("/api/projects/{$this->project->id}/pins", [
            'latitude' => 0.0,
            'longitude' => -181.0, // Invalid: < -180
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['longitude']);
    }

    /** @test */
    public function it_accepts_valid_coordinate_ranges()
    {
        // Test valid edge cases
        $validCoordinates = [
            ['latitude' => 90.0, 'longitude' => 180.0],
            ['latitude' => -90.0, 'longitude' => -180.0],
            ['latitude' => 0.0, 'longitude' => 0.0],
        ];

        foreach ($validCoordinates as $coordinates) {
            $response = $this->postJson("/api/projects/{$this->project->id}/pins", $coordinates);
            $response->assertStatus(201);
        }
    }

    /** @test */
    public function it_returns_404_when_creating_pin_for_non_existent_project()
    {
        $pinData = [
            'latitude' => 12.345678,
            'longitude' => 98.765432,
        ];

        $response = $this->postJson('/api/projects/999/pins', $pinData);

        $response->assertStatus(404);
    }

    /** @test */
    public function it_can_show_a_specific_pin()
    {
        $pin = Pin::create([
            'project_id' => $this->project->id,
            'latitude' => 34.567890,
            'longitude' => -118.123456,
        ]);

        $response = $this->getJson("/api/pins/{$pin->id}");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'id',
                'project_id',
                'latitude',
                'longitude',
                'created_at',
                'updated_at',
                'project' => [
                    'id',
                    'region_id',
                    'name',
                    'geo_json',
                    'created_at',
                    'updated_at',
                ]
            ])
            ->assertJson([
                'id' => $pin->id,
                'project_id' => $this->project->id,
                'latitude' => '34.56789000',
                'longitude' => '-118.12345600',
            ]);
    }

    /** @test */
    public function it_returns_404_when_showing_non_existent_pin()
    {
        $response = $this->getJson('/api/pins/999');

        $response->assertStatus(404);
    }

    /** @test */
    public function it_can_update_a_pin()
    {
        $pin = Pin::create([
            'project_id' => $this->project->id,
            'latitude' => 10.000000,
            'longitude' => 20.000000,
        ]);

        $updateData = [
            'latitude' => 15.555555,
            'longitude' => 25.666666,
        ];

        $response = $this->putJson("/api/pins/{$pin->id}", $updateData);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'id',
                'project_id',
                'latitude',
                'longitude',
                'created_at',
                'updated_at',
                'project',
            ])
            ->assertJson([
                'id' => $pin->id,
                'latitude' => '15.55555500',
                'longitude' => '25.66666600',
            ]);

        $this->assertDatabaseHas('pins', [
            'id' => $pin->id,
            'latitude' => 15.555555,
            'longitude' => 25.666666,
        ]);
    }

    /** @test */
    public function it_validates_fields_when_updating_pin()
    {
        $pin = Pin::create([
            'project_id' => $this->project->id,
            'latitude' => 10.000000,
            'longitude' => 20.000000,
        ]);

        $response = $this->putJson("/api/pins/{$pin->id}", [
            'latitude' => 'invalid',
            'longitude' => 181.0, // Out of range
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['latitude', 'longitude']);
    }

    /** @test */
    public function it_returns_404_when_updating_non_existent_pin()
    {
        $response = $this->putJson('/api/pins/999', [
            'latitude' => 15.555555,
            'longitude' => 25.666666,
        ]);

        $response->assertStatus(404);
    }

    /** @test */
    public function it_can_delete_a_pin()
    {
        $pin = Pin::create([
            'project_id' => $this->project->id,
            'latitude' => 12.345678,
            'longitude' => 98.765432,
        ]);

        $response = $this->deleteJson("/api/pins/{$pin->id}");

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Pin deleted successfully',
            ]);

        $this->assertDatabaseMissing('pins', [
            'id' => $pin->id,
        ]);
    }

    /** @test */
    public function it_returns_404_when_deleting_non_existent_pin()
    {
        $response = $this->deleteJson('/api/pins/999');

        $response->assertStatus(404);
    }

    /** @test */
    public function it_returns_empty_array_when_project_has_no_pins()
    {
        $response = $this->getJson("/api/projects/{$this->project->id}/pins");

        $response->assertStatus(200)
            ->assertJson([]);
    }

    /** @test */
    public function it_handles_high_precision_coordinates()
    {
        $pinData = [
            'latitude' => 12.123456789, // High precision
            'longitude' => 98.987654321,
        ];

        $response = $this->postJson("/api/projects/{$this->project->id}/pins", $pinData);

        $response->assertStatus(201);
        
        // Verify precision is handled correctly (8 decimal places)
        $pin = Pin::latest()->first();
        $this->assertEquals('12.12345679', $pin->latitude);
        $this->assertEquals('98.98765432', $pin->longitude);
    }

    /** @test */
    public function it_includes_project_relationship_in_pin_show()
    {
        $pin = Pin::create([
            'project_id' => $this->project->id,
            'latitude' => 12.345678,
            'longitude' => 98.765432,
        ]);

        $response = $this->getJson("/api/pins/{$pin->id}");

        $response->assertStatus(200);
        $pinData = $response->json();
        
        $this->assertEquals($this->project->id, $pinData['project']['id']);
        $this->assertEquals($this->project->name, $pinData['project']['name']);
    }
}
