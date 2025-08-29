# SQD API - Postman Collection Setup Guide

## 🚀 Quick Start

### 1. Import the Collection
1. Open Postman
2. Click **Import** button
3. Select the `SQD_API_Collection.postman_collection.json` file
4. The collection will be imported with all endpoints organized by category

### 2. Configure Environment Variables
1. In Postman, click on the **Environments** tab
2. Create a new environment called "SQD Local"
3. Add the following variable:
   - **Variable Name**: `base_url`
   - **Initial Value**: `http://localhost:8000`
   - **Current Value**: `http://localhost:8000`

### 3. Select Environment
1. In the top-right corner of Postman, select "SQD Local" from the environment dropdown
2. All requests will now use the configured base URL

## 📋 API Endpoints Overview

### Regions
- `GET /api/regions` - Get all regions
- `GET /api/regions/{id}` - Get specific region
- `POST /api/regions` - Create new region
- `PUT /api/regions/{id}` - Update region
- `DELETE /api/regions/{id}` - Delete region

### Projects
- `GET /api/regions/{regionId}/projects` - Get all projects in region
- `GET /api/projects/{id}` - Get specific project
- `POST /api/regions/{regionId}/projects` - Create new project
- `PUT /api/projects/{id}` - Update project
- `DELETE /api/projects/{id}` - Delete project

### Pins
- `GET /api/projects/{projectId}/pins` - Get all pins in project
- `GET /api/pins/{id}` - Get specific pin
- `POST /api/projects/{projectId}/pins` - Create new pin
- `PUT /api/pins/{id}` - Update pin
- `DELETE /api/pins/{id}` - Delete pin

## 🧪 Testing Workflow

### Step 1: Create Test Data
1. **Create a Region**
   - Use "Create Region" request
   - Sample data is pre-filled
   - Note the returned region ID

2. **Create a Project**
   - Use "Create Project" request
   - Replace `{regionId}` in URL with the region ID from step 1
   - Note the returned project ID

3. **Create a Pin**
   - Use "Create Pin" request
   - Replace `{projectId}` in URL with the project ID from step 2

### Step 2: Test CRUD Operations
1. **Read Operations**
   - Test "Get All Regions" to see your created region
   - Test "Get Single Region" with the region ID
   - Test "Get All Projects in Region" with the region ID

2. **Update Operations**
   - Use "Update Region" with modified data
   - Use "Update Project" with modified data
   - Use "Update Pin" with modified data

3. **Delete Operations**
   - Test "Delete Pin" first (child record)
   - Test "Delete Project" (will cascade delete pins)
   - Test "Delete Region" (will cascade delete projects and pins)

### Step 3: Error Testing
1. **404 Errors**
   - Use "Test 404 - Region Not Found" with ID 999999
   - Use "Test 404 - Project Not Found" with ID 999999
   - Use "Test 404 - Pin Not Found" with ID 999999

2. **Validation Errors**
   - Use "Test 422 - Validation Error" with empty data

## 📝 Sample Request Bodies

### Create Region
```json
{
    "name": "North America",
    "description": "North American region including USA and Canada",
    "coordinates": {
        "lat": 45.0,
        "lng": -100.0
    }
}
```

### Create Project
```json
{
    "name": "Urban Development Project",
    "description": "A comprehensive urban development project in downtown area",
    "status": "active",
    "start_date": "2024-01-15",
    "end_date": "2024-12-31",
    "budget": 5000000,
    "coordinates": {
        "lat": 40.7128,
        "lng": -74.0060
    }
}
```

### Create Pin
```json
{
    "title": "Construction Site A",
    "description": "Main construction site for building foundation",
    "type": "construction",
    "status": "active",
    "coordinates": {
        "lat": 40.7128,
        "lng": -74.0060
    },
    "metadata": {
        "phase": "foundation",
        "priority": "high",
        "assigned_to": "John Doe"
    }
}
```

## 🔧 Troubleshooting

### Common Issues

1. **Connection Refused**
   - Ensure Laravel server is running: `php artisan serve`
   - Check if port 8000 is available

2. **404 Not Found**
   - Verify API routes are registered in `routes/api.php`
   - Check if the resource ID exists in the database

3. **422 Validation Error**
   - Check request body format
   - Ensure all required fields are provided
   - Verify data types match validation rules

4. **500 Server Error**
   - Check Laravel logs in `storage/logs/laravel.log`
   - Ensure database is properly configured
   - Verify all migrations have been run

### Database Setup
```bash
# Run migrations
php artisan migrate

# Seed with sample data (if available)
php artisan db:seed
```

## 🎯 Expected Responses

### Success Responses
- **200 OK**: GET, PUT operations
- **201 Created**: POST operations
- **204 No Content**: DELETE operations

### Error Responses
- **404 Not Found**: Resource doesn't exist
- **422 Unprocessable Entity**: Validation errors
- **500 Internal Server Error**: Server errors

All error responses follow this format:
```json
{
    "error": "Error message description"
}
```

## 📚 Additional Resources

- Laravel Documentation: https://laravel.com/docs
- Postman Documentation: https://learning.postman.com/
- API Testing Best Practices: https://www.postman.com/use-cases/api-testing/

## 🤝 Support

If you encounter any issues:
1. Check the Laravel logs
2. Verify your environment configuration
3. Ensure all dependencies are installed
4. Test with the provided sample data first

Happy testing! 🚀
