<?php

namespace Database\Seeders;

use App\Models\Region;
use App\Models\Project;
use App\Models\Pin;
use Illuminate\Database\Seeder;

class CompleteSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Clear existing data
        Pin::truncate();
        Project::truncate();
        Region::truncate();

        // Create regions
        $regions = [
            ['name' => 'North America'],
            ['name' => 'Europe'],
            ['name' => 'Asia Pacific'],
            ['name' => 'Africa'],
            ['name' => 'South America'],
        ];

        foreach ($regions as $regionData) {
            Region::create($regionData);
        }

        // Create projects with GeoJSON data
        $projects = [
            // North America (region_id: 1)
            [
                'region_id' => 1,
                'name' => 'New York City Development',
                'geo_json' => [
                    'type' => 'Polygon',
                    'coordinates' => [[
                        [-74.25909, 40.477399],
                        [-73.700181, 40.477399],
                        [-73.700181, 40.916178],
                        [-74.25909, 40.916178],
                        [-74.25909, 40.477399]
                    ]]
                ],
            ],
            [
                'region_id' => 1,
                'name' => 'Los Angeles Infrastructure',
                'geo_json' => [
                    'type' => 'Polygon',
                    'coordinates' => [[
                        [-118.668176, 33.703651],
                        [-118.155289, 33.703651],
                        [-118.155289, 34.337306],
                        [-118.668176, 34.337306],
                        [-118.668176, 33.703651]
                    ]]
                ],
            ],
            // Europe (region_id: 2)
            [
                'region_id' => 2,
                'name' => 'London Urban Planning',
                'geo_json' => [
                    'type' => 'Polygon',
                    'coordinates' => [[
                        [-0.510375, 51.28676],
                        [0.334015, 51.28676],
                        [0.334015, 51.691874],
                        [-0.510375, 51.691874],
                        [-0.510375, 51.28676]
                    ]]
                ],
            ],
            [
                'region_id' => 2,
                'name' => 'Paris Metro Expansion',
                'geo_json' => [
                    'type' => 'Polygon',
                    'coordinates' => [[
                        [2.224199, 48.815573],
                        [2.469925, 48.815573],
                        [2.469925, 48.902145],
                        [2.224199, 48.902145],
                        [2.224199, 48.815573]
                    ]]
                ],
            ],
            // Asia Pacific (region_id: 3)
            [
                'region_id' => 3,
                'name' => 'Tokyo Smart City',
                'geo_json' => [
                    'type' => 'Polygon',
                    'coordinates' => [[
                        [139.691704, 35.689521],
                        [139.767306, 35.689521],
                        [139.767306, 35.86166],
                        [139.691704, 35.86166],
                        [139.691704, 35.689521]
                    ]]
                ],
            ],
            [
                'region_id' => 3,
                'name' => 'Singapore Marina Bay',
                'geo_json' => [
                    'type' => 'Polygon',
                    'coordinates' => [[
                        [103.628201, 1.264373],
                        [103.851959, 1.264373],
                        [103.851959, 1.455755],
                        [103.628201, 1.455755],
                        [103.628201, 1.264373]
                    ]]
                ],
            ],
            // Africa (region_id: 4)
            [
                'region_id' => 4,
                'name' => 'Cape Town Waterfront',
                'geo_json' => [
                    'type' => 'Polygon',
                    'coordinates' => [[
                        [18.424055, -33.924868],
                        [18.470215, -33.924868],
                        [18.470215, -33.906448],
                        [18.424055, -33.906448],
                        [18.424055, -33.924868]
                    ]]
                ],
            ],
            // South America (region_id: 5)
            [
                'region_id' => 5,
                'name' => 'São Paulo Metro',
                'geo_json' => [
                    'type' => 'Polygon',
                    'coordinates' => [[
                        [-46.693419, -23.588194],
                        [-46.641146, -23.588194],
                        [-46.641146, -23.55052],
                        [-46.693419, -23.55052],
                        [-46.693419, -23.588194]
                    ]]
                ],
            ],
        ];

        foreach ($projects as $projectData) {
            Project::create($projectData);
        }

        // Create pins for each project
        $pins = [
            // New York City Development (project_id: 1)
            ['project_id' => 1, 'latitude' => 40.758896, 'longitude' => -73.985130],
            ['project_id' => 1, 'latitude' => 40.7505, 'longitude' => -73.9934],
            ['project_id' => 1, 'latitude' => 40.7128, 'longitude' => -74.0060],
            
            // Los Angeles Infrastructure (project_id: 2)
            ['project_id' => 2, 'latitude' => 34.0522, 'longitude' => -118.2437],
            ['project_id' => 2, 'latitude' => 34.0736, 'longitude' => -118.2400],
            ['project_id' => 2, 'latitude' => 33.7490, 'longitude' => -118.3880],
            
            // London Urban Planning (project_id: 3)
            ['project_id' => 3, 'latitude' => 51.5074, 'longitude' => -0.1278],
            ['project_id' => 3, 'latitude' => 51.4543, 'longitude' => -2.5879],
            ['project_id' => 3, 'latitude' => 51.4816, 'longitude' => -3.1791],
            
            // Paris Metro Expansion (project_id: 4)
            ['project_id' => 4, 'latitude' => 48.8566, 'longitude' => 2.3522],
            ['project_id' => 4, 'latitude' => 48.8584, 'longitude' => 2.2945],
            ['project_id' => 4, 'latitude' => 48.8606, 'longitude' => 2.3376],
            
            // Tokyo Smart City (project_id: 5)
            ['project_id' => 5, 'latitude' => 35.6762, 'longitude' => 139.6503],
            ['project_id' => 5, 'latitude' => 35.6895, 'longitude' => 139.6917],
            ['project_id' => 5, 'latitude' => 35.6586, 'longitude' => 139.7454],
            
            // Singapore Marina Bay (project_id: 6)
            ['project_id' => 6, 'latitude' => 1.3521, 'longitude' => 103.8198],
            ['project_id' => 6, 'latitude' => 1.2841, 'longitude' => 103.8515],
            ['project_id' => 6, 'latitude' => 1.2956, 'longitude' => 103.7240],
            
            // Cape Town Waterfront (project_id: 7)
            ['project_id' => 7, 'latitude' => -33.9249, 'longitude' => 18.4241],
            ['project_id' => 7, 'latitude' => -33.9064, 'longitude' => 18.4702],
            ['project_id' => 7, 'latitude' => -33.9180, 'longitude' => 18.4233],
            
            // São Paulo Metro (project_id: 8)
            ['project_id' => 8, 'latitude' => -23.5505, 'longitude' => -46.6333],
            ['project_id' => 8, 'latitude' => -23.5882, 'longitude' => -46.6324],
            ['project_id' => 8, 'latitude' => -23.5475, 'longitude' => -46.6361],
        ];

        foreach ($pins as $pinData) {
            Pin::create($pinData);
        }

        $this->command->info('Database seeded successfully!');
        $this->command->info('Created ' . Region::count() . ' regions');
        $this->command->info('Created ' . Project::count() . ' projects');
        $this->command->info('Created ' . Pin::count() . ' pins');
    }
}
