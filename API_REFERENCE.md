# API Reference Guide - GreenArt81 Backend

**Base URL:** `https://greenart81-backend.onrender.com/api`

---

## 🔐 **AUTHENTICATION ROUTES**

### **Register User**
```http
POST /api/auth/register
```
**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "phone": "1234567890"
}
```
**Response:** User object + JWT token

---

### **Login**
```http
POST /api/auth/login
```
**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```
**Response:** User object + JWT token

---

### **Logout**
```http
POST /api/auth/logout
```
**Auth:** Not required
**Response:** Success message

---

### **Get Current User**
```http
GET /api/auth/me
```
**Auth:** Required (Bearer token)
**Response:** User profile

---

### **Update Profile**
```http
PUT /api/auth/profile
```
**Auth:** Required
**Body:**
```json
{
  "name": "Updated Name",
  "phone": "9876543210",
  "address": "123 Street, City"
}
```
**Response:** Updated user object

---

### **Change Password**
```http
PUT /api/auth/password
```
**Auth:** Required
**Body:**
```json
{
  "oldPassword": "old123",
  "newPassword": "new123"
}
```
**Response:** Success message

---

## 🛍️ **PRODUCT ROUTES (Public)**

### **Get All Products**
```http
GET /api/products?page=1&limit=20&category=&search=
```
**Query Params:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `category`: Filter by category name
- `search`: Search keyword

**Response:** Paginated products array

---

### **Get Single Product**
```http
GET /api/products/:id
```
**Response:** Product details with avg_rating and review_count

---

### **Get Products by Category**
```http
GET /api/products/category/:category
```
**Response:** Paginated products in category

---

### **Get Featured Products**
```http
GET /api/products/featured?limit=10
```
**Response:** Featured products array

---

### **Search Products**
```http
GET /api/search?q=plant&min_price=10&max_price=100&sort=price_asc
```
**Query Params:**
- `q`: Search keyword
- `category`: Filter by category
- `min_price`: Minimum price
- `max_price`: Maximum price
- `sort`: price_asc | price_desc | newest

**Response:** Paginated search results

---

## 📂 **CATEGORY ROUTES (Public)**

### **Get All Categories**
```http
GET /api/categories
```
**Response:** Array of all active categories

---

## 🛒 **CART ROUTES (Auth Required)**

### **Get Cart**
```http
GET /api/cart
```
**Auth:** Required
**Response:** Cart items with products and total

---

### **Add to Cart**
```http
POST /api/cart
```
**Auth:** Required
**Body:**
```json
{
  "product_id": 1,
  "quantity": 2
}
```
**Response:** Cart item object

---

### **Update Cart Item**
```http
PUT /api/cart/:itemId
```
**Auth:** Required
**Body:**
```json
{
  "quantity": 3
}
```
**Response:** Updated cart item

---

### **Remove Cart Item**
```http
DELETE /api/cart/:itemId
```
**Auth:** Required
**Response:** Success message

---

### **Clear Cart**
```http
DELETE /api/cart
```
**Auth:** Required
**Response:** Success message

---

## 📦 **ORDER ROUTES (Auth Required)**

### **Get My Orders**
```http
GET /api/orders/my-orders?page=1&status=pending
```
**Auth:** Required
**Query Params:**
- `page`: Page number
- `status`: pending | processing | shipped | delivered | cancelled

**Response:** Paginated orders array

---

### **Get Order Details**
```http
GET /api/orders/:id
```
**Auth:** Required
**Response:** Order object with items

---

### **Create Order**
```http
POST /api/orders
```
**Auth:** Required
**Body:**
```json
{
  "items": [
    {
      "product_id": 1,
      "quantity": 2,
      "price": 29.99
    }
  ],
  "shipping_address": "123 Street, City, Country",
  "payment_method": "credit_card",
  "total_amount": 59.98
}
```
**Response:** Created order object

---

### **Cancel Order**
```http
PUT /api/orders/:id/cancel
```
**Auth:** Required
**Response:** Updated order (status: cancelled)
**Note:** Only works for pending orders

---

## ❤️ **WISHLIST ROUTES (Auth Required)**

### **Get Wishlist**
```http
GET /api/wishlist
```
**Auth:** Required
**Response:** Array of wishlist items with products

---

### **Add to Wishlist**
```http
POST /api/wishlist
```
**Auth:** Required
**Body:**
```json
{
  "product_id": 1
}
```
**Response:** Wishlist item object

---

### **Remove from Wishlist**
```http
DELETE /api/wishlist/:productId
```
**Auth:** Required
**Response:** Success message

---

## ⭐ **REVIEW ROUTES**

### **Get Product Reviews**
```http
GET /api/reviews/:productId/reviews?page=1&limit=10
```
**Auth:** Not required
**Response:** Paginated reviews array

---

### **Add Review**
```http
POST /api/reviews/:productId/reviews
```
**Auth:** Required (must have purchased product)
**Body:**
```json
{
  "rating": 5,
  "comment": "Great product!"
}
```
**Response:** Created review object

---

### **Update Review**
```http
PUT /api/reviews/:id
```
**Auth:** Required (own review only)
**Body:**
```json
{
  "rating": 4,
  "comment": "Updated review"
}
```
**Response:** Updated review object

---

### **Delete Review**
```http
DELETE /api/reviews/:id
```
**Auth:** Required (own review only)
**Response:** Success message

---

## 👨‍💼 **ADMIN ROUTES (Admin Auth Required)**

### **PRODUCTS MANAGEMENT**

#### **Get All Products (Admin)**
```http
GET /api/admin/products?page=1&limit=20
```
**Auth:** Admin required
**Response:** All products (including inactive)

---

#### **Create Product**
```http
POST /api/admin/products
```
**Auth:** Admin required
**Body:**
```json
{
  "name": "Peace Lily",
  "description": "Beautiful indoor plant",
  "price": 29.99,
  "stock": 50,
  "category_id": 1,
  "image_url": "https://example.com/image.jpg",
  "is_featured": true
}
```
**Response:** Created product object

---

#### **Update Product**
```http
PUT /api/admin/products/:id
```
**Auth:** Admin required
**Body:** Same as create (all fields optional)
**Response:** Updated product object

---

#### **Delete Product**
```http
DELETE /api/admin/products/:id
```
**Auth:** Admin required
**Response:** Success message (soft delete)

---

#### **Update Stock**
```http
PUT /api/admin/products/:id/stock
```
**Auth:** Admin required
**Body:**
```json
{
  "stock": 100
}
```
**Response:** Updated product object

---

#### **Toggle Product Status**
```http
PUT /api/admin/products/:id/toggle
```
**Auth:** Admin required
**Response:** Product with toggled is_active status

---

#### **Bulk Upload Products**
```http
POST /api/admin/products/bulk-upload
```
**Auth:** Admin required
**Body:**
```json
{
  "products": [
    {
      "name": "Product 1",
      "price": 19.99,
      "stock": 20,
      "category_id": 1
    },
    {
      "name": "Product 2",
      "price": 29.99,
      "stock": 30,
      "category_id": 2
    }
  ]
}
```
**Response:** Array of created products

---

### **ORDERS MANAGEMENT**

#### **Get All Orders**
```http
GET /api/admin/orders?page=1&status=&date_from=&date_to=
```
**Auth:** Admin required
**Query Params:**
- `status`: Filter by status
- `date_from`: Start date (YYYY-MM-DD)
- `date_to`: End date (YYYY-MM-DD)

**Response:** Paginated orders with customer info

---

#### **Get Order Details (Admin)**
```http
GET /api/admin/orders/:id
```
**Auth:** Admin required
**Response:** Order with customer and items details

---

#### **Update Order Status**
```http
PUT /api/admin/orders/:id/status
```
**Auth:** Admin required
**Body:**
```json
{
  "status": "shipped"
}
```
**Valid statuses:** pending | processing | shipped | delivered | cancelled
**Response:** Updated order object

---

#### **Delete Order**
```http
DELETE /api/admin/orders/:id
```
**Auth:** Admin required
**Response:** Success message

---

### **USERS MANAGEMENT**

#### **Get All Users**
```http
GET /api/admin/users?page=1&role=customer
```
**Auth:** Admin required
**Query Params:**
- `role`: Filter by customer or admin

**Response:** Paginated users array

---

#### **Get User Details**
```http
GET /api/admin/users/:id
```
**Auth:** Admin required
**Response:** User object

---

#### **Update User Role**
```http
PUT /api/admin/users/:id/role
```
**Auth:** Admin required
**Body:**
```json
{
  "role": "admin"
}
```
**Valid roles:** customer | admin
**Response:** Updated user object

---

#### **Block/Unblock User**
```http
PUT /api/admin/users/:id/status
```
**Auth:** Admin required
**Body:**
```json
{
  "is_active": false
}
```
**Response:** Updated user object

---

#### **Delete User**
```http
DELETE /api/admin/users/:id
```
**Auth:** Admin required
**Response:** Success message

---

### **CATEGORIES MANAGEMENT**

#### **Get All Categories (Admin)**
```http
GET /api/admin/categories
```
**Auth:** Admin required
**Response:** All categories (including inactive)

---

#### **Create Category**
```http
POST /api/admin/categories
```
**Auth:** Admin required
**Body:**
```json
{
  "name": "Succulents",
  "description": "Low maintenance plants",
  "image_url": "https://example.com/succulents.jpg"
}
```
**Response:** Created category object

---

#### **Update Category**
```http
PUT /api/admin/categories/:id
```
**Auth:** Admin required
**Body:** Same as create (all optional)
**Response:** Updated category object

---

#### **Delete Category**
```http
DELETE /api/admin/categories/:id
```
**Auth:** Admin required
**Response:** Success message (soft delete)

---

### **DASHBOARD & ANALYTICS**

#### **Get Statistics**
```http
GET /api/admin/dashboard/stats
```
**Auth:** Admin required
**Response:**
```json
{
  "total_users": 150,
  "total_orders": 500,
  "total_revenue": 15000.00,
  "total_products": 80,
  "pending_orders": 10
}
```

---

#### **Get Sales Data**
```http
GET /api/admin/dashboard/sales?date_from=2025-01-01&date_to=2025-12-31
```
**Auth:** Admin required
**Response:** Array of daily sales data

---

#### **Get Top Products**
```http
GET /api/admin/dashboard/top-products?limit=10
```
**Auth:** Admin required
**Response:** Best-selling products

---

#### **Get Recent Orders**
```http
GET /api/admin/dashboard/recent-orders?limit=10
```
**Auth:** Admin required
**Response:** Latest orders

---

#### **Get Low Stock Products**
```http
GET /api/admin/dashboard/low-stock?threshold=10
```
**Auth:** Admin required
**Response:** Products with stock <= threshold

---

### **REVIEWS MANAGEMENT**

#### **Get All Reviews (Admin)**
```http
GET /api/admin/reviews?status=pending&page=1
```
**Auth:** Admin required
**Query Params:**
- `status`: pending | approved | rejected

**Response:** Paginated reviews array

---

#### **Approve Review**
```http
PUT /api/admin/reviews/:id/approve
```
**Auth:** Admin required
**Response:** Approved review object

---

#### **Reject Review**
```http
PUT /api/admin/reviews/:id/reject
```
**Auth:** Admin required
**Response:** Rejected review object

---

#### **Delete Review (Admin)**
```http
DELETE /api/admin/reviews/:id
```
**Auth:** Admin required
**Response:** Success message

---

## 🔧 **UTILITY ROUTES**

### **Initialize Database**
```http
POST /api/init-database
```
**Auth:** Not required
**Response:** Success message (creates tables and sample data)
**Note:** One-time use for setup

---

### **Make User Admin**
```http
POST /api/make-admin
```
**Body:**
```json
{
  "email": "user@example.com"
}
```
**Response:** Updated user with admin role
**Note:** For initial setup only

---

## 🔐 **AUTHENTICATION SETUP**

### **1. Store Token After Login:**
```javascript
const response = await axios.post('/api/auth/login', { email, password });
localStorage.setItem('token', response.data.data.token);
```

### **2. Add Token to Requests:**
```javascript
const token = localStorage.getItem('token');
axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
```

### **3. Create Axios Instance:**
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://greenart81-backend.onrender.com/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

---

## 📋 **RESPONSE FORMAT**

### **Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### **Error Response:**
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

### **Paginated Response:**
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  },
  "message": "Data retrieved successfully"
}
```

---

## 🚨 **COMMON ERROR CODES**

| Code | Description | HTTP Status |
|------|-------------|-------------|
| `NO_TOKEN` | No authentication token | 401 |
| `INVALID_TOKEN` | Invalid or expired token | 403 |
| `ADMIN_REQUIRED` | Admin privileges required | 403 |
| `MISSING_FIELDS` | Required fields missing | 400 |
| `EMAIL_EXISTS` | Email already registered | 400 |
| `INVALID_CREDENTIALS` | Wrong email/password | 401 |
| `PRODUCT_NOT_FOUND` | Product doesn't exist | 404 |
| `INSUFFICIENT_STOCK` | Not enough stock | 400 |
| `ORDER_NOT_FOUND` | Order doesn't exist | 404 |
| `SERVER_ERROR` | Internal server error | 500 |

---

## 📊 **QUICK REFERENCE TABLE**

| Feature | Endpoint | Method | Auth |
|---------|----------|--------|------|
| **Authentication** |
| Register | `/api/auth/register` | POST | ❌ |
| Login | `/api/auth/login` | POST | ❌ |
| Get Profile | `/api/auth/me` | GET | ✅ |
| **Products** |
| List Products | `/api/products` | GET | ❌ |
| Product Details | `/api/products/:id` | GET | ❌ |
| Search | `/api/search` | GET | ❌ |
| **Cart** |
| Get Cart | `/api/cart` | GET | ✅ |
| Add to Cart | `/api/cart` | POST | ✅ |
| **Orders** |
| My Orders | `/api/orders/my-orders` | GET | ✅ |
| Create Order | `/api/orders` | POST | ✅ |
| **Admin** |
| Dashboard Stats | `/api/admin/dashboard/stats` | GET | 👨‍💼 |
| Manage Products | `/api/admin/products` | GET/POST/PUT/DELETE | 👨‍💼 |
| Manage Orders | `/api/admin/orders` | GET/PUT | 👨‍💼 |
| Manage Users | `/api/admin/users` | GET/PUT/DELETE | 👨‍💼 |

**Legend:** ❌ No auth | ✅ Customer auth | 👨‍💼 Admin auth

---

## 🎯 **Testing with cURL**

### **Register:**
```bash
curl -X POST https://greenart81-backend.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123","name":"Test User","phone":"1234567890"}'
```

### **Login:**
```bash
curl -X POST https://greenart81-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'
```

### **Get Products:**
```bash
curl https://greenart81-backend.onrender.com/api/products
```

### **Authenticated Request:**
```bash
curl https://greenart81-backend.onrender.com/api/cart \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

**Your API is ready to use! 🚀**

**Base URL:** `https://greenart81-backend.onrender.com/api`
