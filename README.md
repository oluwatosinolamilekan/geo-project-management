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
- **URL**: `http://localhost:3000`
- **Features**: Interactive maps, dynamic sidebar, real-time updates

## 📚 Documentation

- [API Documentation](./docs/api.md)
- [Deployment Guide](./docs/deployment.md)
- [Database Schema](./docs/database.md)

## 🧪 Testing

```bash
# Backend tests
cd backend && php artisan test

# Frontend tests
cd frontend && npm test

# API integration tests
./test-api.sh
```

## 🚀 Deployment

This application is configured to deploy to **Fly.io** for both backend and frontend.

### Quick Deploy
```bash
# Setup Fly.io environment
./setup-flyio.sh

# Deploy both backend and frontend
./deploy.sh
```

### Manual Deployment

#### Backend (Laravel on Fly.io)
```bash
cd backend
flyctl apps create sqd-backend --org personal
flyctl postgres create --name sqd-backend-db --org personal
flyctl postgres attach --app sqd-backend sqd-backend-db
flyctl deploy --app sqd-backend
```

#### Frontend (Next.js on Fly.io)
```bash
cd frontend
flyctl apps create sqd-frontend --org personal
flyctl secrets set NEXT_PUBLIC_API_URL=https://sqd-backend.fly.dev --app sqd-frontend
flyctl deploy --app sqd-frontend
```

### Environment URLs
- **Backend**: https://sqd-backend.fly.dev
- **Frontend**: https://sqd-frontend.fly.dev

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)

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
