# Geo-Project Management App

A full-stack web application for managing geographical projects with interactive map-based tools. Users can define regions, create projects with polygon boundaries, and place pins at specific coordinates.

## 🏗️ Architecture

- **Backend**: Laravel 12 API with PHP 8.2+
- **Frontend**: Next.js 15 with TypeScript and Tailwind CSS
- **Database**: SQLite (development) / MySQL/PostgreSQL (production)
- **Maps**: MapLibre GL JS with drawing tools

## 📁 Project Structure

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

## 🚀 Quick Start

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
php artisan migrate
php artisan serve
```

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

## 🔧 Development

### Backend (Laravel)
- **Port**: 8000
- **API Base URL**: `http://localhost:8000/api`
- **Database**: SQLite (development)

### Frontend (Next.js)
- **Port**: 3000
- **URL**: ``
- **Features**: Interactive maps, dynamic sidebar, real-time updates

## 📚 Documentation

- [API Documentation](./docs/api.md)
- [Deployment Guide](./docs/deployment.md)
- [Database Schema](./docs/database.md)

## 🧪 Testing

### Overview

This project includes comprehensive test suites for both backend and frontend:
- **Backend**: 205 tests covering all aspects of the Laravel API
- **Frontend**: Complete Jest + React Testing Library setup with component, API, and type tests

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

#### Running Backend Tests

```bash
# All backend tests
cd backend && ./vendor/bin/phpunit

# With detailed output
cd backend && ./vendor/bin/phpunit --testdox

# Using custom runner
cd backend && ./run-tests.sh

# Specific test suites
cd backend && ./vendor/bin/phpunit tests/Unit
cd backend && ./vendor/bin/phpunit tests/Feature
```

### Frontend Testing

#### Testing Stack
- **Jest**: JavaScript testing framework
- **React Testing Library**: Testing utilities for React components
- **@testing-library/jest-dom**: Custom Jest matchers for DOM assertions
- **@testing-library/user-event**: User interaction simulation

#### Test Structure
```
frontend/src/
├── components/
│   ├── __tests__/
│   │   ├── CreateProjectForm.test.tsx
│   │   ├── ProjectsList.test.tsx
│   │   ├── RegionsList.test.tsx
│   │   └── ViewProject.test.tsx
│   └── ...
├── lib/
│   ├── __tests__/
│   │   └── api.test.ts
│   └── ...
├── types/
│   ├── __tests__/
│   │   └── index.test.ts
│   └── ...
```

#### Running Frontend Tests

```bash
# Basic commands
cd frontend && npm test                    # Run all tests once
cd frontend && npm run test:watch          # Run in watch mode
cd frontend && npm run test:coverage       # Run with coverage

# Using test runner script
cd frontend && ./run-tests.sh              # Run all tests
cd frontend && ./run-tests.sh --coverage   # Run with coverage
cd frontend && ./run-tests.sh --watch      # Run in watch mode
cd frontend && ./run-tests.sh --verbose    # Run with verbose output
```

#### Frontend Test Categories

1. **Component Tests**: React component rendering, user interactions, props handling
2. **API Client Tests**: HTTP request/response handling, error scenarios, data transformation
3. **Type Definition Tests**: TypeScript interface validation, optional properties

#### Coverage Requirements
- **Lines**: 70% minimum
- **Functions**: 70% minimum
- **Branches**: 70% minimum
- **Statements**: 70% minimum

### Integration Tests

```bash
# API integration tests
./test-api.sh
```

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
fly deploy
```

### Frontend (Vercel)
```bash
cd frontend
vercel --prod
```

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For support, email support@example.com or create an issue in this repository.
