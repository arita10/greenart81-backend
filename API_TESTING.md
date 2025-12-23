# API Testing Guide for GreenArt81 Backend

## Base URL
```
http://localhost:5000
```

## Testing the API

### 1. Test Server Health
```bash
curl http://localhost:5000
```

Expected Response:
```json
{
  "success": true,
  "message": "GreenArt81 E-commerce API",
  "version": "1.0.0",
  "endpoints": {
    "auth": "/api/auth",
    "products": "/api/products",
    "categories": "/api/categories",
    "cart": "/api/cart",
    "orders": "/api/orders",
    "wishlist": "/api/wishlist",
    "reviews": "/api/reviews",
    "admin": "/api/admin",
    "search": "/api/search"
  }
}
```

---

## Authentication Routes

### 1. Register New User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"customer@test.com\",\"password\":\"test123\",\"name\":\"Test Customer\",\"phone\":\"1234567890\"}"
```

### 2. Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"customer@test.com\",\"password\":\"test123\"}"
```

Save the token from the response for authenticated requests.

### 3. Login as Admin
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@greenart81.com\",\"password\":\"admin123\"}"
```

### 4. Get Current User Profile
```bash
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 5. Update Profile
```bash
curl -X PUT http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Updated Name\",\"phone\":\"9876543210\",\"address\":\"123 Test Street\"}"
```

### 6. Change Password
```bash
curl -X PUT http://localhost:5000/api/auth/password \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d "{\"oldPassword\":\"test123\",\"newPassword\":\"newtest123\"}"
```

---

## Category Routes

### 1. Get All Categories
```bash
curl http://localhost:5000/api/categories
```

---

## Product Routes (Customer)

### 1. Get All Products
```bash
curl "http://localhost:5000/api/products"
```

With pagination and filters:
```bash
curl "http://localhost:5000/api/products?page=1&limit=10&category=Plants&search=indoor"
```

### 2. Get Single Product
```bash
curl http://localhost:5000/api/products/1
```

### 3. Get Products by Category
```bash
curl http://localhost:5000/api/products/category/Plants
```

### 4. Get Featured Products
```bash
curl http://localhost:5000/api/products/featured
```

### 5. Search Products
```bash
curl "http://localhost:5000/api/search?q=plant&min_price=10&max_price=100&sort=price_asc"
```

---

## Admin Routes

**Note:** All admin routes require an admin token in the Authorization header.

### Product Management

#### 1. Create Product
```bash
curl -X POST http://localhost:5000/api/admin/products \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Peace Lily\",\"description\":\"Beautiful indoor plant\",\"price\":29.99,\"stock\":50,\"category_id\":1,\"image_url\":\"https://example.com/peace-lily.jpg\",\"is_featured\":true}"
```

#### 2. Update Product
```bash
curl -X PUT http://localhost:5000/api/admin/products/1 \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d "{\"price\":34.99,\"stock\":75}"
```

#### 3. Update Stock
```bash
curl -X PUT http://localhost:5000/api/admin/products/1/stock \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d "{\"stock\":100}"
```

#### 4. Toggle Product Active Status
```bash
curl -X PUT http://localhost:5000/api/admin/products/1/toggle \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE"
```

#### 5. Delete Product (Soft Delete)
```bash
curl -X DELETE http://localhost:5000/api/admin/products/1 \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE"
```

#### 6. Bulk Upload Products
```bash
curl -X POST http://localhost:5000/api/admin/products/bulk-upload \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d "{\"products\":[{\"name\":\"Rose Plant\",\"price\":15.99,\"stock\":20,\"category_id\":1},{\"name\":\"Sunflower Seeds\",\"price\":5.99,\"stock\":100,\"category_id\":2}]}"
```

### Category Management

#### 1. Create Category
```bash
curl -X POST http://localhost:5000/api/admin/categories \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Succulents\",\"description\":\"Low maintenance plants\",\"image_url\":\"https://example.com/succulents.jpg\"}"
```

#### 2. Update Category
```bash
curl -X PUT http://localhost:5000/api/admin/categories/1 \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d "{\"description\":\"Updated description\"}"
```

#### 3. Delete Category
```bash
curl -X DELETE http://localhost:5000/api/admin/categories/1 \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE"
```

### Dashboard & Analytics

#### 1. Get Overall Statistics
```bash
curl http://localhost:5000/api/admin/dashboard/stats \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE"
```

#### 2. Get Sales Data
```bash
curl "http://localhost:5000/api/admin/dashboard/sales?date_from=2025-01-01&date_to=2025-12-31" \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE"
```

#### 3. Get Top Products
```bash
curl "http://localhost:5000/api/admin/dashboard/top-products?limit=10" \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE"
```

#### 4. Get Recent Orders
```bash
curl "http://localhost:5000/api/admin/dashboard/recent-orders?limit=10" \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE"
```

#### 5. Get Low Stock Products
```bash
curl "http://localhost:5000/api/admin/dashboard/low-stock?threshold=10" \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE"
```

### User Management

#### 1. Get All Users
```bash
curl "http://localhost:5000/api/admin/users?page=1&role=customer" \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE"
```

#### 2. Update User Role
```bash
curl -X PUT http://localhost:5000/api/admin/users/2/role \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d "{\"role\":\"admin\"}"
```

#### 3. Block/Unblock User
```bash
curl -X PUT http://localhost:5000/api/admin/users/2/status \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d "{\"is_active\":false}"
```

### Order Management

#### 1. Get All Orders
```bash
curl "http://localhost:5000/api/admin/orders?status=pending&page=1" \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE"
```

#### 2. Update Order Status
```bash
curl -X PUT http://localhost:5000/api/admin/orders/1/status \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d "{\"status\":\"shipped\"}"
```

---

## Cart Routes (Authenticated)

### 1. Get Cart
```bash
curl http://localhost:5000/api/cart \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 2. Add to Cart
```bash
curl -X POST http://localhost:5000/api/cart \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d "{\"product_id\":1,\"quantity\":2}"
```

### 3. Update Cart Item
```bash
curl -X PUT http://localhost:5000/api/cart/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d "{\"quantity\":3}"
```

### 4. Remove Cart Item
```bash
curl -X DELETE http://localhost:5000/api/cart/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 5. Clear Cart
```bash
curl -X DELETE http://localhost:5000/api/cart \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Order Routes (Authenticated)

### 1. Get My Orders
```bash
curl "http://localhost:5000/api/orders/my-orders?page=1&status=pending" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 2. Get Order Details
```bash
curl http://localhost:5000/api/orders/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 3. Create Order
```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d "{\"items\":[{\"product_id\":1,\"quantity\":2,\"price\":29.99}],\"shipping_address\":\"123 Test St, City, Country\",\"payment_method\":\"credit_card\",\"total_amount\":59.98}"
```

### 4. Cancel Order
```bash
curl -X PUT http://localhost:5000/api/orders/1/cancel \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Wishlist Routes (Authenticated)

### 1. Get Wishlist
```bash
curl http://localhost:5000/api/wishlist \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 2. Add to Wishlist
```bash
curl -X POST http://localhost:5000/api/wishlist \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d "{\"product_id\":1}"
```

### 3. Remove from Wishlist
```bash
curl -X DELETE http://localhost:5000/api/wishlist/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Review Routes

### 1. Get Product Reviews
```bash
curl "http://localhost:5000/api/reviews/1/reviews?page=1&limit=10"
```

### 2. Add Review (Authenticated)
```bash
curl -X POST http://localhost:5000/api/reviews/1/reviews \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d "{\"rating\":5,\"comment\":\"Great product!\"}"
```

### 3. Update Review (Authenticated)
```bash
curl -X PUT http://localhost:5000/api/reviews/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d "{\"rating\":4,\"comment\":\"Updated review\"}"
```

### 4. Delete Review (Authenticated)
```bash
curl -X DELETE http://localhost:5000/api/reviews/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Using Postman

1. Import the following as environment variables:
   - `base_url`: `http://localhost:5000`
   - `token`: (save after login)
   - `admin_token`: (save after admin login)

2. Use `{{base_url}}` in your requests
3. Set Authorization header to `Bearer {{token}}` or `Bearer {{admin_token}}`

---

## Quick Test Workflow

1. **Register a new user**
2. **Login to get token**
3. **Create products as admin**
4. **Browse products**
5. **Add products to cart**
6. **Create an order**
7. **Leave a review**
8. **Check admin dashboard**

---

## Common Response Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (no token or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Server Error
