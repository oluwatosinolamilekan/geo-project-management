# Geo-Project Management App

A full-stack web application for managing geographical projects with interactive map-based tools. Users can define regions, create projects with polygon boundaries, and place pins at specific coordinates.

##  Architecture

- **Backend**: Laravel 12 API with PHP 8.2+
- **Frontend**: Next.js 15 with TypeScript and Tailwind CSS
- **Database**: SQLite (development) / MySQL/PostgreSQL (production)
- **Maps**: MapLibre GL JS with drawing tools

##  Project Structure

```
├── backend/                 # Laravel API
│   ├── app/
│   │   ├── Http/Controllers/Api/
│   │   ├── Models/
│   │   └── Traits/
│   ├── database/
│   ├── routes/
│   └── composer.json
├── frontend/               # Next.js Application
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── lib/
│   │   └── types/
│   └── package.json
├── docs/                   # Documentation
├── scripts/                # Utility scripts
└── README.md
```

##  Quick Start

### Prerequisites
- PHP 8.2+
- Composer
- Node.js 18+
- Git

### Backend Setup
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate

# For SQLite/MySQL (standard approach)
php artisan migrate
php artisan db:seed

# For PostgreSQL (to avoid transaction issues)
php artisan db:execute-sql database/sql/create_tables.sql
php artisan db:seed --force

php artisan serve
```

#### PostgreSQL Migration Note
When using PostgreSQL as your database, you may encounter transaction-related issues during migrations. This is due to PostgreSQL's strict transaction handling, especially with foreign key constraints. The `db:execute-sql` command provides a more reliable approach by executing raw SQL statements directly, avoiding Laravel's transaction wrapping.

For detailed instructions on PostgreSQL setup, see [POSTGRESQL_SETUP.md](POSTGRESQL_SETUP.md)

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Test API
```bash
./test-api.sh
```

##  Development

### Backend (Laravel)
- **Port**: 8000
- **API Base URL**: `http://localhost:8000/api`
- **Database**: SQLite (development)

### Frontend (Next.js)
- **Port**: 3000
- **URL**: ``
- **Features**: Interactive maps, dynamic sidebar, real-time updates


## 🧪 Testing

### Overview

This project includes comprehensive test suites for both backend and frontend:
- **Backend**: 205 tests covering all aspects of the Laravel API

### Backend Testing

#### Test Categories

1. **Unit Tests** (160 tests)
   - Model tests (35 tests)
   - Request validation tests (69 tests)
   - Trait tests (18 tests)
   - Resource tests (9 tests)

2. **Feature Tests** (45 tests)
   - API endpoint tests (53 tests)
   - Integration tests (5 tests)
   - Health check tests (3 tests)

### Test Coverage

#### Models
- **Region Model** (7 tests): Relationships, CRUD operations
- **Project Model** (11 tests): GeoJSON handling, relationships
- **Pin Model** (11 tests): Coordinate precision, relationships

#### API Controllers
- **Region Controller** (16 tests): Full CRUD with validation
- **Project Controller** (17 tests): Nested resources, GeoJSON
- **Pin Controller** (20 tests): Coordinate validation, precision
- **Health Check** (3 tests): System monitoring
- **Integration Tests** (5 tests): End-to-end workflows

#### Request Validation
- **Store Requests**: StoreRegionRequest (15), StoreProjectRequest (18), StorePinRequest (25)
- **Update Requests**: UpdateRegionRequest (7), UpdateProjectRequest (15), UpdatePinRequest (6)

### Key Features Tested

1. **Data Validation**
   - Coordinates: Latitude (-90 to 90), Longitude (-180 to 180)
   - String lengths: Maximum 255 characters for names
   - Required fields with custom error messages
   - GeoJSON array structure validation

2. **API Responses**
   - Success responses (200, 201)
   - Error responses (404, 422, 500)
   - Consistent JSON formatting
   - Nested relationship loading

3. **Data Integrity**
   - 8 decimal place precision for coordinates
   - GeoJSON storage and retrieval
   - Database transaction safety
   - Proper relationship cascading

### Test Quality Metrics

- **205 Total Tests** ✅
- **604 Assertions** ✅
- **100% Pass Rate** ✅
- **0 Failures** ✅
- **0 Errors** ✅

### Test Environment

- **Database**: SQLite in-memory (`:memory:`)
- **PHPUnit**: 11.5.35
- **Fast execution**: < 2 seconds
- **No external dependencies**

## 🚀 Deployment

### Backend (Fly.io)
```bash
cd backend
railway up
```

### Backend with PostgreSQL
When deploying with PostgreSQL, use these commands to set up the database:
```bash
cd backend
# First run the SQL script to create tables
php artisan db:execute-sql database/sql/create_tables.sql
# Then seed the database
php artisan db:seed --force
```

### Frontend (Vercel)
```bash
cd frontend
vercel --prod
```
