# Quick Test Checklist - GreenArt81

Fast reference guide for testing both backend and frontend.

---

## Pre-Test Setup

- [ ] Backend server running: `npm start`
- [ ] Frontend app running (if testing UI)
- [ ] Database initialized: `npm run add-qr-payment`
- [ ] Admin account: `admin@greenart81.com / admin123`
- [ ] Customer account: `test.customer@example.com / test123456` (create in Test 1 if new)
- [ ] API testing tool ready (Postman/Thunder Client)

---

## 5-Minute Backend API Test

### 1. Authentication (1 min)
```bash
# Login as Admin (admin@greenart81.com / admin123)
POST /api/auth/login
{
  "email": "admin@greenart81.com",
  "password": "admin123"
}
# Save token as ADMIN_TOKEN

# Register Customer (test.customer@example.com / test123456)
POST /api/auth/register
{
  "email": "test.customer@example.com",
  "password": "test123456",
  "name": "Test Customer",
  "phone": "0812345678"
}
# Save token as CUSTOMER_TOKEN
```

**Verify:**
- [ ] Both tokens received
- [ ] Roles correct (admin/customer)

---

### 2. Products & Cart (1 min)
```bash
# Get products
GET /api/products

# Add to cart (use CUSTOMER_TOKEN)
POST /api/cart
{
  "product_id": 1,
  "quantity": 2
}

# View cart
GET /api/cart
```

**Verify:**
- [ ] Products returned
- [ ] Cart item added
- [ ] Subtotal correct

---

### 3. Order & Payment (2 min)
```bash
# Create order (use CUSTOMER_TOKEN)
POST /api/orders
{
  "shipping_address": "123 Test St, Bangkok",
  "phone": "0812345678"
}
# Save order_id

# Get active QR codes (no auth)
GET /api/qr-payment/qr-codes/active

# Upload payment slip (use CUSTOMER_TOKEN)
POST /api/qr-payment/slips
{
  "order_id": 1,
  "qr_code_id": 1,
  "slip_image_url": "https://i.ibb.co/xxx/slip.jpg",
  "amount": 299.90,
  "payment_date": "2025-12-29T14:30:00Z"
}
```

**Verify:**
- [ ] Order created
- [ ] QR codes returned
- [ ] Payment slip uploaded
- [ ] Order status → "pending_verification"

---

### 4. Admin Verification (1 min)
```bash
# Get pending slips (use ADMIN_TOKEN)
GET /api/qr-payment/slips/all?status=pending

# Approve payment (use ADMIN_TOKEN)
PUT /api/qr-payment/slips/1/verify
{
  "status": "approved",
  "verification_notes": "Payment verified"
}

# Check order status
GET /api/orders/1
```

**Verify:**
- [ ] Pending slips shown
- [ ] Slip approved
- [ ] Order status → "completed" & "processing"

---

## 10-Minute Frontend Test

### 1. Public Pages (2 min)
- [ ] Home page loads
- [ ] Products page shows products
- [ ] Product details page works
- [ ] Search works

### 2. Authentication (2 min)
- [ ] Register new user
- [ ] Login works
- [ ] Profile displays
- [ ] Token saved

### 3. Shopping Flow (3 min)
- [ ] Add to cart works
- [ ] Cart page shows items
- [ ] Update quantity works
- [ ] Remove item works
- [ ] Checkout form displays

### 4. Order & Payment (3 min)
- [ ] Place order succeeds
- [ ] Order number generated
- [ ] QR codes display
- [ ] Upload payment slip works
- [ ] Order status updates
- [ ] My Orders shows order

---

## 15-Minute Full Loop Test

### Customer Journey
1. **Browse** → Home → Products → Product Details (2 min)
   - [ ] All pages load
   - [ ] Images display

2. **Register/Login** (2 min)
   - [ ] Create account
   - [ ] Login successful

3. **Shop** → Add to Cart → View Cart → Update (3 min)
   - [ ] Cart updates
   - [ ] Total correct

4. **Checkout** → Place Order → View Success (3 min)
   - [ ] Order created
   - [ ] Order number shown

5. **Pay** → Upload Slip → Check Status (3 min)
   - [ ] QR codes visible
   - [ ] Slip uploaded
   - [ ] Status pending

6. **Track** → My Orders → Order Details (2 min)
   - [ ] Order appears
   - [ ] Details correct

---

### Admin Journey
1. **Login** → Admin Dashboard (1 min)
   - [ ] Stats display

2. **Payments** → View Pending → Approve (2 min)
   - [ ] Pending slips shown
   - [ ] Approval works

3. **Orders** → Update Status (1 min)
   - [ ] Order status updates

4. **Verify** → Customer sees approval (1 min)
   - [ ] Customer order updated

---

## Automated Test

```bash
# Run automated backend test (includes all above)
npm run test-qr-payment

# Test production
API_URL=https://greenart81-backend.onrender.com npm run test-qr-payment
```

**Expected:** All 13 tests pass

---

## Critical Checks

### Backend Health
- [ ] Server responds to `/api/products`
- [ ] Database connected
- [ ] Authentication working
- [ ] CORS configured

### Frontend Health
- [ ] App loads without errors
- [ ] API calls succeed
- [ ] Navigation works
- [ ] No console errors

### Integration
- [ ] Frontend → Backend communication
- [ ] Token authentication works
- [ ] Real-time updates work
- [ ] Image uploads work

---

## Red Flags

**Stop and fix if:**
- [ ] CORS errors in console
- [ ] 500 server errors
- [ ] Database connection failures
- [ ] Token validation failures
- [ ] Images not uploading
- [ ] Cart not updating
- [ ] Orders not creating
- [ ] Payment slips not saving

---

## Test Data

### Test Products
- Product ID: 1 (check with GET /api/products)
- Use first available product

### Test QR Code
- Get from: GET /api/qr-payment/qr-codes/active
- Or create in admin panel first

### Test Images
- Payment slip: Any JPG/PNG image
- Product images: Any product photo

---

## Quick Troubleshooting

**CORS Error:**
```bash
# Check .env
CORS_ORIGIN=http://localhost:3000
# Restart server
```

**Auth Error:**
```bash
# Clear localStorage
localStorage.clear()
# Re-login
```

**Database Error:**
```bash
# Test connection
npm run test-connection
# Reinitialize if needed
npm run add-qr-payment
```

---

## Success Criteria

**Backend:** ✅
- [ ] All endpoints respond
- [ ] Authentication works
- [ ] CRUD operations succeed
- [ ] Payment flow complete

**Frontend:** ✅
- [ ] All pages render
- [ ] User can register/login
- [ ] Shopping cart works
- [ ] Orders can be placed
- [ ] Payments can be uploaded

**Integration:** ✅
- [ ] End-to-end flow works
- [ ] Admin can verify payments
- [ ] Customers see updates
- [ ] No errors in console

---

## Next Steps After Testing

1. **If all tests pass:**
   - [ ] Document any issues
   - [ ] Deploy to production
   - [ ] Test production environment
   - [ ] Monitor for errors

2. **If tests fail:**
   - [ ] Check logs
   - [ ] Review error messages
   - [ ] Fix issues
   - [ ] Re-test
   - [ ] Document fixes

---

**For detailed testing:** See [MANUAL_TEST_GUIDE.md](MANUAL_TEST_GUIDE.md)

**For automated testing:** See [QR_PAYMENT_API_TESTS.md](QR_PAYMENT_API_TESTS.md)
