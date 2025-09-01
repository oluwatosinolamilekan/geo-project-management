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
        // Create users table using raw SQL to avoid PostgreSQL issues
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
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement('DROP TABLE IF EXISTS "users" CASCADE');
    }
};
