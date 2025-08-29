<?php

namespace Database\Seeders;

use App\Models\Pin;
use Illuminate\Database\Seeder;

class PinSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $pins = [
            // New York City Development (project_id: 1)
            [
                'project_id' => 1,
                'latitude' => 40.758896,
                'longitude' => -73.985130,
            ],
            [
                'project_id' => 1,
                'latitude' => 40.7505,
                'longitude' => -73.9934,
            ],
            [
                'project_id' => 1,
                'latitude' => 40.7128,
                'longitude' => -74.0060,
            ],
            // Los Angeles Infrastructure (project_id: 2)
            [
                'project_id' => 2,
                'latitude' => 34.0522,
                'longitude' => -118.2437,
            ],
            [
                'project_id' => 2,
                'latitude' => 34.0736,
                'longitude' => -118.2400,
            ],
            [
                'project_id' => 2,
                'latitude' => 33.7490,
                'longitude' => -118.3880,
            ],
            // London Urban Planning (project_id: 3)
            [
                'project_id' => 3,
                'latitude' => 51.5074,
                'longitude' => -0.1278,
            ],
            [
                'project_id' => 3,
                'latitude' => 51.4543,
                'longitude' => -2.5879,
            ],
            [
                'project_id' => 3,
                'latitude' => 51.4816,
                'longitude' => -3.1791,
            ],
            // Paris Metro Expansion (project_id: 4)
            [
                'project_id' => 4,
                'latitude' => 48.8566,
                'longitude' => 2.3522,
            ],
            [
                'project_id' => 4,
                'latitude' => 48.8584,
                'longitude' => 2.2945,
            ],
            [
                'project_id' => 4,
                'latitude' => 48.8606,
                'longitude' => 2.3376,
            ],
            // Tokyo Smart City (project_id: 5)
            [
                'project_id' => 5,
                'latitude' => 35.6762,
                'longitude' => 139.6503,
            ],
            [
                'project_id' => 5,
                'latitude' => 35.6895,
                'longitude' => 139.6917,
            ],
            [
                'project_id' => 5,
                'latitude' => 35.6586,
                'longitude' => 139.7454,
            ],
            // Singapore Marina Bay (project_id: 6)
            [
                'project_id' => 6,
                'latitude' => 1.3521,
                'longitude' => 103.8198,
            ],
            [
                'project_id' => 6,
                'latitude' => 1.2841,
                'longitude' => 103.8515,
            ],
            [
                'project_id' => 6,
                'latitude' => 1.2956,
                'longitude' => 103.7240,
            ],
            // Cape Town Waterfront (project_id: 7)
            [
                'project_id' => 7,
                'latitude' => -33.9249,
                'longitude' => 18.4241,
            ],
            [
                'project_id' => 7,
                'latitude' => -33.9064,
                'longitude' => 18.4702,
            ],
            [
                'project_id' => 7,
                'latitude' => -33.9180,
                'longitude' => 18.4233,
            ],
            // São Paulo Metro (project_id: 8)
            [
                'project_id' => 8,
                'latitude' => -23.5505,
                'longitude' => -46.6333,
            ],
            [
                'project_id' => 8,
                'latitude' => -23.5882,
                'longitude' => -46.6324,
            ],
            [
                'project_id' => 8,
                'latitude' => -23.5475,
                'longitude' => -46.6361,
            ],
        ];

        foreach ($pins as $pinData) {
            Pin::create($pinData);
        }
    }
}
