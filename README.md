# GreenArt81 E-commerce Backend API

A comprehensive RESTful API backend for GreenArt81 e-commerce website built with Node.js, Express, and PostgreSQL.

## Features

- User authentication and authorization (JWT)
- Product management with categories
- Shopping cart functionality
- Order management system
- Wishlist feature
- Product reviews and ratings
- Admin dashboard with analytics
- Search and filtering
- Role-based access control (Customer/Admin)

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **PostgreSQL** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing

## Project Structure

```
greenart81-backend/
├── config/
│   ├── database.js          # PostgreSQL connection
│   └── db-init.sql          # Database schema
├── controllers/
│   ├── authController.js
│   ├── productController.js
│   ├── cartController.js
│   ├── orderController.js
│   ├── wishlistController.js
│   ├── reviewController.js
│   ├── categoryController.js
│   ├── adminProductController.js
│   ├── adminOrderController.js
│   ├── adminUserController.js
│   ├── adminCategoryController.js
│   ├── adminDashboardController.js
│   └── adminReviewController.js
├── middleware/
│   └── auth.js              # Authentication middleware
├── routes/
│   ├── authRoutes.js
│   ├── productRoutes.js
│   ├── categoryRoutes.js
│   ├── cartRoutes.js
│   ├── orderRoutes.js
│   ├── wishlistRoutes.js
│   ├── reviewRoutes.js
│   ├── adminRoutes.js
│   └── searchRoutes.js
├── utils/
│   └── response.js          # Response helpers
├── .env                     # Environment variables
├── .env.example             # Environment variables template
├── .gitignore
├── package.json
├── server.js                # Main server file
└── README.md
```

## Installation

1. **Clone the repository**
```bash
cd greenart81-backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
Copy `.env.example` to `.env` and update with your PostgreSQL credentials:
```bash
cp .env.example .env
```

Edit `.env`:
```env
PORT=5000
NODE_ENV=development
DB_CONNECTION_STRING=your_postgresql_connection_string
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:3000
```

4. **Initialize the database**
Run the SQL script in `config/db-init.sql` to create tables:
```bash
psql -d your_database -f config/db-init.sql
```

Or connect to your PostgreSQL database and run the SQL commands manually.

5. **Start the server**

Development mode with auto-reload:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication Routes
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| POST | `/api/auth/logout` | Logout user | No |
| GET | `/api/auth/me` | Get current user profile | Yes |
| PUT | `/api/auth/profile` | Update user profile | Yes |
| PUT | `/api/auth/password` | Change password | Yes |

### Product Routes (Customer)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/products` | Get all active products | No |
| GET | `/api/products/:id` | Get single product | No |
| GET | `/api/products/category/:category` | Get products by category | No |
| GET | `/api/products/featured` | Get featured products | No |

### Category Routes
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/categories` | Get all categories | No |

### Cart Routes
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/cart` | Get user's cart | Yes |
| POST | `/api/cart` | Add item to cart | Yes |
| PUT | `/api/cart/:itemId` | Update cart item quantity | Yes |
| DELETE | `/api/cart/:itemId` | Remove item from cart | Yes |
| DELETE | `/api/cart` | Clear entire cart | Yes |

### Order Routes
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/orders/my-orders` | Get customer's orders | Yes |
| GET | `/api/orders/:id` | Get single order details | Yes |
| POST | `/api/orders` | Create new order | Yes |
| PUT | `/api/orders/:id/cancel` | Cancel order | Yes |

### Wishlist Routes
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/wishlist` | Get user's wishlist | Yes |
| POST | `/api/wishlist` | Add product to wishlist | Yes |
| DELETE | `/api/wishlist/:productId` | Remove from wishlist | Yes |

### Review Routes
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/reviews/:id/reviews` | Get product reviews | No |
| POST | `/api/reviews/:id/reviews` | Add review | Yes |
| PUT | `/api/reviews/:id` | Update review | Yes |
| DELETE | `/api/reviews/:id` | Delete review | Yes |

### Search Routes
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/search` | Global search | No |

### Admin Routes (Requires Admin Role)

#### Product Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/products` | Get all products |
| POST | `/api/admin/products` | Create new product |
| PUT | `/api/admin/products/:id` | Update product |
| DELETE | `/api/admin/products/:id` | Delete product |
| PUT | `/api/admin/products/:id/stock` | Update stock |
| PUT | `/api/admin/products/:id/toggle` | Toggle active status |
| POST | `/api/admin/products/bulk-upload` | Bulk upload products |

#### Order Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/orders` | Get all orders |
| GET | `/api/admin/orders/:id` | Get order details |
| PUT | `/api/admin/orders/:id/status` | Update order status |
| DELETE | `/api/admin/orders/:id` | Delete order |

#### User Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/users` | Get all users |
| GET | `/api/admin/users/:id` | Get user details |
| PUT | `/api/admin/users/:id/role` | Update user role |
| PUT | `/api/admin/users/:id/status` | Block/unblock user |
| DELETE | `/api/admin/users/:id` | Delete user |

#### Category Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/categories` | Get all categories |
| POST | `/api/admin/categories` | Create category |
| PUT | `/api/admin/categories/:id` | Update category |
| DELETE | `/api/admin/categories/:id` | Delete category |

#### Dashboard & Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/dashboard/stats` | Get overall statistics |
| GET | `/api/admin/dashboard/sales` | Get sales data |
| GET | `/api/admin/dashboard/top-products` | Get best-selling products |
| GET | `/api/admin/dashboard/recent-orders` | Get recent orders |
| GET | `/api/admin/dashboard/low-stock` | Get low stock products |

#### Review Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/reviews` | Get all reviews |
| PUT | `/api/admin/reviews/:id/approve` | Approve review |
| PUT | `/api/admin/reviews/:id/reject` | Reject review |
| DELETE | `/api/admin/reviews/:id` | Delete review |

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message here",
  "code": "ERROR_CODE"
}
```

### Paginated Response
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. After logging in, include the token in the Authorization header:

```
Authorization: Bearer <your_token_here>
```

## Database Schema

The database includes the following tables:
- `users` - User accounts
- `categories` - Product categories
- `products` - Product catalog
- `cart` - Shopping cart items
- `orders` - Customer orders
- `order_items` - Order line items
- `wishlist` - User wishlists
- `reviews` - Product reviews
- `notifications` - User notifications

## Default Admin Account

Email: `admin@greenart81.com`
Password: `admin123`

**Important:** Change the default admin password after first login!

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 5000 |
| NODE_ENV | Environment (development/production) | development |
| DB_CONNECTION_STRING | PostgreSQL connection string | - |
| JWT_SECRET | Secret key for JWT | - |
| JWT_EXPIRE | Token expiration time | 7d |
| CORS_ORIGIN | Allowed CORS origin | * |

## Security Features

- Password hashing with bcryptjs
- JWT token authentication
- Role-based access control
- SQL injection prevention with parameterized queries
- CORS protection
- Input validation

## Error Codes

| Code | Description |
|------|-------------|
| NO_TOKEN | No authentication token provided |
| INVALID_TOKEN | Invalid or expired token |
| ADMIN_REQUIRED | Admin privileges required |
| MISSING_FIELDS | Required fields missing |
| EMAIL_EXISTS | Email already registered |
| INVALID_CREDENTIALS | Invalid email or password |
| PRODUCT_NOT_FOUND | Product not found |
| INSUFFICIENT_STOCK | Not enough stock |
| ORDER_NOT_FOUND | Order not found |
| SERVER_ERROR | Internal server error |

## Testing the API

You can test the API using tools like:
- **Postman** - Import the endpoints and test
- **cURL** - Command-line testing
- **Thunder Client** - VS Code extension

### Example Request (Register User)
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "name": "John Doe",
    "phone": "1234567890"
  }'
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

ISC

## Support

For issues and questions, please create an issue in the repository.
