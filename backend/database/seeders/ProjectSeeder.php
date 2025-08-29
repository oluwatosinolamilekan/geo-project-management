<?php

namespace Database\Seeders;

use App\Models\Project;
use Illuminate\Database\Seeder;

class ProjectSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
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
    }
}
