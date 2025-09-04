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
        // Add unique constraint using raw SQL to avoid PostgreSQL transaction issues
        DB::statement('
            ALTER TABLE "regions" ADD CONSTRAINT "regions_name_unique" UNIQUE ("name")
        ');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop unique constraint using raw SQL
        DB::statement('
            ALTER TABLE "regions" DROP CONSTRAINT IF EXISTS "regions_name_unique"
        ');
    }
};
