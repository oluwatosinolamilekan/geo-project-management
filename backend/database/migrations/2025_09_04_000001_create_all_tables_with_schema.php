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
        // Disable foreign key checks for PostgreSQL
        DB::statement('SET CONSTRAINTS ALL DEFERRED');

        // Create users table
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->rememberToken();
            $table->timestamps();
        });

        // Create regions table
        Schema::create('regions', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->timestamps();
        });

        // Add unique constraint to regions name
        Schema::table('regions', function (Blueprint $table) {
            $table->unique('name', 'regions_name_unique');
        });

        // Create projects table
        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->bigInteger('region_id')->unsigned();
            $table->string('name');
            $table->jsonb('geo_json');
            $table->timestamps();
        });

        // Create pins table
        Schema::create('pins', function (Blueprint $table) {
            $table->id();
            $table->bigInteger('project_id')->unsigned();
            $table->decimal('latitude', 10, 8);
            $table->decimal('longitude', 11, 8);
            $table->timestamps();
        });

        // Add foreign key constraints separately
        Schema::table('projects', function (Blueprint $table) {
            $table->foreign('region_id')
                  ->references('id')
                  ->on('regions')
                  ->onDelete('cascade');
        });

        Schema::table('pins', function (Blueprint $table) {
            $table->foreign('project_id')
                  ->references('id')
                  ->on('projects')
                  ->onDelete('cascade');
        });

        // Re-enable foreign key checks
        DB::statement('SET CONSTRAINTS ALL IMMEDIATE');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pins');
        Schema::dropIfExists('projects');
        Schema::dropIfExists('regions');
        Schema::dropIfExists('users');
    }
};
