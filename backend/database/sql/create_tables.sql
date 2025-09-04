-- Create users table
CREATE TABLE IF NOT EXISTS "users" (
    "id" BIGSERIAL PRIMARY KEY,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "email_verified_at" TIMESTAMP NULL,
    "password" VARCHAR(255) NOT NULL,
    "remember_token" VARCHAR(100) NULL,
    "created_at" TIMESTAMP NULL,
    "updated_at" TIMESTAMP NULL
);

-- Create regions table
CREATE TABLE IF NOT EXISTS "regions" (
    "id" BIGSERIAL PRIMARY KEY,
    "name" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP NULL,
    "updated_at" TIMESTAMP NULL
);


-- Create projects table
CREATE TABLE IF NOT EXISTS "projects" (
    "id" BIGSERIAL PRIMARY KEY,
    "region_id" BIGINT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "geo_json" JSONB NOT NULL,
    "created_at" TIMESTAMP NULL,
    "updated_at" TIMESTAMP NULL,
    FOREIGN KEY ("region_id") REFERENCES "regions" ("id") ON DELETE CASCADE
);

-- Create pins table
CREATE TABLE IF NOT EXISTS "pins" (
    "id" BIGSERIAL PRIMARY KEY,
    "project_id" BIGINT NOT NULL,
    "latitude" DECIMAL(10, 8) NOT NULL,
    "longitude" DECIMAL(11, 8) NOT NULL,
    "created_at" TIMESTAMP NULL,
    "updated_at" TIMESTAMP NULL,
    FOREIGN KEY ("project_id") REFERENCES "projects" ("id") ON DELETE CASCADE
);

-- Create migrations table if it doesn't exist
CREATE TABLE IF NOT EXISTS "migrations" (
    "id" BIGSERIAL PRIMARY KEY,
    "migration" VARCHAR(255) NOT NULL,
    "batch" INTEGER NOT NULL
);

-- Insert migration records
INSERT INTO "migrations" ("migration", "batch") VALUES
('0001_01_01_000000_create_users_table', 1),
('2025_08_28_140523_create_regions_table', 1),
('2025_08_28_140613_create_projects_table', 1),
('2025_08_28_140618_create_pins_table', 1),
('2025_09_01_230234_add_unique_constraint_to_regions_name', 1),
('2025_09_01_230514_clean_duplicate_regions', 1),
('2025_09_04_163501_drop_unique_constraint_from_regions_table', 1);
