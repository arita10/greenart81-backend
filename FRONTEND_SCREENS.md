# Frontend Screens & Routes Guide for GreenArt81

Based on your backend API, here's a complete list of screens/pages you need to build for the frontend.

---

## 🎨 **Frontend Application Structure**

### **Architecture Recommendation:**
```
frontend/
├── Public Pages (No Auth Required)
├── Customer Pages (Auth Required - Role: Customer)
└── Admin Dashboard (Auth Required - Role: Admin)
```

---

## 🌐 **PUBLIC PAGES (No Authentication Required)**

### 1. **Home Page** - `/`
**Purpose:** Landing page with featured products and categories

**API Endpoints Used:**
- `GET /api/products/featured` - Featured products
- `GET /api/categories` - Product categories
- `GET /api/products?limit=8` - Latest products

**Components Needed:**
- Hero/Banner section
- Featured products carousel
- Categories grid
- Latest products section
- About/Features section
- Footer with links

**Key Features:**
- Display 6-8 featured products
- Show all categories with images
- Search bar
- "Shop Now" call-to-action buttons
- Newsletter signup (optional)

---

### 2. **Products Listing Page** - `/products`
**Purpose:** Browse all products with filters and search

**API Endpoints Used:**
- `GET /api/products?page=1&limit=20&category=&search=` - All products with pagination
- `GET /api/categories` - For category filter

**Components Needed:**
- Product grid/list view toggle
- Sidebar with filters:
  - Category filter
  - Price range filter
  - Search box
- Sort dropdown (price, newest, popular)
- Pagination controls
- Product cards (image, name, price, rating)

**Key Features:**
- Filter by category
- Search products
- Sort by price/date
- Pagination
- "Add to Cart" button on each product
- "Add to Wishlist" heart icon

---

### 3. **Product Details Page** - `/products/:id`
**Purpose:** Single product view with full details

**API Endpoints Used:**
- `GET /api/products/:id` - Product details
- `GET /api/reviews/:id/reviews` - Product reviews
- `POST /api/cart` - Add to cart (if logged in)
- `POST /api/wishlist` - Add to wishlist (if logged in)

**Components Needed:**
- Product image gallery
- Product info (name, price, description, stock status)
- Quantity selector
- "Add to Cart" button
- "Add to Wishlist" button
- Product specifications
- Reviews section with star ratings
- Review form (if user purchased product)
- Related products carousel

**Key Features:**
- Image zoom/gallery
- Stock availability indicator
- Quantity selector (max = stock)
- Add to cart (redirect to login if not authenticated)
- Reviews with ratings
- Share buttons (optional)

---

### 4. **Category Page** - `/category/:categoryName`
**Purpose:** Products filtered by specific category

**API Endpoints Used:**
- `GET /api/products/category/:category` - Products by category
- `GET /api/categories` - Category info

**Components Needed:**
- Similar to Products Listing but filtered
- Category banner/header
- Product grid
- Sort and filter options

---

### 5. **Search Results Page** - `/search`
**Purpose:** Display search results

**API Endpoints Used:**
- `GET /api/search?q=keyword&min_price=&max_price=&sort=` - Search products

**Components Needed:**
- Search results header ("Showing results for...")
- Product grid
- Filters (price, category, sort)
- No results message

---

### 6. **Login Page** - `/login`
**Purpose:** User authentication

**API Endpoints Used:**
- `POST /api/auth/login` - Login user

**Components Needed:**
- Email input
- Password input
- "Remember me" checkbox
- "Forgot password?" link
- "Login" button
- "Don't have an account? Register" link
- Social login buttons (optional)

**Key Features:**
- Form validation
- Error messages
- Store JWT token in localStorage/cookies
- Redirect to previous page after login

---

### 7. **Register Page** - `/register`
**Purpose:** New user registration

**API Endpoints Used:**
- `POST /api/auth/register` - Register new user

**Components Needed:**
- Name input
- Email input
- Phone input
- Password input
- Confirm password input
- Terms & conditions checkbox
- "Register" button
- "Already have an account? Login" link

**Key Features:**
- Form validation
- Password strength indicator
- Auto-login after registration
- Store JWT token

---

## 🔐 **CUSTOMER PAGES (Authentication Required)**

### 8. **Shopping Cart Page** - `/cart`
**Purpose:** View and manage cart items

**API Endpoints Used:**
- `GET /api/cart` - Get cart items
- `PUT /api/cart/:itemId` - Update quantity
- `DELETE /api/cart/:itemId` - Remove item
- `DELETE /api/cart` - Clear cart

**Components Needed:**
- Cart items table/list:
  - Product image
  - Product name
  - Price
  - Quantity selector
  - Subtotal
  - Remove button
- Cart summary:
  - Subtotal
  - Shipping (optional)
  - Tax (optional)
  - Total
- "Continue Shopping" button
- "Proceed to Checkout" button
- Empty cart message

**Key Features:**
- Update quantity (with stock validation)
- Remove items
- Clear cart
- Calculate totals
- Persist cart across sessions

---

### 9. **Checkout Page** - `/checkout`
**Purpose:** Complete order with shipping info

**API Endpoints Used:**
- `GET /api/cart` - Get cart items
- `POST /api/orders` - Create order
- `GET /api/auth/me` - Get user info for pre-fill

**Components Needed:**
- Multi-step form:
  - **Step 1: Shipping Information**
    - Full name
    - Address
    - City, State, ZIP
    - Phone number
  - **Step 2: Payment Method**
    - Credit Card
    - PayPal
    - Cash on Delivery
  - **Step 3: Order Review**
    - Order summary
    - Shipping address
    - Payment method
    - Total amount
- "Place Order" button

**Key Features:**
- Form validation
- Save shipping address to profile
- Order confirmation
- Redirect to success page

---

### 10. **Order Success Page** - `/order-success/:orderId`
**Purpose:** Confirmation after order placement

**API Endpoints Used:**
- `GET /api/orders/:id` - Get order details

**Components Needed:**
- Success message with order number
- Order summary
- Estimated delivery date
- "Continue Shopping" button
- "View Order Details" button
- Print invoice button

---

### 11. **My Orders Page** - `/my-orders`
**Purpose:** View order history

**API Endpoints Used:**
- `GET /api/orders/my-orders?page=1&status=` - Get user orders

**Components Needed:**
- Orders table/cards:
  - Order number
  - Date
  - Total amount
  - Status badge (pending, processing, shipped, delivered, cancelled)
  - "View Details" button
- Filter by status
- Pagination
- Empty orders message

**Key Features:**
- Filter by order status
- Search orders
- Pagination
- Click to view details

---

### 12. **Order Details Page** - `/orders/:id`
**Purpose:** Single order view

**API Endpoints Used:**
- `GET /api/orders/:id` - Order details
- `PUT /api/orders/:id/cancel` - Cancel order

**Components Needed:**
- Order information:
  - Order number
  - Order date
  - Status
- Items list with images
- Shipping address
- Payment method
- Order summary (subtotal, shipping, total)
- "Cancel Order" button (if status = pending)
- "Track Order" button (optional)
- "Download Invoice" button (optional)

---

### 13. **Wishlist Page** - `/wishlist`
**Purpose:** View and manage wishlist

**API Endpoints Used:**
- `GET /api/wishlist` - Get wishlist
- `POST /api/cart` - Add to cart from wishlist
- `DELETE /api/wishlist/:productId` - Remove from wishlist

**Components Needed:**
- Product grid similar to products page
- "Add to Cart" button on each item
- "Remove from Wishlist" button
- Empty wishlist message
- Stock status indicator

**Key Features:**
- Move items to cart
- Remove items
- Show stock status
- Click product to view details

---

### 14. **My Profile Page** - `/profile`
**Purpose:** View and edit user profile

**API Endpoints Used:**
- `GET /api/auth/me` - Get profile
- `PUT /api/auth/profile` - Update profile

**Components Needed:**
- Profile form:
  - Name
  - Email (read-only)
  - Phone
  - Address
- "Save Changes" button
- Profile avatar (optional)
- Account creation date
- Success/error messages

---

### 15. **Change Password Page** - `/change-password`
**Purpose:** Update user password

**API Endpoints Used:**
- `PUT /api/auth/password` - Change password

**Components Needed:**
- Old password input
- New password input
- Confirm new password input
- "Change Password" button
- Password strength indicator
- Success message

---

## 👨‍💼 **ADMIN DASHBOARD PAGES** (Admin Role Required)

### 16. **Admin Dashboard Home** - `/admin` or `/admin/dashboard`
**Purpose:** Overview of key metrics

**API Endpoints Used:**
- `GET /api/admin/dashboard/stats` - Overall statistics
- `GET /api/admin/dashboard/sales` - Sales data
- `GET /api/admin/dashboard/recent-orders` - Recent orders
- `GET /api/admin/dashboard/low-stock` - Low stock products

**Components Needed:**
- **Statistics Cards:**
  - Total Users
  - Total Orders
  - Total Revenue
  - Total Products
  - Pending Orders
- **Charts:**
  - Sales chart (line/bar chart)
  - Revenue by category (pie chart)
  - Orders by status (donut chart)
- **Recent Orders Table** (last 10)
- **Low Stock Alert** (products with stock < 10)
- **Quick Actions:**
  - Add Product
  - View Orders
  - Manage Users

**Key Features:**
- Real-time statistics
- Interactive charts
- Quick navigation to other admin pages

---

### 17. **Admin Products Management** - `/admin/products`
**Purpose:** Manage all products

**API Endpoints Used:**
- `GET /api/admin/products?page=1&limit=20` - Get all products
- `POST /api/admin/products` - Create product
- `PUT /api/admin/products/:id` - Update product
- `DELETE /api/admin/products/:id` - Delete product
- `PUT /api/admin/products/:id/stock` - Update stock
- `PUT /api/admin/products/:id/toggle` - Toggle active status

**Components Needed:**
- **Products Table:**
  - ID
  - Image thumbnail
  - Name
  - Category
  - Price
  - Stock
  - Status (Active/Inactive)
  - Actions (Edit, Delete, Toggle)
- "Add New Product" button
- Search bar
- Filter by category
- Pagination
- Bulk actions (optional)

**Key Features:**
- Add/Edit product modal or separate page
- Delete confirmation
- Quick stock update
- Toggle active/inactive
- Image upload

---

### 18. **Add/Edit Product Page** - `/admin/products/new` or `/admin/products/edit/:id`
**Purpose:** Create or edit product

**API Endpoints Used:**
- `POST /api/admin/products` - Create
- `PUT /api/admin/products/:id` - Update
- `GET /api/admin/categories` - Get categories

**Components Needed:**
- Product form:
  - Name
  - Description (rich text editor)
  - Price
  - Stock
  - Category dropdown
  - Image upload
  - Is Featured checkbox
  - Is Active checkbox
- "Save" button
- "Cancel" button
- Image preview

---

### 19. **Admin Orders Management** - `/admin/orders`
**Purpose:** View and manage all orders

**API Endpoints Used:**
- `GET /api/admin/orders?page=1&status=&date_from=&date_to=` - Get all orders
- `GET /api/admin/orders/:id` - Order details
- `PUT /api/admin/orders/:id/status` - Update order status
- `DELETE /api/admin/orders/:id` - Delete order

**Components Needed:**
- **Orders Table:**
  - Order ID
  - Customer Name
  - Date
  - Total Amount
  - Status
  - Actions (View, Update Status, Delete)
- Filter by status
- Date range filter
- Search by order ID or customer
- Pagination
- Export to CSV button (optional)

**Key Features:**
- Quick status update dropdown
- View order details modal
- Delete confirmation
- Filter and search

---

### 20. **Admin Order Details Page** - `/admin/orders/:id`
**Purpose:** Detailed order view and management

**API Endpoints Used:**
- `GET /api/admin/orders/:id` - Order details
- `PUT /api/admin/orders/:id/status` - Update status

**Components Needed:**
- Order information
- Customer information
- Items list
- Status update dropdown
- Timeline of status changes (optional)
- "Print Invoice" button
- "Send Email" button (optional)

---

### 21. **Admin Users Management** - `/admin/users`
**Purpose:** Manage all users

**API Endpoints Used:**
- `GET /api/admin/users?page=1&role=` - Get all users
- `GET /api/admin/users/:id` - User details
- `PUT /api/admin/users/:id/role` - Update role
- `PUT /api/admin/users/:id/status` - Block/unblock user
- `DELETE /api/admin/users/:id` - Delete user

**Components Needed:**
- **Users Table:**
  - ID
  - Name
  - Email
  - Phone
  - Role badge (Admin/Customer)
  - Status (Active/Blocked)
  - Registration Date
  - Actions (Edit Role, Block/Unblock, Delete)
- Filter by role
- Search users
- Pagination

**Key Features:**
- Change user role
- Block/unblock users
- Delete users with confirmation
- View user details modal

---

### 22. **Admin Categories Management** - `/admin/categories`
**Purpose:** Manage product categories

**API Endpoints Used:**
- `GET /api/admin/categories` - Get all categories
- `POST /api/admin/categories` - Create category
- `PUT /api/admin/categories/:id` - Update category
- `DELETE /api/admin/categories/:id` - Delete category

**Components Needed:**
- **Categories Table:**
  - ID
  - Image
  - Name
  - Description
  - Product Count
  - Status
  - Actions (Edit, Delete)
- "Add New Category" button
- Add/Edit category modal
- Delete confirmation

**Key Features:**
- Add/edit category with image
- Delete with warning (if has products)
- Quick edit

---

### 23. **Admin Reviews Management** - `/admin/reviews`
**Purpose:** Moderate product reviews

**API Endpoints Used:**
- `GET /api/admin/reviews?status=` - Get all reviews
- `PUT /api/admin/reviews/:id/approve` - Approve review
- `PUT /api/admin/reviews/:id/reject` - Reject review
- `DELETE /api/admin/reviews/:id` - Delete review

**Components Needed:**
- **Reviews Table:**
  - Product Name
  - User Name
  - Rating (stars)
  - Comment
  - Status (Pending/Approved/Rejected)
  - Date
  - Actions (Approve, Reject, Delete)
- Filter by status
- Search reviews
- Pagination

**Key Features:**
- Quick approve/reject
- View full review
- Delete with confirmation
- Filter pending reviews

---

### 24. **Admin Settings Page** - `/admin/settings` (Optional)
**Purpose:** Site configuration

**Components Needed:**
- Site name
- Logo upload
- Contact information
- Social media links
- Email settings
- Payment gateway settings

---

## 🎨 **SHARED COMPONENTS** (Used Across Multiple Pages)

### Navigation Components:
1. **Header/Navbar**
   - Logo
   - Search bar
   - Navigation links (Home, Products, Categories, About, Contact)
   - Cart icon with item count
   - Wishlist icon
   - User menu dropdown (Profile, Orders, Logout) or Login/Register buttons

2. **Footer**
   - Site links
   - Social media
   - Contact info
   - Newsletter signup

3. **Sidebar** (for Products/Admin)
   - Filters
   - Categories list
   - Admin navigation menu

### Product Components:
4. **Product Card**
   - Image
   - Name
   - Price
   - Rating
   - Add to Cart button
   - Wishlist icon

5. **Product Card Grid**
   - Responsive grid layout

### UI Components:
6. **Loading Spinner**
7. **Error Message**
8. **Success Toast/Notification**
9. **Confirmation Modal**
10. **Pagination**
11. **Breadcrumbs**
12. **Star Rating Display**

---

## 📱 **RESPONSIVE DESIGN BREAKPOINTS**

```css
/* Mobile First Approach */
Mobile: < 768px
Tablet: 768px - 1024px
Desktop: > 1024px
```

---

## 🗺️ **COMPLETE ROUTE MAP**

### **Public Routes:**
```javascript
/                           → Home Page
/products                   → Products Listing
/products/:id               → Product Details
/category/:category         → Category Products
/search                     → Search Results
/login                      → Login Page
/register                   → Register Page
/about                      → About Us (optional)
/contact                    → Contact Us (optional)
```

### **Customer Routes (Protected):**
```javascript
/cart                       → Shopping Cart
/checkout                   → Checkout
/order-success/:orderId     → Order Success
/my-orders                  → Order History
/orders/:id                 → Order Details
/wishlist                   → Wishlist
/profile                    → User Profile
/change-password            → Change Password
```

### **Admin Routes (Protected - Admin Only):**
```javascript
/admin                      → Admin Dashboard
/admin/products             → Products Management
/admin/products/new         → Add Product
/admin/products/edit/:id    → Edit Product
/admin/orders               → Orders Management
/admin/orders/:id           → Order Details
/admin/users                → Users Management
/admin/categories           → Categories Management
/admin/reviews              → Reviews Management
/admin/settings             → Settings (optional)
```

---

## 🎯 **SUGGESTED DEVELOPMENT ORDER**

### **Phase 1: Core Public Pages** (Week 1)
1. Home Page
2. Products Listing
3. Product Details
4. Login/Register

### **Phase 2: Customer Features** (Week 2)
5. Shopping Cart
6. Checkout
7. My Orders
8. Profile

### **Phase 3: Extended Features** (Week 3)
9. Wishlist
10. Search
11. Category Pages
12. Reviews

### **Phase 4: Admin Dashboard** (Week 4)
13. Admin Dashboard
14. Products Management
15. Orders Management
16. Users Management
17. Categories Management

---

## 🛠️ **RECOMMENDED TECH STACK**

### **Frontend Framework:**
- React.js with React Router
- Next.js (for SEO benefits)
- Vue.js + Vue Router

### **State Management:**
- Redux Toolkit (React)
- Context API (React)
- Zustand (lightweight alternative)
- Pinia (Vue)

### **UI Libraries:**
- Material-UI (MUI)
- Ant Design
- Chakra UI
- Tailwind CSS
- Bootstrap

### **HTTP Client:**
- Axios
- Fetch API

### **Form Handling:**
- React Hook Form
- Formik

### **Charts (for Admin Dashboard):**
- Chart.js
- Recharts
- ApexCharts

---

## 📦 **API Integration Setup**

### **1. Create API Service File:**
```javascript
// src/services/api.js
import axios from 'axios';

const API_URL = 'https://greenart81-backend.onrender.com/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

### **2. Create Service Modules:**
```javascript
// src/services/authService.js
// src/services/productService.js
// src/services/cartService.js
// src/services/orderService.js
// etc.
```

---

## 🎨 **UI/UX DESIGN TIPS**

1. **Consistent Color Scheme:**
   - Primary: Green (nature theme)
   - Secondary: Earth tones
   - Accent: Bright green for CTAs

2. **Typography:**
   - Headings: Bold, clear
   - Body: Readable, 16px minimum

3. **Images:**
   - High-quality product photos
   - Consistent aspect ratios
   - Lazy loading

4. **Loading States:**
   - Skeleton screens
   - Spinners for actions

5. **Error Handling:**
   - User-friendly messages
   - Form validation feedback

---

## ✅ **TOTAL PAGES NEEDED**

**Public:** 8 pages
**Customer:** 8 pages
**Admin:** 9 pages

**Total: 25 pages** + shared components

---

This comprehensive guide should give your frontend developer everything they need to build the complete GreenArt81 e-commerce application! 🚀
