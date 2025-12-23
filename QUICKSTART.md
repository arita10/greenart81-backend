# GreenArt81 Backend - Quick Start Guide

## Prerequisites
- Node.js (v14 or higher)
- PostgreSQL database (provided via Aiven)
- npm or yarn package manager

## Step 1: Installation

```bash
# Navigate to the project directory
cd greenart81-backend

# Install dependencies
npm install
```

## Step 2: Environment Configuration

The `.env` file is already configured with your PostgreSQL database connection. It includes:
- PostgreSQL connection string (Aiven)
- JWT secret key
- Server port (5000)
- CORS settings

**Important:** The `.env` file is already set up. You don't need to change anything unless you want to modify the JWT secret or port.

## Step 3: Database Setup

### Test Database Connection
```bash
npm run test-connection
```

Expected output: ✅ Connection successful with PostgreSQL version info

### Initialize Database (First Time Only)
```bash
npm run init-db
```

This will:
- Create all necessary tables (users, products, categories, cart, orders, etc.)
- Set up indexes for performance
- Create a default admin account
- Insert sample categories

**Default Admin Credentials:**
- Email: `admin@greenart81.com`
- Password: `admin123`

⚠️ **Change the admin password after first login!**

### Reset Database (Optional)
If you need to start fresh:
```bash
npm run reset-db
npm run init-db
```

## Step 4: Start the Server

### Development Mode (with auto-reload)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:5000`

## Step 5: Test the API

### Quick Health Check
Open your browser or use curl:
```bash
curl http://localhost:5000
```

Expected response:
```json
{
  "success": true,
  "message": "GreenArt81 E-commerce API",
  "version": "1.0.0",
  "endpoints": { ... }
}
```

### Test User Registration
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\",\"password\":\"test123\",\"name\":\"Test User\",\"phone\":\"1234567890\"}"
```

### Test Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\",\"password\":\"test123\"}"
```

Save the token from the response for authenticated requests.

## Step 6: Using the API

Refer to the following documentation files:
- **[README.md](README.md)** - Complete API documentation
- **[API_TESTING.md](API_TESTING.md)** - Detailed testing examples

## Common Commands

| Command | Description |
|---------|-------------|
| `npm start` | Start server in production mode |
| `npm run dev` | Start server with auto-reload |
| `npm run test-connection` | Test database connection |
| `npm run init-db` | Initialize database schema |
| `npm run reset-db` | Drop all tables |

## API Endpoints Overview

### Public Routes (No Authentication)
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product details
- `GET /api/categories` - Get all categories
- `GET /api/search` - Search products

### Authenticated Routes (Customer)
- `GET /api/auth/me` - Get user profile
- `PUT /api/auth/profile` - Update profile
- `GET /api/cart` - Get cart
- `POST /api/cart` - Add to cart
- `GET /api/orders/my-orders` - Get orders
- `POST /api/orders` - Create order
- `GET /api/wishlist` - Get wishlist

### Admin Routes (Admin Only)
- `GET /api/admin/products` - Manage products
- `GET /api/admin/orders` - Manage orders
- `GET /api/admin/users` - Manage users
- `GET /api/admin/categories` - Manage categories
- `GET /api/admin/dashboard/stats` - Dashboard statistics
- `GET /api/admin/reviews` - Manage reviews

## Database Schema

The database includes these tables:
- **users** - User accounts (customers and admins)
- **categories** - Product categories
- **products** - Product catalog
- **cart** - Shopping cart items
- **orders** - Customer orders
- **order_items** - Order line items
- **wishlist** - User wishlists
- **reviews** - Product reviews
- **notifications** - User notifications

## Project Structure

```
greenart81-backend/
├── config/
│   ├── database.js       # PostgreSQL connection
│   └── db-init.sql       # Database schema
├── controllers/          # Request handlers
├── middleware/           # Auth middleware
├── routes/              # API routes
├── scripts/             # Utility scripts
├── utils/               # Helper functions
├── .env                 # Environment variables
├── server.js           # Main server file
└── package.json        # Dependencies
```

## Troubleshooting

### Database Connection Issues
- Verify `.env` has correct DB_CONNECTION_STRING
- Check internet connectivity
- Run `npm run test-connection`

### Server Won't Start
- Check if port 5000 is available
- Verify all dependencies are installed (`npm install`)
- Check for error messages in console

### Authentication Errors
- Ensure token is included in Authorization header: `Bearer <token>`
- Token format: `Authorization: Bearer eyJhbGc...`
- Check token hasn't expired (default: 7 days)

## Next Steps

1. ✅ Change default admin password
2. ✅ Create product categories via admin API
3. ✅ Add products to your catalog
4. ✅ Test customer workflows (register, browse, cart, order)
5. ✅ Connect to your frontend application

## Support

For detailed API documentation and examples, see:
- [README.md](README.md)
- [API_TESTING.md](API_TESTING.md)

---

**Your backend is now ready to use!** 🎉
