# Database Seeders

This directory contains database seeders for populating the application with sample data.

## Available Seeders

### Individual Seeders
- `RegionSeeder.php` - Seeds 5 regions (North America, Europe, Asia Pacific, Africa, South America)
- `ProjectSeeder.php` - Seeds 8 projects with GeoJSON polygon data
- `PinSeeder.php` - Seeds 24 pins with coordinates within project areas

### Combined Seeder
- `CompleteSeeder.php` - All-in-one seeder that creates regions, projects, and pins in the correct order

## Usage

### Option 1: Use the main DatabaseSeeder (recommended)
The main `DatabaseSeeder.php` has been updated to call all individual seeders in the correct order:

```bash
php artisan db:seed
```

### Option 2: Use the CompleteSeeder
If you prefer to use the all-in-one seeder:

```bash
php artisan db:seed --class=CompleteSeeder
```

### Option 3: Run individual seeders
You can run individual seeders if needed:

```bash
php artisan db:seed --class=RegionSeeder
php artisan db:seed --class=ProjectSeeder
php artisan db:seed --class=PinSeeder
```

## Data Structure

### Regions
- 5 regions covering major continents
- Simple structure with just name and timestamps

### Projects
- 8 projects distributed across regions
- Each project has:
  - `region_id` - Foreign key to regions
  - `name` - Project name
  - `geo_json` - GeoJSON polygon data representing project boundaries

### Pins
- 24 pins (3 per project)
- Each pin has:
  - `project_id` - Foreign key to projects
  - `latitude` - Decimal coordinate
  - `longitude` - Decimal coordinate

## Sample Data

### Regions
1. North America
2. Europe
3. Asia Pacific
4. Africa
5. South America

### Projects by Region
- **North America**: New York City Development, Los Angeles Infrastructure
- **Europe**: London Urban Planning, Paris Metro Expansion
- **Asia Pacific**: Tokyo Smart City, Singapore Marina Bay
- **Africa**: Cape Town Waterfront
- **South America**: São Paulo Metro

### GeoJSON Structure
Each project includes a GeoJSON polygon with coordinates that represent the project's geographic boundary. The structure follows the standard GeoJSON format:

```json
{
  "type": "Polygon",
  "coordinates": [[
    [longitude1, latitude1],
    [longitude2, latitude2],
    [longitude3, latitude3],
    [longitude4, latitude4],
    [longitude1, latitude1]  // Closing the polygon
  ]]
}
```

## Notes

- The seeders use `insert()` for better performance with large datasets
- The `CompleteSeeder` includes `truncate()` to clear existing data before seeding
- All coordinates are realistic and correspond to actual city locations
- The GeoJSON polygons are simplified rectangles around major city areas
