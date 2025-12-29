# AuctionHub - Online Auction Platform

A modern, full-stack auction platform built with Next.js, NestJS, and TypeScript in a monorepo structure.

## 🏗️ Architecture

This project uses a monorepo structure with workspaces:

- **`apps/web`** - User-facing Next.js application (Port 3001)
- **`apps/admin`** - Admin panel Next.js application (Port 3002)
- **`apps/api`** - NestJS backend API (Port 3000)
- **`packages/types`** - Shared TypeScript types
- **`packages/ui`** - Shared React components

## ✨ Features

### Completed Features

- ✅ **Authentication System**: JWT-based auth with login/register
- ✅ **User Management**: User roles (user, admin, moderator)
- ✅ **Auction Management**: Create, view, update, and delete auctions
- ✅ **Bidding System**: Place bids with validation and tracking
- ✅ **Database Integration**: SQLite with TypeORM entities
- ✅ **Responsive UI**: Modern design with Tailwind CSS
- ✅ **Shared Components**: Reusable UI component library
- ✅ **API Integration**: Axios-based API client with interceptors

### Upcoming Features

- 🔄 **Admin Panel**: Complete management interface
- 🔄 **Real-time Bidding**: WebSocket integration for live updates
- 🔄 **Payment Integration**: Secure payment processing
- 🔄 **Email Notifications**: Auction updates and alerts
- 🔄 **Advanced Search**: Filtering and categorization

## 🛠️ Tech Stack

### Frontend

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Axios** - HTTP client for API calls

### Backend

- **NestJS** - Node.js framework with decorators
- **TypeORM** - Database ORM with entity relationships
- **SQLite** - Development database (easily replaceable)
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing

### Development Tools

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **npm workspaces** - Monorepo management

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm 8+

### Installation

1. **Clone and install dependencies:**

   ```bash
   git clone <your-repo>
   cd auction-platform
   npm install
   ```

2. **Install workspace dependencies:**

   ```bash
   npm run install:all
   ```

3. **Build shared packages:**
   ```bash
   cd packages/types && npm run build
   cd ../ui && npm run build
   cd ../..
   ```

### Running the Applications

**Option 1: Run all applications separately**

```bash
# Terminal 1 - API Backend
cd apps/api
npm run start:dev

# Terminal 2 - Web Frontend
cd apps/web
npm run dev

# Terminal 3 - Admin Panel
cd apps/admin
npm run dev
```

**Option 2: Run from root (coming soon)**

```bash
npm run dev  # Will start all apps concurrently
```

### Access the Applications

- **Web App**: http://localhost:3001
- **Admin Panel**: http://localhost:3002
- **API**: http://localhost:3000
- **API Docs**: http://localhost:3000/api (Swagger - coming soon)

## 🗄️ Database Schema

The application uses the following main entities:

- **Users**: Authentication and profile data
- **Auctions**: Listing details, pricing, and timing
- **Bids**: Bidding history and current winning bids
- **Categories**: Auction categorization system

Database migrations and seeding will be added in future updates.

## 🔧 Development

### Adding New Features

1. **Shared Types**: Add to `packages/types/src/index.ts`
2. **UI Components**: Add to `packages/ui/src/`
3. **API Endpoints**: Add controllers/services to `apps/api/src/`
4. **Frontend Pages**: Add to `apps/web/src/app/` or `apps/admin/src/app/`

### Code Quality

```bash
# Linting
npm run lint --workspaces

# Type checking
npm run build --workspaces

# Testing (coming soon)
npm run test --workspaces
```

## 🔐 Environment Variables

Create `.env` files in each app directory:

**`apps/api/.env`**

```
DATABASE_URL="file:./auction-platform.db"
JWT_SECRET="your-secret-key-here"
PORT=3000
```

**`apps/web/.env.local`**

```
NEXT_PUBLIC_API_URL="http://localhost:3000/api"
```

## 📝 API Documentation

### Authentication Endpoints

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Auction Endpoints

- `GET /api/auctions` - List auctions (with pagination)
- `GET /api/auctions/:id` - Get auction details
- `POST /api/auctions` - Create auction (auth required)
- `PUT /api/auctions/:id` - Update auction (auth required)
- `DELETE /api/auctions/:id` - Delete auction (auth required)

### Bidding Endpoints

- `POST /api/bids` - Place bid (auth required)
- `GET /api/bids/auction/:id` - Get auction bids
- `GET /api/bids/my-bids` - Get user's bids (auth required)

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Add tests (when test suite is available)
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

---

**AuctionHub** - Built with ❤️ using modern web technologies
