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
        // Create jobs table using raw SQL to avoid PostgreSQL issues
        DB::statement('
            CREATE TABLE IF NOT EXISTS "jobs" (
                "id" BIGSERIAL PRIMARY KEY,
                "queue" VARCHAR(255) NOT NULL,
                "payload" TEXT NOT NULL,
                "attempts" SMALLINT NOT NULL,
                "reserved_at" INTEGER NULL,
                "available_at" INTEGER NOT NULL,
                "created_at" INTEGER NOT NULL
            )
        ');

        // Create index on queue column
        DB::statement('CREATE INDEX IF NOT EXISTS "jobs_queue_index" ON "jobs" ("queue")');

        // Create job_batches table
        DB::statement('
            CREATE TABLE IF NOT EXISTS "job_batches" (
                "id" VARCHAR(255) PRIMARY KEY,
                "name" VARCHAR(255) NOT NULL,
                "total_jobs" INTEGER NOT NULL,
                "pending_jobs" INTEGER NOT NULL,
                "failed_jobs" INTEGER NOT NULL,
                "failed_job_ids" TEXT NOT NULL,
                "options" TEXT NULL,
                "cancelled_at" INTEGER NULL,
                "created_at" INTEGER NOT NULL,
                "finished_at" INTEGER NULL
            )
        ');

        // Create failed_jobs table
        DB::statement('
            CREATE TABLE IF NOT EXISTS "failed_jobs" (
                "id" BIGSERIAL PRIMARY KEY,
                "uuid" VARCHAR(255) UNIQUE NOT NULL,
                "connection" TEXT NOT NULL,
                "queue" TEXT NOT NULL,
                "payload" TEXT NOT NULL,
                "exception" TEXT NOT NULL,
                "failed_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement('DROP TABLE IF EXISTS "jobs" CASCADE');
        DB::statement('DROP TABLE IF EXISTS "job_batches" CASCADE');
        DB::statement('DROP TABLE IF EXISTS "failed_jobs" CASCADE');
    }
};
