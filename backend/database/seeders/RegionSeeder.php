<?php

namespace Database\Seeders;

use App\Models\Region;
use Illuminate\Database\Seeder;

class RegionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
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
    }
}
