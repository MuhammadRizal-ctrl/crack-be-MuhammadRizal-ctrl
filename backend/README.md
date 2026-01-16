# Crack FE Backend API

NestJS backend for Crack FE Learning Management System.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Update .env with your configuration

# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Seed database (optional)
npx prisma db seed

# Start development server
npm run start:dev
```

## 📚 API Documentation

Once running, visit:
- **Swagger UI**: http://localhost:3000/api/docs
- **Health Check**: http://localhost:3000/api/v1/health

## 🗄️ Database

This project uses Prisma ORM with PostgreSQL.

### Migrations
```bash
# Create migration
npx prisma migrate dev --name migration_name

# Apply migrations (production)
npx prisma migrate deploy
```

### Seed Database
```bash
npx prisma db seed
```

## 🚀 Deployment

See `DEPLOYMENT_GUIDE.md` for detailed deployment instructions.

### Quick Deploy to Railway

1. Push to GitHub
2. Connect to Railway
3. Add PostgreSQL service
4. Set environment variables
5. Deploy!

## 📝 Environment Variables

See `.env.example` for all required environment variables.

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 📦 Project Structure

```
src/
├── auth/          # Authentication & authorization
├── users/         # User management
├── courses/       # Course management
├── challenges/    # Coding challenges
├── roadmaps/      # Learning roadmaps
├── tutor/         # AI Tutor
├── common/        # Shared utilities
└── main.ts        # Application entry point
```

## 🔐 Security

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting
- CORS enabled
- Input validation

## 📄 License

MIT
