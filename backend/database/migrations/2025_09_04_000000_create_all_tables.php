<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Create users table
        DB::statement('
            CREATE TABLE IF NOT EXISTS "users" (
                "id" BIGSERIAL PRIMARY KEY,
                "name" VARCHAR(255) NOT NULL,
                "email" VARCHAR(255) NOT NULL UNIQUE,
                "email_verified_at" TIMESTAMP NULL,
                "password" VARCHAR(255) NOT NULL,
                "remember_token" VARCHAR(100) NULL,
                "created_at" TIMESTAMP NULL,
                "updated_at" TIMESTAMP NULL
            )
        ');

        // Create regions table
        DB::statement('
            CREATE TABLE IF NOT EXISTS "regions" (
                "id" BIGSERIAL PRIMARY KEY,
                "name" VARCHAR(255) NOT NULL,
                "created_at" TIMESTAMP NULL,
                "updated_at" TIMESTAMP NULL
            )
        ');

        // Add unique constraint to regions name
        DB::statement('
            ALTER TABLE "regions" ADD CONSTRAINT "regions_name_unique" UNIQUE ("name")
        ');

        // Create projects table
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

        // Create pins table
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
        // Drop tables in reverse order
        DB::statement('DROP TABLE IF EXISTS "pins" CASCADE');
        DB::statement('DROP TABLE IF EXISTS "projects" CASCADE');
        DB::statement('DROP TABLE IF EXISTS "regions" CASCADE');
        DB::statement('DROP TABLE IF EXISTS "users" CASCADE');
    }
};
