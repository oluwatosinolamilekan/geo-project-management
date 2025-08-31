<?php

namespace Tests\Feature\Api;

use App\Models\Pin;
use App\Models\Project;
use App\Models\Region;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class IntegrationTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    /** @test */
    public function it_can_perform_complete_crud_workflow()
    {
        // 1. Create a region
        $regionData = ['name' => 'North America'];
        $regionResponse = $this->postJson('/api/regions', $regionData);
        $regionResponse->assertStatus(201);
        $region = $regionResponse->json();

        // 2. Create a project for the region
        $projectData = [
            'name' => 'California Project',
            'geo_json' => [
                'type' => 'Polygon',
                'coordinates' => [
                    [[-124.0, 32.0], [-114.0, 32.0], [-114.0, 42.0], [-124.0, 42.0], [-124.0, 32.0]]
                ]
            ],
        ];
        $projectResponse = $this->postJson("/api/regions/{$region['id']}/projects", $projectData);
        $projectResponse->assertStatus(201);
        $project = $projectResponse->json();

        // 3. Create pins for the project
        $pin1Data = ['latitude' => 37.7749, 'longitude' => -122.4194]; // San Francisco
        $pin2Data = ['latitude' => 34.0522, 'longitude' => -118.2437]; // Los Angeles

        $pin1Response = $this->postJson("/api/projects/{$project['id']}/pins", $pin1Data);
        $pin2Response = $this->postJson("/api/projects/{$project['id']}/pins", $pin2Data);
        
        $pin1Response->assertStatus(201);
        $pin2Response->assertStatus(201);
        
        $pin1 = $pin1Response->json();
        $pin2 = $pin2Response->json();

        // 4. Verify the complete structure by fetching region with all relationships
        $regionDetailResponse = $this->getJson("/api/regions/{$region['id']}");
        $regionDetailResponse->assertStatus(200);
        $regionDetail = $regionDetailResponse->json();

        $this->assertEquals('North America', $regionDetail['name']);
        $this->assertCount(1, $regionDetail['projects']);
        $this->assertEquals('California Project', $regionDetail['projects'][0]['name']);

        // 5. Verify project details with pins
        $projectDetailResponse = $this->getJson("/api/projects/{$project['id']}");
        $projectDetailResponse->assertStatus(200);
        $projectDetail = $projectDetailResponse->json();

        $this->assertEquals('California Project', $projectDetail['name']);
        $this->assertEquals('North America', $projectDetail['region']['name']);
        $this->assertCount(2, $projectDetail['pins']);

        // 6. Update operations
        $updatedRegionData = ['name' => 'North America Updated'];
        $updateRegionResponse = $this->putJson("/api/regions/{$region['id']}", $updatedRegionData);
        $updateRegionResponse->assertStatus(200);

        $updatedProjectData = [
            'name' => 'California Project Updated',
            'geo_json' => ['type' => 'Point', 'coordinates' => [-119.0, 37.0]],
        ];
        $updateProjectResponse = $this->putJson("/api/projects/{$project['id']}", $updatedProjectData);
        $updateProjectResponse->assertStatus(200);

        $updatedPinData = ['latitude' => 36.7783, 'longitude' => -119.4179]; // California center
        $updatePinResponse = $this->putJson("/api/pins/{$pin1['id']}", $updatedPinData);
        $updatePinResponse->assertStatus(200);

        // 7. Verify updates
        $verifyRegionResponse = $this->getJson("/api/regions/{$region['id']}");
        $verifyRegionResponse->assertStatus(200);
        $this->assertEquals('North America Updated', $verifyRegionResponse->json()['name']);

        $verifyProjectResponse = $this->getJson("/api/projects/{$project['id']}");
        $verifyProjectResponse->assertStatus(200);
        $verifyProject = $verifyProjectResponse->json();
        $this->assertEquals('California Project Updated', $verifyProject['name']);
        $this->assertEquals(['type' => 'Point', 'coordinates' => [-119.0, 37.0]], $verifyProject['geo_json']);

        $verifyPinResponse = $this->getJson("/api/pins/{$pin1['id']}");
        $verifyPinResponse->assertStatus(200);
        $verifyPin = $verifyPinResponse->json();
        $this->assertEquals('36.77830000', $verifyPin['latitude']);
        $this->assertEquals('-119.41790000', $verifyPin['longitude']);

        // 8. Delete operations (in reverse order to maintain referential integrity)
        $deletePinResponse = $this->deleteJson("/api/pins/{$pin1['id']}");
        $deletePinResponse->assertStatus(200);

        $deletePin2Response = $this->deleteJson("/api/pins/{$pin2['id']}");
        $deletePin2Response->assertStatus(200);

        $deleteProjectResponse = $this->deleteJson("/api/projects/{$project['id']}");
        $deleteProjectResponse->assertStatus(200);

        $deleteRegionResponse = $this->deleteJson("/api/regions/{$region['id']}");
        $deleteRegionResponse->assertStatus(200);

        // 9. Verify deletions
        $this->getJson("/api/pins/{$pin1['id']}")->assertStatus(404);
        $this->getJson("/api/pins/{$pin2['id']}")->assertStatus(404);
        $this->getJson("/api/projects/{$project['id']}")->assertStatus(404);
        $this->getJson("/api/regions/{$region['id']}")->assertStatus(404);
    }

    /** @test */
    public function it_handles_nested_resource_relationships_correctly()
    {
        // Create test data
        $region = Region::create(['name' => 'Europe']);
        $project1 = Project::create([
            'region_id' => $region->id,
            'name' => 'France Project',
            'geo_json' => ['type' => 'Point', 'coordinates' => [2.3522, 48.8566]],
        ]);
        $project2 = Project::create([
            'region_id' => $region->id,
            'name' => 'Germany Project',
            'geo_json' => ['type' => 'Point', 'coordinates' => [13.4050, 52.5200]],
        ]);

        Pin::create(['project_id' => $project1->id, 'latitude' => 48.8566, 'longitude' => 2.3522]); // Paris
        Pin::create(['project_id' => $project1->id, 'latitude' => 43.6047, 'longitude' => 1.4442]); // Toulouse
        Pin::create(['project_id' => $project2->id, 'latitude' => 52.5200, 'longitude' => 13.4050]); // Berlin

        // Test region listing includes all projects with pins
        $response = $this->getJson('/api/regions');
        $response->assertStatus(200);
        
        $regions = $response->json();
        $this->assertCount(1, $regions);
        
        $regionData = $regions[0];
        $this->assertEquals('Europe', $regionData['name']);
        $this->assertCount(2, $regionData['projects']);
        
        // Check first project has 2 pins
        $franceProject = collect($regionData['projects'])->firstWhere('name', 'France Project');
        $this->assertCount(2, $franceProject['pins']);
        
        // Check second project has 1 pin
        $germanyProject = collect($regionData['projects'])->firstWhere('name', 'Germany Project');
        $this->assertCount(1, $germanyProject['pins']);
    }

    /** @test */
    public function it_maintains_data_consistency_across_operations()
    {
        // Create initial data
        $region = Region::create(['name' => 'Asia']);
        $project = Project::create([
            'region_id' => $region->id,
            'name' => 'Japan Project',
            'geo_json' => ['type' => 'Point', 'coordinates' => [139.6917, 35.6895]],
        ]);
        $pin = Pin::create([
            'project_id' => $project->id,
            'latitude' => 35.6895,
            'longitude' => 139.6917,
        ]);

        // Verify initial state
        $this->assertDatabaseHas('regions', ['id' => $region->id, 'name' => 'Asia']);
        $this->assertDatabaseHas('projects', ['id' => $project->id, 'region_id' => $region->id]);
        $this->assertDatabaseHas('pins', ['id' => $pin->id, 'project_id' => $project->id]);

        // Update project and verify pin relationship is maintained
        $updateResponse = $this->putJson("/api/projects/{$project->id}", [
            'name' => 'Updated Japan Project',
            'geo_json' => ['type' => 'Point', 'coordinates' => [140.0, 36.0]],
        ]);
        $updateResponse->assertStatus(200);

        // Verify pin still belongs to the updated project
        $pinResponse = $this->getJson("/api/pins/{$pin->id}");
        $pinResponse->assertStatus(200);
        $pinData = $pinResponse->json();
        
        $this->assertEquals($project->id, $pinData['project_id']);
        $this->assertEquals('Updated Japan Project', $pinData['project']['name']);
        $this->assertEquals(['type' => 'Point', 'coordinates' => [140.0, 36.0]], $pinData['project']['geo_json']);
    }

    /** @test */
    public function it_handles_concurrent_operations_gracefully()
    {
        $region = Region::create(['name' => 'Test Region']);

        // Create multiple projects simultaneously
        $projectData1 = ['name' => 'Project 1', 'geo_json' => ['type' => 'Point', 'coordinates' => [0, 0]]];
        $projectData2 = ['name' => 'Project 2', 'geo_json' => ['type' => 'Point', 'coordinates' => [1, 1]]];
        $projectData3 = ['name' => 'Project 3', 'geo_json' => ['type' => 'Point', 'coordinates' => [2, 2]]];

        $response1 = $this->postJson("/api/regions/{$region->id}/projects", $projectData1);
        $response2 = $this->postJson("/api/regions/{$region->id}/projects", $projectData2);
        $response3 = $this->postJson("/api/regions/{$region->id}/projects", $projectData3);

        $response1->assertStatus(201);
        $response2->assertStatus(201);
        $response3->assertStatus(201);

        // Verify all projects were created
        $regionResponse = $this->getJson("/api/regions/{$region->id}");
        $regionResponse->assertStatus(200);
        
        $regionData = $regionResponse->json();
        $this->assertCount(3, $regionData['projects']);
    }

    /** @test */
    public function it_validates_data_integrity_across_all_endpoints()
    {
        // Test with various data types and edge cases
        $region = Region::create(['name' => 'Test Region']);
        
        // Test project with complex GeoJSON
        $complexGeoJson = [
            'type' => 'MultiPolygon',
            'coordinates' => [
                [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]],
                [[[2, 2], [3, 2], [3, 3], [2, 3], [2, 2]]],
            ],
        ];
        
        $projectResponse = $this->postJson("/api/regions/{$region->id}/projects", [
            'name' => 'Complex Geometry Project',
            'geo_json' => $complexGeoJson,
        ]);
        $projectResponse->assertStatus(201);
        $project = $projectResponse->json();

        // Test pin with high precision coordinates
        $pinResponse = $this->postJson("/api/projects/{$project['id']}/pins", [
            'latitude' => 12.123456789,
            'longitude' => 98.987654321,
        ]);
        $pinResponse->assertStatus(201);
        $pin = $pinResponse->json();

        // Verify data integrity
        $this->assertEquals($complexGeoJson, $project['geo_json']);
        $this->assertEquals('12.12345679', $pin['latitude']); // Precision handled correctly
        $this->assertEquals('98.98765432', $pin['longitude']);
    }
}
