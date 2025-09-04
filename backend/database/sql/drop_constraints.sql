-- Drop unique constraint on regions table if it exists
ALTER TABLE IF EXISTS "regions" DROP CONSTRAINT IF EXISTS "regions_name_unique";
