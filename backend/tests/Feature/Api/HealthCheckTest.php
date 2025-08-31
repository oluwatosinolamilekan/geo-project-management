<?php

namespace Tests\Feature\Api;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class HealthCheckTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function it_returns_healthy_status()
    {
        $response = $this->getJson('/api/health');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'status',
                'timestamp',
                'version',
            ])
            ->assertJson([
                'status' => 'healthy',
                'version' => '1.0.0',
            ]);
    }

    /** @test */
    public function it_includes_timestamp_in_iso_format()
    {
        $response = $this->getJson('/api/health');

        $response->assertStatus(200);
        
        $data = $response->json();
        $this->assertArrayHasKey('timestamp', $data);
        
        // Verify timestamp is in ISO format
        $timestamp = $data['timestamp'];
        $this->assertMatchesRegularExpression('/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{6}Z$/', $timestamp);
    }

    /** @test */
    public function it_returns_consistent_response_structure()
    {
        $response1 = $this->getJson('/api/health');
        $response2 = $this->getJson('/api/health');

        $response1->assertStatus(200);
        $response2->assertStatus(200);

        $data1 = $response1->json();
        $data2 = $response2->json();

        // Same keys should be present
        $this->assertEquals(array_keys($data1), array_keys($data2));
        
        // Status and version should be the same
        $this->assertEquals($data1['status'], $data2['status']);
        $this->assertEquals($data1['version'], $data2['version']);
    }
}
