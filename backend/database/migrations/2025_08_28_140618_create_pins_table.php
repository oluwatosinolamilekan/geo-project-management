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
        // Create pins table using raw SQL to avoid PostgreSQL transaction issues
        DB::statement('
            CREATE TABLE IF NOT EXISTS "pins" (
                "id" BIGSERIAL PRIMARY KEY,
                "project_id" BIGINT NOT NULL,
                "latitude" DECIMAL(10, 8) NOT NULL,
                "longitude" DECIMAL(11, 8) NOT NULL,
                "created_at" TIMESTAMP NULL,
                "updated_at" TIMESTAMP NULL,
                FOREIGN KEY ("project_id") REFERENCES "projects" ("id") ON DELETE CASCADE
            )
        ');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement('DROP TABLE IF EXISTS "pins" CASCADE');
    }
};
