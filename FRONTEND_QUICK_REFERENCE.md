# Frontend Quick Reference - GreenArt81

## 📊 **Pages Summary**

### **Total Pages: 25**

---

## 🌐 **PUBLIC PAGES (8 pages)**

| # | Page | Route | API Endpoints |
|---|------|-------|---------------|
| 1 | Home | `/` | `/api/products/featured`, `/api/categories` |
| 2 | Products Listing | `/products` | `/api/products` |
| 3 | Product Details | `/products/:id` | `/api/products/:id`, `/api/reviews/:id/reviews` |
| 4 | Category Page | `/category/:name` | `/api/products/category/:category` |
| 5 | Search Results | `/search` | `/api/search?q=` |
| 6 | Login | `/login` | `POST /api/auth/login` |
| 7 | Register | `/register` | `POST /api/auth/register` |
| 8 | About/Contact | `/about`, `/contact` | - |

---

## 👤 **CUSTOMER PAGES (8 pages - Auth Required)**

| # | Page | Route | API Endpoints |
|---|------|-------|---------------|
| 9 | Shopping Cart | `/cart` | `/api/cart` |
| 10 | Checkout | `/checkout` | `POST /api/orders` |
| 11 | Order Success | `/order-success/:id` | `/api/orders/:id` |
| 12 | My Orders | `/my-orders` | `/api/orders/my-orders` |
| 13 | Order Details | `/orders/:id` | `/api/orders/:id` |
| 14 | Wishlist | `/wishlist` | `/api/wishlist` |
| 15 | Profile | `/profile` | `/api/auth/me`, `/api/auth/profile` |
| 16 | Change Password | `/change-password` | `/api/auth/password` |

---

## 👨‍💼 **ADMIN PAGES (9 pages - Admin Auth Required)**

| # | Page | Route | API Endpoints |
|---|------|-------|---------------|
| 17 | Dashboard | `/admin` | `/api/admin/dashboard/*` |
| 18 | Products List | `/admin/products` | `/api/admin/products` |
| 19 | Add/Edit Product | `/admin/products/new` | `POST /api/admin/products` |
| 20 | Orders Management | `/admin/orders` | `/api/admin/orders` |
| 21 | Order Details | `/admin/orders/:id` | `/api/admin/orders/:id` |
| 22 | Users Management | `/admin/users` | `/api/admin/users` |
| 23 | Categories | `/admin/categories` | `/api/admin/categories` |
| 24 | Reviews | `/admin/reviews` | `/api/admin/reviews` |
| 25 | Settings | `/admin/settings` | - |

---

## 🎨 **Key Components Needed**

### **Layout Components:**
- Header/Navbar (with cart count, user menu)
- Footer
- Sidebar (products filter, admin menu)
- Breadcrumbs

### **Product Components:**
- Product Card
- Product Grid
- Product Carousel
- Product Image Gallery

### **Form Components:**
- Login Form
- Register Form
- Checkout Form
- Product Form (admin)

### **UI Components:**
- Loading Spinner
- Error Message
- Success Toast
- Confirmation Modal
- Pagination
- Star Rating
- Status Badge

---

## 🔐 **Authentication Flow**

```
1. User Login → Store JWT in localStorage
2. Add token to API requests (Authorization: Bearer {token})
3. Redirect based on role:
   - Customer → /products or previous page
   - Admin → /admin/dashboard
4. Protected routes check token validity
5. Logout → Clear localStorage, redirect to /login
```

---

## 📦 **API Base URL**

```javascript
const API_URL = 'https://greenart81-backend.onrender.com/api';
```

---

## 🎯 **Development Priority**

### **Week 1: Core Functionality**
- ✅ Home Page
- ✅ Products Listing
- ✅ Product Details
- ✅ Login/Register
- ✅ Cart

### **Week 2: Customer Features**
- ✅ Checkout
- ✅ My Orders
- ✅ Profile
- ✅ Wishlist

### **Week 3: Admin Dashboard**
- ✅ Dashboard
- ✅ Products Management
- ✅ Orders Management

### **Week 4: Polish & Deploy**
- ✅ Reviews
- ✅ Users Management
- ✅ Testing
- ✅ Deploy

---

## 🛠️ **Recommended Tech Stack**

**Frontend Framework:** React.js + React Router
**State Management:** Redux Toolkit or Context API
**UI Library:** Material-UI or Tailwind CSS
**HTTP Client:** Axios
**Forms:** React Hook Form
**Charts:** Chart.js or Recharts

---

## 📱 **Responsive Design**

- **Mobile:** < 768px
- **Tablet:** 768px - 1024px
- **Desktop:** > 1024px

---

## 🎨 **Design Guidelines**

**Colors:**
- Primary: Green (#2d7a3e) - nature/plants
- Secondary: Earth tones
- Accent: Bright green for buttons

**Fonts:**
- Headings: Bold, sans-serif
- Body: 16px minimum

**Images:**
- Product images: 500x500px (square)
- Category banners: 1200x400px
- Thumbnails: 100x100px

---

## ✅ **Features Checklist**

### **Must Have:**
- [x] User authentication
- [x] Product browsing
- [x] Shopping cart
- [x] Checkout
- [x] Order management
- [x] Admin dashboard
- [x] Product CRUD
- [x] Order management

### **Nice to Have:**
- [ ] Product reviews
- [ ] Wishlist
- [ ] Search with filters
- [ ] Order tracking
- [ ] Email notifications
- [ ] Payment gateway
- [ ] PDF invoices

---

## 🚀 **Quick Start for Frontend Dev**

1. **Clone/Create React App**
2. **Install dependencies:**
   ```bash
   npm install axios react-router-dom redux @reduxjs/toolkit
   ```
3. **Set up API service with base URL**
4. **Create route structure**
5. **Build authentication flow first**
6. **Then build public pages**
7. **Then customer pages**
8. **Finally admin dashboard**

---

## 📄 **Full Details**

See [FRONTEND_SCREENS.md](FRONTEND_SCREENS.md) for complete specifications of each page.

---

**Your backend is ready! Start building the frontend! 🎨**
