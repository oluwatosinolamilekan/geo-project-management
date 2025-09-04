<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Create projects table using raw SQL to avoid PostgreSQL transaction issues
        DB::statement('
            CREATE TABLE IF NOT EXISTS "projects" (
                "id" BIGSERIAL PRIMARY KEY,
                "region_id" BIGINT NOT NULL,
                "name" VARCHAR(255) NOT NULL,
                "geo_json" JSONB NOT NULL,
                "created_at" TIMESTAMP NULL,
                "updated_at" TIMESTAMP NULL,
                FOREIGN KEY ("region_id") REFERENCES "regions" ("id") ON DELETE CASCADE
            )
        ');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement('DROP TABLE IF EXISTS "projects" CASCADE');
    }
};
