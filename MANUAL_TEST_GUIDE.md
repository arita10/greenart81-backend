# Manual Test Guide - GreenArt81 Full Loop Testing

Complete manual testing guide for both Backend API and Frontend integration testing.

---

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Backend Testing](#backend-testing)
3. [Frontend Testing](#frontend-testing)
4. [Full Loop Integration Testing](#full-loop-integration-testing)
5. [Test Scenarios](#test-scenarios)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Tools
- [x] Web Browser (Chrome/Firefox/Edge)
- [x] API Testing Tool (Postman/Thunder Client/cURL)
- [x] Backend Server Running
- [x] Frontend Application Running (if available)

### Test Accounts

**Admin Account:**
- Email: `admin@greenart81.com`
- Password: `admin123`
- Format: `admin@greenart81.com / admin123`

**Customer Test Account:**
- Email: `test.customer@example.com`
- Password: `test123456`
- Format: `test.customer@example.com / test123456`
- Name: Test Customer
- Phone: 0812345678

**Note:** Create this customer account during Test 1.2 (Registration), then use these credentials for all subsequent customer tests.

### Environment Setup

**Backend API URL:**
- Local: `http://localhost:5000/api`
- Production: `https://greenart81-backend.onrender.com/api`

**Frontend URL:**
- Local: `http://localhost:3000`
- Production: `[Your deployed frontend URL]`

---

## Backend Testing

### Phase 1: Authentication Flow

#### Test 1.1: Admin Login
**Method:** POST
**Endpoint:** `/api/auth/login`
**Headers:** `Content-Type: application/json`

**Request Body:**
```json
{
  "email": "admin@greenart81.com",
  "password": "admin123"
}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 6,
      "email": "admin@greenart81.com",
      "name": "Admin User",
      "role": "admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Login successful"
}
```

**Validation:**
- [ ] Status code: 200
- [ ] Token received
- [ ] User role is "admin"
- [ ] User ID exists

**Save:** `ADMIN_TOKEN` for subsequent tests

---

#### Test 1.2: Customer Registration
**Method:** POST
**Endpoint:** `/api/auth/register`
**Headers:** `Content-Type: application/json`

**Request Body:**
```json
{
  "email": "test.customer@example.com",
  "password": "test123456",
  "name": "Test Customer",
  "phone": "0812345678"
}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 7,
      "email": "test.customer@example.com",
      "name": "Test Customer",
      "role": "customer"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "User registered successfully"
}
```

**Validation:**
- [ ] Status code: 200
- [ ] Token received
- [ ] User role is "customer"
- [ ] User ID exists

**Save:** `CUSTOMER_TOKEN` for subsequent tests

---

#### Test 1.3: Get User Profile
**Method:** GET
**Endpoint:** `/api/auth/me`
**Headers:**
- `Content-Type: application/json`
- `Authorization: Bearer {CUSTOMER_TOKEN}`

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": 7,
    "email": "test.customer@example.com",
    "name": "Test Customer",
    "phone": "0812345678",
    "role": "customer",
    "is_active": true,
    "created_at": "2025-12-29T..."
  }
}
```

**Validation:**
- [ ] Status code: 200
- [ ] User data matches registration
- [ ] Profile is active

---

### Phase 2: Product Management

#### Test 2.1: Get All Products (Public)
**Method:** GET
**Endpoint:** `/api/products`
**Headers:** `Content-Type: application/json`

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Product Name",
      "description": "Product description",
      "price": "199.00",
      "stock_quantity": 50,
      "category": "Category Name",
      "image_url": "https://...",
      "is_active": true
    }
  ]
}
```

**Validation:**
- [ ] Status code: 200
- [ ] Products array returned
- [ ] Only active products shown
- [ ] All required fields present

**Save:** First `product_id` for cart tests

---

#### Test 2.2: Get Product Details
**Method:** GET
**Endpoint:** `/api/products/{product_id}`
**Headers:** `Content-Type: application/json`

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Product Name",
    "description": "Detailed description",
    "price": "199.00",
    "stock_quantity": 50,
    "category_id": 1,
    "category": "Category Name",
    "image_url": "https://...",
    "thumb_url": "https://...",
    "medium_url": "https://...",
    "is_active": true,
    "average_rating": "4.50",
    "total_reviews": 10
  }
}
```

**Validation:**
- [ ] Status code: 200
- [ ] Product details complete
- [ ] Images URLs present
- [ ] Rating and reviews count present

---

#### Test 2.3: Get Featured Products
**Method:** GET
**Endpoint:** `/api/products/featured`
**Headers:** `Content-Type: application/json`

**Validation:**
- [ ] Status code: 200
- [ ] Featured products returned
- [ ] Maximum products respected

---

### Phase 3: Shopping Cart Flow

#### Test 3.1: Add Product to Cart
**Method:** POST
**Endpoint:** `/api/cart`
**Headers:**
- `Content-Type: application/json`
- `Authorization: Bearer {CUSTOMER_TOKEN}`

**Request Body:**
```json
{
  "product_id": 1,
  "quantity": 2
}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "user_id": 7,
    "product_id": 1,
    "quantity": 2,
    "added_at": "2025-12-29T..."
  },
  "message": "Product added to cart successfully"
}
```

**Validation:**
- [ ] Status code: 200
- [ ] Cart item created
- [ ] Quantity correct

**Save:** `cart_item_id`

---

#### Test 3.2: Get Cart Items
**Method:** GET
**Endpoint:** `/api/cart`
**Headers:**
- `Content-Type: application/json`
- `Authorization: Bearer {CUSTOMER_TOKEN}`

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "product_id": 1,
      "product_name": "Product Name",
      "price": "199.00",
      "quantity": 2,
      "subtotal": "398.00",
      "image_url": "https://...",
      "stock_quantity": 50
    }
  ],
  "message": "Cart retrieved successfully"
}
```

**Validation:**
- [ ] Status code: 200
- [ ] Cart items with product details
- [ ] Subtotal calculated correctly
- [ ] Stock info included

---

#### Test 3.3: Update Cart Quantity
**Method:** PUT
**Endpoint:** `/api/cart/{cart_item_id}`
**Headers:**
- `Content-Type: application/json`
- `Authorization: Bearer {CUSTOMER_TOKEN}`

**Request Body:**
```json
{
  "quantity": 3
}
```

**Validation:**
- [ ] Status code: 200
- [ ] Quantity updated
- [ ] Message confirms update

---

### Phase 4: Order Creation & QR Payment

#### Test 4.1: Create Order
**Method:** POST
**Endpoint:** `/api/orders`
**Headers:**
- `Content-Type: application/json`
- `Authorization: Bearer {CUSTOMER_TOKEN}`

**Request Body:**
```json
{
  "shipping_address": "123 Test Street, Bangkok, Thailand 10110",
  "phone": "0812345678"
}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "order": {
      "id": 1,
      "order_number": "ORD-20251229-001",
      "user_id": 7,
      "total_amount": "597.00",
      "order_status": "pending",
      "payment_status": "pending",
      "payment_method": null,
      "shipping_address": "123 Test Street, Bangkok, Thailand 10110",
      "phone": "0812345678",
      "created_at": "2025-12-29T..."
    },
    "items": [
      {
        "product_id": 1,
        "product_name": "Product Name",
        "quantity": 3,
        "price": "199.00",
        "subtotal": "597.00"
      }
    ]
  },
  "message": "Order created successfully"
}
```

**Validation:**
- [ ] Status code: 200
- [ ] Order created with unique number
- [ ] Total amount correct
- [ ] Order items included
- [ ] Cart cleared automatically

**Save:** `order_id` and `order_number`

---

#### Test 4.2: Get Active QR Codes (Public)
**Method:** GET
**Endpoint:** `/api/qr-payment/qr-codes/active`
**Headers:** `Content-Type: application/json`

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "bank_name": "Bangkok Bank",
      "account_name": "GreenArt81 Store",
      "account_number": "123-4-56789-0",
      "qr_code_image_url": "https://i.ibb.co/xxx/qr-code.jpg",
      "payment_type": "bank_transfer"
    }
  ],
  "message": "Active QR codes retrieved successfully"
}
```

**Validation:**
- [ ] Status code: 200
- [ ] Active QR codes returned
- [ ] No authentication required
- [ ] Sensitive fields hidden

**Save:** `qr_code_id`

---

#### Test 4.3: Upload Payment Slip Image
**Method:** POST
**Endpoint:** `/api/upload/single`
**Headers:**
- `Authorization: Bearer {CUSTOMER_TOKEN}`
- `Content-Type: multipart/form-data`

**Request Body (Form Data):**
- Key: `image`
- Value: [Select payment slip image file]

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "url": "https://i.ibb.co/xxx/payment-slip.jpg",
    "thumbUrl": "https://i.ibb.co/xxx/thumb.jpg",
    "mediumUrl": "https://i.ibb.co/xxx/medium.jpg"
  },
  "message": "Image uploaded successfully"
}
```

**Validation:**
- [ ] Status code: 200
- [ ] Image uploaded to ImgBB
- [ ] URLs returned

**Save:** `slip_image_url`

---

#### Test 4.4: Submit Payment Slip
**Method:** POST
**Endpoint:** `/api/qr-payment/slips`
**Headers:**
- `Content-Type: application/json`
- `Authorization: Bearer {CUSTOMER_TOKEN}`

**Request Body:**
```json
{
  "order_id": 1,
  "qr_code_id": 1,
  "slip_image_url": "https://i.ibb.co/xxx/payment-slip.jpg",
  "amount": 597.00,
  "payment_date": "2025-12-29T14:30:00Z",
  "transaction_reference": "TXN123456789",
  "notes": "Paid via SCB Mobile Banking at 14:30"
}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "order_id": 1,
    "user_id": 7,
    "qr_code_id": 1,
    "slip_image_url": "https://i.ibb.co/xxx/payment-slip.jpg",
    "amount": "597.00",
    "payment_date": "2025-12-29T14:30:00.000Z",
    "transaction_reference": "TXN123456789",
    "notes": "Paid via SCB Mobile Banking at 14:30",
    "status": "pending",
    "verified_by": null,
    "verified_at": null,
    "created_at": "2025-12-29T..."
  },
  "message": "Payment slip uploaded successfully. Waiting for verification."
}
```

**Validation:**
- [ ] Status code: 200
- [ ] Payment slip created
- [ ] Status is "pending"
- [ ] Order payment_status updated to "pending_verification"

**Save:** `payment_slip_id`

---

#### Test 4.5: Verify Order Status Updated
**Method:** GET
**Endpoint:** `/api/orders/{order_id}`
**Headers:**
- `Content-Type: application/json`
- `Authorization: Bearer {CUSTOMER_TOKEN}`

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "order_number": "ORD-20251229-001",
    "payment_status": "pending_verification",
    "payment_method": "qr_code",
    "order_status": "pending",
    ...
  }
}
```

**Validation:**
- [ ] payment_status is "pending_verification"
- [ ] payment_method is "qr_code"

---

### Phase 5: Admin Payment Verification

#### Test 5.1: Get All Payment Slips (Admin)
**Method:** GET
**Endpoint:** `/api/qr-payment/slips/all`
**Headers:**
- `Content-Type: application/json`
- `Authorization: Bearer {ADMIN_TOKEN}`

**Query Parameters:** `?status=pending`

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "order_id": 1,
      "user_id": 7,
      "customer_name": "Test Customer",
      "customer_email": "test.customer@example.com",
      "order_number": "ORD-20251229-001",
      "order_total": "597.00",
      "payment_status": "pending_verification",
      "slip_image_url": "https://i.ibb.co/xxx/payment-slip.jpg",
      "amount": "597.00",
      "payment_date": "2025-12-29T14:30:00.000Z",
      "transaction_reference": "TXN123456789",
      "notes": "Paid via SCB Mobile Banking at 14:30",
      "bank_name": "Bangkok Bank",
      "account_name": "GreenArt81 Store",
      "status": "pending",
      "created_at": "2025-12-29T..."
    }
  ],
  "message": "Payment slips retrieved successfully"
}
```

**Validation:**
- [ ] Status code: 200
- [ ] Pending slips returned
- [ ] Customer details included
- [ ] Order information complete

---

#### Test 5.2: Approve Payment Slip
**Method:** PUT
**Endpoint:** `/api/qr-payment/slips/{payment_slip_id}/verify`
**Headers:**
- `Content-Type: application/json`
- `Authorization: Bearer {ADMIN_TOKEN}`

**Request Body:**
```json
{
  "status": "approved",
  "verification_notes": "Payment verified successfully. Transaction confirmed in bank statement. Amount matches order total."
}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "order_id": 1,
    "status": "approved",
    "verified_by": 6,
    "verified_at": "2025-12-29T15:00:00.000Z",
    "verification_notes": "Payment verified successfully. Transaction confirmed in bank statement. Amount matches order total.",
    ...
  },
  "message": "Payment slip approved successfully"
}
```

**Validation:**
- [ ] Status code: 200
- [ ] Status changed to "approved"
- [ ] verified_by set to admin ID
- [ ] verified_at timestamp recorded

---

#### Test 5.3: Verify Order Status After Approval
**Method:** GET
**Endpoint:** `/api/orders/{order_id}`
**Headers:**
- `Content-Type: application/json`
- `Authorization: Bearer {ADMIN_TOKEN}`

**Expected Changes:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "payment_status": "completed",
    "order_status": "processing",
    ...
  }
}
```

**Validation:**
- [ ] payment_status changed to "completed"
- [ ] order_status changed to "processing"

---

### Phase 6: Customer Order Tracking

#### Test 6.1: Get My Orders
**Method:** GET
**Endpoint:** `/api/orders/my-orders`
**Headers:**
- `Content-Type: application/json`
- `Authorization: Bearer {CUSTOMER_TOKEN}`

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "order_number": "ORD-20251229-001",
      "total_amount": "597.00",
      "order_status": "processing",
      "payment_status": "completed",
      "payment_method": "qr_code",
      "shipping_address": "123 Test Street, Bangkok, Thailand 10110",
      "created_at": "2025-12-29T...",
      "total_items": 1,
      "total_quantity": 3
    }
  ],
  "message": "Orders retrieved successfully"
}
```

**Validation:**
- [ ] Status code: 200
- [ ] Orders list returned
- [ ] Order status updated
- [ ] Payment status correct

---

#### Test 6.2: Get My Payment Slips
**Method:** GET
**Endpoint:** `/api/qr-payment/slips/my-slips`
**Headers:**
- `Content-Type: application/json`
- `Authorization: Bearer {CUSTOMER_TOKEN}`

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "order_id": 1,
      "order_number": "ORD-20251229-001",
      "order_total": "597.00",
      "slip_image_url": "https://i.ibb.co/xxx/payment-slip.jpg",
      "amount": "597.00",
      "status": "approved",
      "bank_name": "Bangkok Bank",
      "verified_by_name": "Admin User",
      "verified_at": "2025-12-29T15:00:00.000Z",
      "verification_notes": "Payment verified successfully...",
      "created_at": "2025-12-29T..."
    }
  ],
  "message": "Payment slips retrieved successfully"
}
```

**Validation:**
- [ ] Status code: 200
- [ ] Payment slips with verification info
- [ ] Verifier name included

---

### Phase 7: Admin Order Management

#### Test 7.1: Get All Orders (Admin)
**Method:** GET
**Endpoint:** `/api/admin/orders`
**Headers:**
- `Content-Type: application/json`
- `Authorization: Bearer {ADMIN_TOKEN}`

**Query Parameters:** `?status=processing&payment_status=completed`

**Validation:**
- [ ] Status code: 200
- [ ] Orders list with filters
- [ ] Customer information included

---

#### Test 7.2: Update Order Status
**Method:** PUT
**Endpoint:** `/api/admin/orders/{order_id}/status`
**Headers:**
- `Content-Type: application/json`
- `Authorization: Bearer {ADMIN_TOKEN}`

**Request Body:**
```json
{
  "order_status": "shipped"
}
```

**Validation:**
- [ ] Status code: 200
- [ ] Order status updated
- [ ] Message confirms update

---

### Phase 8: Error Handling Tests

#### Test 8.1: Duplicate Payment Slip Upload
**Method:** POST
**Endpoint:** `/api/qr-payment/slips`
**Headers:**
- `Content-Type: application/json`
- `Authorization: Bearer {CUSTOMER_TOKEN}`

**Request Body:** (Same order_id as Test 4.4)
```json
{
  "order_id": 1,
  "qr_code_id": 1,
  "slip_image_url": "https://i.ibb.co/xxx/another-slip.jpg",
  "amount": 597.00
}
```

**Expected Response:**
```json
{
  "success": false,
  "error": "Payment slip already uploaded for this order",
  "code": "ALREADY_EXISTS"
}
```

**Validation:**
- [ ] Status code: 400
- [ ] Error message appropriate
- [ ] Duplicate prevented

---

#### Test 8.2: Unauthorized Access
**Method:** GET
**Endpoint:** `/api/qr-payment/qr-codes`
**Headers:**
- `Content-Type: application/json`
- `Authorization: Bearer {CUSTOMER_TOKEN}`

**Expected Response:**
```json
{
  "success": false,
  "error": "Access denied. Admin privileges required.",
  "code": "ADMIN_REQUIRED"
}
```

**Validation:**
- [ ] Status code: 403
- [ ] Admin endpoint protected

---

#### Test 8.3: Missing Required Fields
**Method:** POST
**Endpoint:** `/api/qr-payment/slips`
**Headers:**
- `Content-Type: application/json`
- `Authorization: Bearer {CUSTOMER_TOKEN}`

**Request Body:**
```json
{
  "order_id": 1
}
```

**Expected Response:**
```json
{
  "success": false,
  "error": "Order ID, slip image, and amount are required",
  "code": "MISSING_FIELDS"
}
```

**Validation:**
- [ ] Status code: 400
- [ ] Validation working

---

#### Test 8.4: Invalid Token
**Method:** GET
**Endpoint:** `/api/auth/me`
**Headers:**
- `Content-Type: application/json`
- `Authorization: Bearer invalid_token_here`

**Expected Response:**
```json
{
  "success": false,
  "error": "Invalid or expired token",
  "code": "INVALID_TOKEN"
}
```

**Validation:**
- [ ] Status code: 401
- [ ] Token validation working

---

## Frontend Testing

### Prerequisites
- Frontend application running
- Backend API accessible
- Browser developer tools open (F12)

---

### Phase 1: Public Pages Testing

#### Test F1.1: Home Page
**URL:** `/`

**Visual Checks:**
- [ ] Header/Navbar displays correctly
- [ ] Featured products carousel/grid visible
- [ ] Categories section displays
- [ ] Footer displays
- [ ] All images load correctly
- [ ] Navigation links work

**Console Checks:**
- [ ] No JavaScript errors
- [ ] API calls successful (check Network tab)
- [ ] `/api/products/featured` returns data
- [ ] `/api/categories` returns data

---

#### Test F1.2: Products Listing Page
**URL:** `/products`

**Visual Checks:**
- [ ] Product grid displays
- [ ] Product cards show: image, name, price, rating
- [ ] Pagination works (if applicable)
- [ ] Filter sidebar displays (if implemented)
- [ ] Sort options work

**Functional Checks:**
- [ ] Click on product card → redirects to product details
- [ ] Add to cart button appears
- [ ] Price formatted correctly

**Console Checks:**
- [ ] `/api/products` called successfully
- [ ] Products data received
- [ ] No errors in console

---

#### Test F1.3: Product Details Page
**URL:** `/products/{product_id}`

**Visual Checks:**
- [ ] Product image gallery displays
- [ ] Product name, price, description visible
- [ ] Stock quantity shown
- [ ] Quantity selector works
- [ ] Add to Cart button enabled
- [ ] Reviews section displays

**Functional Checks:**
- [ ] Change quantity → updates total
- [ ] Click Add to Cart → item added
- [ ] Out of stock products → button disabled
- [ ] Breadcrumb navigation works

**Console Checks:**
- [ ] `/api/products/{id}` called
- [ ] Product data loaded
- [ ] `/api/reviews/{id}/reviews` called

---

#### Test F1.4: Search Page
**URL:** `/search?q=test`

**Functional Checks:**
- [ ] Search input works
- [ ] Search results display
- [ ] "No results" message shows when empty
- [ ] Click result → redirects correctly

**Console Checks:**
- [ ] `/api/search?q=test` called
- [ ] Results returned

---

### Phase 2: Authentication Flow

#### Test F2.1: Login Page
**URL:** `/login`

**Visual Checks:**
- [ ] Login form displays
- [ ] Email and password fields present
- [ ] Submit button visible
- [ ] Link to register page

**Functional Checks:**
1. **Valid Login:**
   - Enter: `test.customer@example.com` / `test123456`
   - Click Login
   - [ ] Redirects to products/home
   - [ ] User menu shows name
   - [ ] Cart icon updates
   - [ ] Token saved in localStorage

2. **Invalid Login:**
   - Enter wrong credentials
   - [ ] Error message displays
   - [ ] Form doesn't clear
   - [ ] Stays on login page

**Console Checks:**
- [ ] POST `/api/auth/login` called
- [ ] Token received and stored
- [ ] User data in response

---

#### Test F2.2: Registration Page
**URL:** `/register`

**Visual Checks:**
- [ ] Registration form displays
- [ ] All fields present: name, email, phone, password, confirm password
- [ ] Submit button visible
- [ ] Link to login page

**Functional Checks:**
1. **Valid Registration:**
   - Fill all fields with new email
   - [ ] Form validates correctly
   - [ ] Success message shows
   - [ ] Auto-login or redirect to login

2. **Duplicate Email:**
   - Use existing email
   - [ ] Error message: "Email already exists"

3. **Validation:**
   - Try weak password
   - [ ] Password requirements shown
   - Passwords don't match
   - [ ] Error message displays

**Console Checks:**
- [ ] POST `/api/auth/register` called
- [ ] Validation errors handled

---

### Phase 3: Customer Shopping Flow

#### Test F3.1: Shopping Cart Page
**URL:** `/cart`

**Visual Checks:**
- [ ] Cart items list displays
- [ ] Each item shows: image, name, price, quantity, subtotal
- [ ] Quantity controls (+/- buttons)
- [ ] Remove button for each item
- [ ] Cart total displayed
- [ ] Proceed to Checkout button

**Functional Checks:**
1. **Update Quantity:**
   - Click + button
   - [ ] Quantity increases
   - [ ] Subtotal updates
   - [ ] Total updates
   - [ ] API call made

2. **Remove Item:**
   - Click Remove button
   - [ ] Item removed from list
   - [ ] Total recalculates
   - [ ] Empty cart message if all removed

3. **Empty Cart:**
   - [ ] "Your cart is empty" message
   - [ ] Link to continue shopping

**Console Checks:**
- [ ] GET `/api/cart` on page load
- [ ] PUT `/api/cart/{id}` on quantity change
- [ ] DELETE `/api/cart/{id}` on remove
- [ ] No errors

---

#### Test F3.2: Checkout Page
**URL:** `/checkout`

**Visual Checks:**
- [ ] Order summary displays
- [ ] Cart items shown
- [ ] Total amount displayed
- [ ] Shipping address form
- [ ] Phone number field
- [ ] Payment method section (if applicable)

**Functional Checks:**
1. **Fill Checkout Form:**
   - Enter shipping address
   - Enter phone number
   - [ ] Form validation works
   - [ ] Required fields marked

2. **Place Order:**
   - Click Place Order button
   - [ ] Loading indicator shows
   - [ ] Success message appears
   - [ ] Redirects to order success page

**Console Checks:**
- [ ] POST `/api/orders` called
- [ ] Order created successfully
- [ ] Cart cleared
- [ ] Order ID received

---

#### Test F3.3: Order Success Page
**URL:** `/order-success/{order_id}`

**Visual Checks:**
- [ ] Success message/icon displays
- [ ] Order number shown
- [ ] Order summary displayed
- [ ] Total amount shown
- [ ] Payment instructions visible
- [ ] QR codes section displays

**Functional Checks:**
- [ ] "View My Orders" button → redirects to orders page
- [ ] "Upload Payment Slip" button appears
- [ ] Order details accurate

**Console Checks:**
- [ ] GET `/api/orders/{id}` called
- [ ] Order data loaded
- [ ] GET `/api/qr-payment/qr-codes/active` called

---

#### Test F3.4: QR Payment Flow (Frontend)

**Visual Checks:**
- [ ] Active QR codes displayed
- [ ] QR code image visible
- [ ] Bank name shown
- [ ] Account details displayed
- [ ] Upload payment slip button

**Functional Checks:**
1. **View QR Code:**
   - [ ] QR code image can be enlarged
   - [ ] Account details copyable

2. **Upload Payment Slip:**
   - Click Upload button
   - Select image file
   - [ ] Image preview shows
   - Fill amount, transaction ref, notes
   - [ ] All fields validate
   - Click Submit
   - [ ] Success message
   - [ ] Redirect or update status

**Console Checks:**
- [ ] POST `/api/upload/single` (image upload)
- [ ] POST `/api/qr-payment/slips` (submit slip)
- [ ] Image URL received
- [ ] Payment slip created

---

### Phase 4: Customer Dashboard

#### Test F4.1: My Orders Page
**URL:** `/my-orders`

**Visual Checks:**
- [ ] Orders list displays
- [ ] Each order shows: number, date, total, status
- [ ] Payment status badge
- [ ] Order status badge
- [ ] View Details button

**Functional Checks:**
- [ ] Click order → redirects to order details
- [ ] Orders sorted by date (newest first)
- [ ] Filter by status (if implemented)

**Console Checks:**
- [ ] GET `/api/orders/my-orders` called
- [ ] Orders data received

---

#### Test F4.2: Order Details Page
**URL:** `/orders/{order_id}`

**Visual Checks:**
- [ ] Order number and date
- [ ] Order status and payment status
- [ ] Shipping address
- [ ] Order items list
- [ ] Item details: image, name, quantity, price
- [ ] Total amount
- [ ] Payment slip section (if uploaded)

**Functional Checks:**
1. **View Payment Slip:**
   - [ ] Payment slip image shows
   - [ ] Status badge (pending/approved/rejected)
   - [ ] Verification notes display (if approved/rejected)
   - [ ] Verifier name and date

2. **Upload Payment Slip (if pending):**
   - [ ] Upload button available
   - [ ] Upload flow works

**Console Checks:**
- [ ] GET `/api/orders/{id}` called
- [ ] GET `/api/qr-payment/slips/order/{id}` called
- [ ] Data loaded correctly

---

#### Test F4.3: Profile Page
**URL:** `/profile`

**Visual Checks:**
- [ ] User information displayed
- [ ] Name, email, phone shown
- [ ] Edit profile form/button
- [ ] Change password link

**Functional Checks:**
1. **Update Profile:**
   - Edit name or phone
   - Click Save
   - [ ] Success message
   - [ ] Data updated

2. **Validation:**
   - Try invalid phone
   - [ ] Error message shows

**Console Checks:**
- [ ] GET `/api/auth/me` on page load
- [ ] PUT `/api/auth/profile` on save
- [ ] Profile data updated

---

### Phase 5: Admin Dashboard

#### Test F5.1: Admin Dashboard
**URL:** `/admin`

**Access:**
- Login as admin first
- Navigate to `/admin`

**Visual Checks:**
- [ ] Dashboard statistics cards
- [ ] Total revenue
- [ ] Total orders
- [ ] Total users
- [ ] Total products
- [ ] Charts/graphs (if implemented)
- [ ] Recent orders table
- [ ] Low stock alerts

**Functional Checks:**
- [ ] Statistics display correctly
- [ ] Charts render
- [ ] Recent orders clickable

**Console Checks:**
- [ ] GET `/api/admin/dashboard/stats` called
- [ ] GET `/api/admin/dashboard/recent-orders` called
- [ ] Data loaded

---

#### Test F5.2: Admin Products Management
**URL:** `/admin/products`

**Visual Checks:**
- [ ] Products table/list
- [ ] Columns: Image, Name, Price, Stock, Status, Actions
- [ ] Add New Product button
- [ ] Search/filter functionality

**Functional Checks:**
1. **Add Product:**
   - Click Add New Product
   - Fill form: name, description, price, stock, category, image
   - Click Save
   - [ ] Success message
   - [ ] Product appears in list

2. **Edit Product:**
   - Click Edit button
   - Modify fields
   - Click Save
   - [ ] Product updated

3. **Toggle Active Status:**
   - Click Active/Inactive toggle
   - [ ] Status changes
   - [ ] Frontend updates

4. **Delete Product:**
   - Click Delete button
   - [ ] Confirmation dialog appears
   - Confirm
   - [ ] Product removed

**Console Checks:**
- [ ] GET `/api/admin/products` on page load
- [ ] POST `/api/admin/products` on add
- [ ] PUT `/api/admin/products/{id}` on edit
- [ ] PUT `/api/admin/products/{id}/toggle` on status change
- [ ] DELETE `/api/admin/products/{id}` on delete

---

#### Test F5.3: Admin Orders Management
**URL:** `/admin/orders`

**Visual Checks:**
- [ ] Orders table
- [ ] Columns: Order #, Customer, Date, Total, Status, Payment, Actions
- [ ] Filter by status
- [ ] Search functionality

**Functional Checks:**
1. **View Order Details:**
   - Click View button
   - [ ] Order details modal/page opens
   - [ ] All information displayed

2. **Update Order Status:**
   - Change status dropdown
   - [ ] Status updates
   - [ ] Customer notified (if implemented)

3. **Filter Orders:**
   - Select status filter
   - [ ] Orders filtered correctly

**Console Checks:**
- [ ] GET `/api/admin/orders` called
- [ ] PUT `/api/admin/orders/{id}/status` on update
- [ ] Filters applied in query params

---

#### Test F5.4: Admin Payment Verification
**URL:** `/admin/payments` or `/admin/orders` (with payment slips tab)

**Visual Checks:**
- [ ] Pending payment slips list
- [ ] Each slip shows: Order #, Customer, Amount, Date, Image
- [ ] View Slip button
- [ ] Approve/Reject buttons

**Functional Checks:**
1. **View Payment Slip:**
   - Click View Slip
   - [ ] Image modal opens
   - [ ] Image displays clearly
   - [ ] Zoom/download option

2. **Approve Payment:**
   - Click Approve button
   - [ ] Verification notes textarea appears
   - Enter notes
   - Confirm
   - [ ] Success message
   - [ ] Slip removed from pending list
   - [ ] Order status updated

3. **Reject Payment:**
   - Click Reject button
   - [ ] Reason textarea appears (required)
   - Enter rejection reason
   - Confirm
   - [ ] Success message
   - [ ] Slip marked as rejected
   - [ ] Customer can see rejection reason

**Console Checks:**
- [ ] GET `/api/qr-payment/slips/all?status=pending` called
- [ ] PUT `/api/qr-payment/slips/{id}/verify` on approve/reject
- [ ] Order status updated in real-time

---

## Full Loop Integration Testing

### Complete User Journey Test

#### Journey 1: New Customer Purchase Flow

**Steps:**
1. **Landing & Browsing** (5 minutes)
   - [ ] Visit home page
   - [ ] Browse featured products
   - [ ] Click on a product
   - [ ] View product details
   - [ ] Add 2 items to cart

2. **Registration** (3 minutes)
   - [ ] Click Register
   - [ ] Fill registration form
   - [ ] Submit and verify token received
   - [ ] Redirected to products page

3. **Shopping** (5 minutes)
   - [ ] Add more products to cart
   - [ ] Go to cart page
   - [ ] Update quantities
   - [ ] Remove one item
   - [ ] Verify total calculation

4. **Checkout** (5 minutes)
   - [ ] Click Checkout
   - [ ] Fill shipping address
   - [ ] Enter phone number
   - [ ] Review order summary
   - [ ] Place order
   - [ ] Verify order created

5. **Payment** (5 minutes)
   - [ ] View QR codes on success page
   - [ ] Note bank details
   - [ ] Upload payment slip image
   - [ ] Fill payment details (amount, ref, notes)
   - [ ] Submit payment slip
   - [ ] Verify slip uploaded

6. **Order Tracking** (3 minutes)
   - [ ] Go to My Orders
   - [ ] Click on recent order
   - [ ] View order details
   - [ ] See payment status: "pending_verification"
   - [ ] View uploaded payment slip

**Expected Total Time:** ~26 minutes

**Validation Checklist:**
- [ ] All pages load without errors
- [ ] Navigation smooth
- [ ] Data persists correctly
- [ ] Real-time updates work
- [ ] No console errors throughout journey

---

#### Journey 2: Admin Order Processing Flow

**Steps:**
1. **Login** (2 minutes)
   - [ ] Login as admin
   - [ ] Redirected to admin dashboard
   - [ ] Dashboard stats display

2. **View Pending Payments** (3 minutes)
   - [ ] Navigate to payment verification section
   - [ ] See pending payment slips
   - [ ] Filter by status: pending
   - [ ] Verify customer slip from Journey 1 appears

3. **Verify Payment** (5 minutes)
   - [ ] Click on payment slip from Journey 1
   - [ ] View slip image
   - [ ] Verify amount matches order total
   - [ ] Verify transaction reference
   - [ ] Click Approve button
   - [ ] Enter verification notes
   - [ ] Submit approval

4. **Process Order** (3 minutes)
   - [ ] Go to Orders Management
   - [ ] Find the approved order
   - [ ] Verify payment status: "completed"
   - [ ] Verify order status: "processing"
   - [ ] Update order status to "shipped"
   - [ ] Save changes

5. **Monitor Dashboard** (2 minutes)
   - [ ] Return to dashboard
   - [ ] Verify statistics updated
   - [ ] Check recent orders
   - [ ] Verify revenue increased

**Expected Total Time:** ~15 minutes

**Validation Checklist:**
- [ ] Admin permissions enforced
- [ ] Payment verification flow smooth
- [ ] Order status cascades correctly
- [ ] Real-time updates work
- [ ] Statistics accurate

---

#### Journey 3: Customer Verification Check

**Steps:**
1. **Login as Customer** (2 minutes)
   - [ ] Login with customer account from Journey 1
   - [ ] Go to My Orders

2. **View Updated Order** (3 minutes)
   - [ ] Click on recent order
   - [ ] Verify payment status: "completed"
   - [ ] Verify order status: "shipped"
   - [ ] View payment slip section
   - [ ] See "Approved" badge
   - [ ] Read verification notes from admin

3. **Verify Notifications** (2 minutes)
   - [ ] Check for notifications (if implemented)
   - [ ] Email notification received (if implemented)

**Expected Total Time:** ~7 minutes

**Validation Checklist:**
- [ ] Order status synced
- [ ] Payment slip shows approved
- [ ] Customer sees admin notes
- [ ] Status badges correct

---

### Cross-Browser Testing

Test the complete flow in multiple browsers:

#### Browser Compatibility Checklist

**Chrome:**
- [ ] Journey 1 completed
- [ ] Journey 2 completed
- [ ] Journey 3 completed
- [ ] No errors in console

**Firefox:**
- [ ] Journey 1 completed
- [ ] Journey 2 completed
- [ ] Journey 3 completed
- [ ] No errors in console

**Safari (Mac/iOS):**
- [ ] Journey 1 completed
- [ ] Journey 2 completed
- [ ] Journey 3 completed
- [ ] No errors in console

**Edge:**
- [ ] Journey 1 completed
- [ ] Journey 2 completed
- [ ] Journey 3 completed
- [ ] No errors in console

**Mobile (Chrome/Safari):**
- [ ] Responsive design works
- [ ] Touch interactions work
- [ ] Image upload works
- [ ] Forms submittable

---

### Performance Testing

#### Load Time Checks

**Home Page:**
- [ ] First Contentful Paint < 2s
- [ ] Largest Contentful Paint < 3s
- [ ] Time to Interactive < 4s

**Product Listing:**
- [ ] Initial load < 2s
- [ ] Images lazy-load correctly

**Checkout:**
- [ ] Form renders < 1s
- [ ] Submission < 3s

#### API Response Times

Monitor Network tab:
- [ ] GET requests < 500ms
- [ ] POST requests < 1s
- [ ] Image uploads < 3s
- [ ] Payment verification < 1s

---

## Test Scenarios

### Scenario 1: Stock Management

**Test Case:** Product goes out of stock during shopping

**Steps:**
1. Add product to cart (stock: 5)
2. Admin updates stock to 0
3. Try to checkout
4. **Expected:** Error message about insufficient stock

**Validation:**
- [ ] Stock check on checkout
- [ ] Error message clear
- [ ] User can remove item or update quantity

---

### Scenario 2: Concurrent Orders

**Test Case:** Multiple users order same product

**Steps:**
1. User A adds last 2 items to cart
2. User B adds last 2 items to cart
3. User A checks out first
4. User B tries to checkout
5. **Expected:** User B gets insufficient stock error

**Validation:**
- [ ] Stock decremented correctly
- [ ] Race condition handled
- [ ] Error message appropriate

---

### Scenario 3: Payment Rejection Flow

**Test Case:** Admin rejects payment slip

**Steps:**
1. Customer creates order
2. Customer uploads payment slip with wrong amount
3. Admin views slip
4. Admin rejects with reason: "Amount mismatch"
5. Customer checks order status

**Expected Results:**
- [ ] Order payment_status: "failed"
- [ ] Customer sees rejection reason
- [ ] Customer can upload new slip

---

### Scenario 4: Token Expiration

**Test Case:** User token expires during session

**Steps:**
1. Login as customer
2. Wait for token expiration (or manually expire)
3. Try to add to cart
4. **Expected:** Redirect to login with message

**Validation:**
- [ ] Token expiration detected
- [ ] Redirect to login
- [ ] Return to previous page after login

---

### Scenario 5: Admin Bulk Operations

**Test Case:** Admin updates multiple orders

**Steps:**
1. Create 5 orders
2. Upload payment slips for all
3. Admin approves all 5 at once
4. Verify all orders updated

**Validation:**
- [ ] Bulk operations work
- [ ] No race conditions
- [ ] All updates successful

---

## Troubleshooting

### Common Issues & Solutions

#### Issue 1: CORS Errors
**Symptom:** Console error: "CORS policy blocked"

**Solution:**
- Check backend CORS_ORIGIN in .env
- Verify frontend URL matches
- Restart backend server

---

#### Issue 2: Images Not Loading
**Symptom:** Broken image icons

**Solution:**
- Verify ImgBB API key configured
- Check image URLs in database
- Test upload endpoint directly

---

#### Issue 3: Token Issues
**Symptom:** "Invalid token" errors

**Solution:**
- Check JWT_SECRET matches
- Verify token in localStorage
- Check token expiration time
- Clear localStorage and re-login

---

#### Issue 4: Payment Slip Not Updating Order
**Symptom:** Order status stays "pending" after upload

**Solution:**
- Check payment slip created successfully
- Verify order payment_method set to "qr_code"
- Check database triggers
- Review backend logs

---

#### Issue 5: Admin Can't Access Dashboard
**Symptom:** "Admin required" error

**Solution:**
- Verify user role in database
- Check isAdmin middleware
- Re-login as admin
- Clear browser cache

---

### Debug Checklist

When encountering issues:

**Backend:**
- [ ] Check server logs
- [ ] Verify database connection
- [ ] Check environment variables
- [ ] Test endpoint with curl/Postman
- [ ] Verify authentication middleware

**Frontend:**
- [ ] Check browser console
- [ ] Check Network tab for failed requests
- [ ] Verify localStorage for token
- [ ] Check API base URL configuration
- [ ] Clear browser cache

**Database:**
- [ ] Verify tables exist
- [ ] Check migrations run
- [ ] Verify foreign key constraints
- [ ] Check data integrity

---

## Test Report Template

After completing tests, fill out this report:

### Test Execution Summary

**Date:** _________________
**Tester:** _________________
**Environment:** Local / Production
**Backend Version:** _________________
**Frontend Version:** _________________

### Results

**Backend API Tests:**
- Total Tests: _____
- Passed: _____
- Failed: _____
- Skipped: _____

**Frontend Tests:**
- Total Tests: _____
- Passed: _____
- Failed: _____
- Skipped: _____

**Integration Tests:**
- Total Journeys: _____
- Passed: _____
- Failed: _____

### Issues Found

| # | Issue Description | Severity | Status | Notes |
|---|------------------|----------|--------|-------|
| 1 |                  | High/Med/Low | Open/Fixed |       |
| 2 |                  |          |        |       |
| 3 |                  |          |        |       |

### Recommendations

1. _______________________________________________________
2. _______________________________________________________
3. _______________________________________________________

### Sign-off

**Tested By:** _________________
**Signature:** _________________
**Date:** _________________

---

## Appendix

### Quick Test Commands

**Backend:**
```bash
# Test connection
npm run test-connection

# Run automated QR payment test
npm run test-qr-payment

# Test against production
API_URL=https://greenart81-backend.onrender.com npm run test-qr-payment
```

**Frontend:**
```bash
# Start development server
npm start

# Build for production
npm run build

# Run tests (if implemented)
npm test
```

### API Quick Reference

**Base URL:** `https://greenart81-backend.onrender.com/api`

**Authentication Header:**
```
Authorization: Bearer {token}
```

**Common Endpoints:**
- POST `/auth/login` - Login
- POST `/auth/register` - Register
- GET `/products` - Get products
- POST `/cart` - Add to cart
- POST `/orders` - Create order
- GET `/qr-payment/qr-codes/active` - Get QR codes
- POST `/qr-payment/slips` - Upload payment slip

---

**Happy Testing! 🧪✅**

For automated testing, see: [QR_PAYMENT_API_TESTS.md](QR_PAYMENT_API_TESTS.md)
