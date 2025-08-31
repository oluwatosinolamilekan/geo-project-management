<?php

namespace Tests\Feature\Api;

use App\Models\Project;
use App\Models\Region;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class RegionControllerTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected function setUp(): void
    {
        parent::setUp();
    }

    /** @test */
    public function it_can_list_all_regions()
    {
        // Create test data
        $region1 = Region::create(['name' => 'North America']);
        $region2 = Region::create(['name' => 'Europe']);
        
        // Create projects for regions
        Project::create([
            'region_id' => $region1->id,
            'name' => 'Project 1',
            'geo_json' => ['type' => 'Point', 'coordinates' => [0, 0]],
        ]);

        $response = $this->getJson('/api/regions');

        $response->assertStatus(200)
            ->assertJsonStructure([
                '*' => [
                    'id',
                    'name',
                    'created_at',
                    'updated_at',
                    'projects' => [
                        '*' => [
                            'id',
                            'region_id',
                            'name',
                            'geo_json',
                            'created_at',
                            'updated_at',
                        ]
                    ]
                ]
            ])
            ->assertJsonCount(2);
    }

    /** @test */
    public function it_can_create_a_region()
    {
        $regionData = [
            'name' => 'South America',
        ];

        $response = $this->postJson('/api/regions', $regionData);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'id',
                'name',
                'created_at',
                'updated_at',
            ])
            ->assertJson([
                'name' => 'South America',
            ]);

        $this->assertDatabaseHas('regions', [
            'name' => 'South America',
        ]);
    }

    /** @test */
    public function it_validates_required_fields_when_creating_region()
    {
        $response = $this->postJson('/api/regions', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name']);
    }

    /** @test */
    public function it_validates_name_is_string_when_creating_region()
    {
        $response = $this->postJson('/api/regions', [
            'name' => 123,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name']);
    }

    /** @test */
    public function it_validates_name_max_length_when_creating_region()
    {
        $response = $this->postJson('/api/regions', [
            'name' => str_repeat('a', 256), // Exceeds 255 character limit
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name']);
    }

    /** @test */
    public function it_can_show_a_specific_region()
    {
        $region = Region::create(['name' => 'Asia']);
        $project = Project::create([
            'region_id' => $region->id,
            'name' => 'Asian Project',
            'geo_json' => ['type' => 'Point', 'coordinates' => [100, 50]],
        ]);

        $response = $this->getJson("/api/regions/{$region->id}");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'id',
                'name',
                'created_at',
                'updated_at',
                'projects' => [
                    '*' => [
                        'id',
                        'region_id',
                        'name',
                        'geo_json',
                        'created_at',
                        'updated_at',
                    ]
                ]
            ])
            ->assertJson([
                'id' => $region->id,
                'name' => 'Asia',
            ]);
    }

    /** @test */
    public function it_returns_404_when_showing_non_existent_region()
    {
        $response = $this->getJson('/api/regions/999');

        $response->assertStatus(404);
    }

    /** @test */
    public function it_can_update_a_region()
    {
        $region = Region::create(['name' => 'Original Name']);

        $updateData = [
            'name' => 'Updated Name',
        ];

        $response = $this->putJson("/api/regions/{$region->id}", $updateData);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'id',
                'name',
                'created_at',
                'updated_at',
            ])
            ->assertJson([
                'id' => $region->id,
                'name' => 'Updated Name',
            ]);

        $this->assertDatabaseHas('regions', [
            'id' => $region->id,
            'name' => 'Updated Name',
        ]);
    }

    /** @test */
    public function it_validates_fields_when_updating_region()
    {
        $region = Region::create(['name' => 'Test Region']);

        $response = $this->putJson("/api/regions/{$region->id}", [
            'name' => str_repeat('a', 256), // Exceeds max length
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name']);
    }

    /** @test */
    public function it_returns_404_when_updating_non_existent_region()
    {
        $response = $this->putJson('/api/regions/999', [
            'name' => 'Updated Name',
        ]);

        $response->assertStatus(404);
    }

    /** @test */
    public function it_can_delete_a_region()
    {
        $region = Region::create(['name' => 'To Be Deleted']);

        $response = $this->deleteJson("/api/regions/{$region->id}");

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Region deleted successfully',
            ]);

        $this->assertDatabaseMissing('regions', [
            'id' => $region->id,
        ]);
    }

    /** @test */
    public function it_returns_404_when_deleting_non_existent_region()
    {
        $response = $this->deleteJson('/api/regions/999');

        $response->assertStatus(404);
    }

    /** @test */
    public function it_returns_empty_array_when_no_regions_exist()
    {
        $response = $this->getJson('/api/regions');

        $response->assertStatus(200)
            ->assertJson([]);
    }

    /** @test */
    public function it_includes_projects_count_in_region_listing()
    {
        $region = Region::create(['name' => 'Test Region']);
        
        // Create multiple projects
        Project::create([
            'region_id' => $region->id,
            'name' => 'Project 1',
            'geo_json' => ['type' => 'Point', 'coordinates' => [0, 0]],
        ]);
        Project::create([
            'region_id' => $region->id,
            'name' => 'Project 2',
            'geo_json' => ['type' => 'Point', 'coordinates' => [1, 1]],
        ]);

        $response = $this->getJson('/api/regions');

        $response->assertStatus(200);
        $regionData = $response->json()[0];
        $this->assertCount(2, $regionData['projects']);
    }
}
