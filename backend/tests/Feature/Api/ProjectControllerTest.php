<?php

namespace Tests\Feature\Api;

use App\Models\Pin;
use App\Models\Project;
use App\Models\Region;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class ProjectControllerTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected Region $region;

    protected function setUp(): void
    {
        parent::setUp();
        $this->region = Region::create(['name' => 'Test Region']);
    }

    /** @test */
    public function it_can_list_projects_for_a_region()
    {
        $project1 = Project::create([
            'region_id' => $this->region->id,
            'name' => 'Project Alpha',
            'geo_json' => ['type' => 'Point', 'coordinates' => [0, 0]],
        ]);
        
        $project2 = Project::create([
            'region_id' => $this->region->id,
            'name' => 'Project Beta',
            'geo_json' => ['type' => 'Point', 'coordinates' => [1, 1]],
        ]);

        // Create pins for projects
        Pin::create([
            'project_id' => $project1->id,
            'latitude' => 12.345678,
            'longitude' => 98.765432,
        ]);

        $response = $this->getJson("/api/regions/{$this->region->id}/projects");

        $response->assertStatus(200)
            ->assertJsonStructure([
                '*' => [
                    'id',
                    'region_id',
                    'name',
                    'geo_json',
                    'created_at',
                    'updated_at',
                    'pins' => [
                        '*' => [
                            'id',
                            'project_id',
                            'latitude',
                            'longitude',
                            'created_at',
                            'updated_at',
                        ]
                    ]
                ]
            ])
            ->assertJsonCount(2);
    }

    /** @test */
    public function it_returns_404_when_listing_projects_for_non_existent_region()
    {
        $response = $this->getJson('/api/regions/999/projects');

        $response->assertStatus(404);
    }

    /** @test */
    public function it_can_create_a_project_for_a_region()
    {
        $projectData = [
            'name' => 'New Project',
            'geo_json' => [
                'type' => 'Polygon',
                'coordinates' => [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]],
            ],
        ];

        $response = $this->postJson("/api/regions/{$this->region->id}/projects", $projectData);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'id',
                'region_id',
                'name',
                'geo_json',
                'created_at',
                'updated_at',
                'pins',
            ])
            ->assertJson([
                'name' => 'New Project',
                'region_id' => $this->region->id,
                'geo_json' => $projectData['geo_json'],
            ]);

        $this->assertDatabaseHas('projects', [
            'name' => 'New Project',
            'region_id' => $this->region->id,
        ]);
    }

    /** @test */
    public function it_validates_required_fields_when_creating_project()
    {
        $response = $this->postJson("/api/regions/{$this->region->id}/projects", []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'geo_json']);
    }

    /** @test */
    public function it_validates_name_is_string_when_creating_project()
    {
        $response = $this->postJson("/api/regions/{$this->region->id}/projects", [
            'name' => 123,
            'geo_json' => ['type' => 'Point', 'coordinates' => [0, 0]],
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name']);
    }

    /** @test */
    public function it_validates_geo_json_is_array_when_creating_project()
    {
        $response = $this->postJson("/api/regions/{$this->region->id}/projects", [
            'name' => 'Test Project',
            'geo_json' => 'invalid_geo_json',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['geo_json']);
    }

    /** @test */
    public function it_validates_name_max_length_when_creating_project()
    {
        $response = $this->postJson("/api/regions/{$this->region->id}/projects", [
            'name' => str_repeat('a', 256), // Exceeds 255 character limit
            'geo_json' => ['type' => 'Point', 'coordinates' => [0, 0]],
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name']);
    }

    /** @test */
    public function it_returns_404_when_creating_project_for_non_existent_region()
    {
        $projectData = [
            'name' => 'Test Project',
            'geo_json' => ['type' => 'Point', 'coordinates' => [0, 0]],
        ];

        $response = $this->postJson('/api/regions/999/projects', $projectData);

        $response->assertStatus(404);
    }

    /** @test */
    public function it_can_show_a_specific_project()
    {
        $project = Project::create([
            'region_id' => $this->region->id,
            'name' => 'Test Project',
            'geo_json' => ['type' => 'Point', 'coordinates' => [50, 60]],
        ]);

        Pin::create([
            'project_id' => $project->id,
            'latitude' => 12.345678,
            'longitude' => 98.765432,
        ]);

        $response = $this->getJson("/api/projects/{$project->id}");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'id',
                'region_id',
                'name',
                'geo_json',
                'created_at',
                'updated_at',
                'region' => [
                    'id',
                    'name',
                    'created_at',
                    'updated_at',
                ],
                'pins' => [
                    '*' => [
                        'id',
                        'project_id',
                        'latitude',
                        'longitude',
                        'created_at',
                        'updated_at',
                    ]
                ]
            ])
            ->assertJson([
                'id' => $project->id,
                'name' => 'Test Project',
            ]);
    }

    /** @test */
    public function it_returns_404_when_showing_non_existent_project()
    {
        $response = $this->getJson('/api/projects/999');

        $response->assertStatus(404);
    }

    /** @test */
    public function it_can_update_a_project()
    {
        $project = Project::create([
            'region_id' => $this->region->id,
            'name' => 'Original Project',
            'geo_json' => ['type' => 'Point', 'coordinates' => [0, 0]],
        ]);

        $updateData = [
            'name' => 'Updated Project',
            'geo_json' => ['type' => 'Point', 'coordinates' => [10, 20]],
        ];

        $response = $this->putJson("/api/projects/{$project->id}", $updateData);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'id',
                'region_id',
                'name',
                'geo_json',
                'created_at',
                'updated_at',
                'region',
                'pins',
            ])
            ->assertJson([
                'id' => $project->id,
                'name' => 'Updated Project',
                'geo_json' => $updateData['geo_json'],
            ]);

        $this->assertDatabaseHas('projects', [
            'id' => $project->id,
            'name' => 'Updated Project',
        ]);
    }

    /** @test */
    public function it_validates_fields_when_updating_project()
    {
        $project = Project::create([
            'region_id' => $this->region->id,
            'name' => 'Test Project',
            'geo_json' => ['type' => 'Point', 'coordinates' => [0, 0]],
        ]);

        $response = $this->putJson("/api/projects/{$project->id}", [
            'name' => str_repeat('a', 256), // Exceeds max length
            'geo_json' => 'invalid_geo_json',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'geo_json']);
    }

    /** @test */
    public function it_returns_404_when_updating_non_existent_project()
    {
        $response = $this->putJson('/api/projects/999', [
            'name' => 'Updated Project',
            'geo_json' => ['type' => 'Point', 'coordinates' => [0, 0]],
        ]);

        $response->assertStatus(404);
    }

    /** @test */
    public function it_can_delete_a_project()
    {
        $project = Project::create([
            'region_id' => $this->region->id,
            'name' => 'To Be Deleted',
            'geo_json' => ['type' => 'Point', 'coordinates' => [0, 0]],
        ]);

        $response = $this->deleteJson("/api/projects/{$project->id}");

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Project deleted successfully',
            ]);

        $this->assertDatabaseMissing('projects', [
            'id' => $project->id,
        ]);
    }

    /** @test */
    public function it_returns_404_when_deleting_non_existent_project()
    {
        $response = $this->deleteJson('/api/projects/999');

        $response->assertStatus(404);
    }

    /** @test */
    public function it_returns_empty_array_when_region_has_no_projects()
    {
        $response = $this->getJson("/api/regions/{$this->region->id}/projects");

        $response->assertStatus(200)
            ->assertJson([]);
    }

    /** @test */
    public function it_includes_pins_in_project_listing()
    {
        $project = Project::create([
            'region_id' => $this->region->id,
            'name' => 'Project with Pins',
            'geo_json' => ['type' => 'Point', 'coordinates' => [0, 0]],
        ]);

        Pin::create([
            'project_id' => $project->id,
            'latitude' => 12.345678,
            'longitude' => 98.765432,
        ]);
        Pin::create([
            'project_id' => $project->id,
            'latitude' => 23.456789,
            'longitude' => 87.654321,
        ]);

        $response = $this->getJson("/api/regions/{$this->region->id}/projects");

        $response->assertStatus(200);
        $projectData = $response->json()[0];
        $this->assertCount(2, $projectData['pins']);
    }
}
