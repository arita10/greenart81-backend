# 📱 QR Code Payment System - Complete Guide

## 🎯 Overview

Your backend now supports **QR Code Payment** where:
- **Admin** uploads bank QR codes
- **Customers** see QR code during checkout
- **Customers** pay via bank transfer/mobile banking
- **Customers** upload payment slip (proof of payment)
- **Admin** verifies payment slips
- **Order** status updated automatically

This is perfect for markets like Thailand, Indonesia, Philippines, etc. where QR code payments are popular!

---

## ✅ What's Implemented:

### **1. Database Tables** ✅
- `payment_qr_codes` - Admin manages QR codes
- `payment_slips` - User payment slip uploads
- `payment_method` column added to orders

### **2. API Endpoints** ✅
**Admin QR Management:**
- Create, Read, Update, Delete QR codes

**Customer Payment:**
- View active QR codes
- Upload payment slips
- Check payment status

**Admin Verification:**
- View all payment slips
- Approve/Reject payments

---

## 🔗 API Endpoints:

### **PUBLIC ENDPOINTS:**

#### **Get Active QR Codes**
```
GET /api/qr-payment/qr-codes/active
```
No authentication required - customers can see payment options

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "bank_name": "Bangkok Bank",
      "account_name": "GreenArt81 Co Ltd",
      "account_number": "123-456-7890",
      "qr_code_image_url": "https://i.ibb.co/xxx/qr-bangkok-bank.jpg",
      "payment_type": "bank_transfer"
    },
    {
      "id": 2,
      "bank_name": "PromptPay",
      "account_name": "GreenArt81",
      "account_number": "0812345678",
      "qr_code_image_url": "https://i.ibb.co/xxx/qr-promptpay.jpg",
      "payment_type": "mobile_banking"
    }
  ]
}
```

---

### **CUSTOMER ENDPOINTS:**

#### **1. Upload Payment Slip**
```
POST /api/qr-payment/slips
```
**Authentication:** Required (customer token)

**Request:**
```json
{
  "order_id": 123,
  "qr_code_id": 1,
  "slip_image_url": "https://i.ibb.co/xxx/payment-slip.jpg",
  "amount": 299.90,
  "payment_date": "2025-12-25T14:30:00Z",
  "transaction_reference": "TXN12345",
  "notes": "Paid via mobile banking"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 45,
    "order_id": 123,
    "user_id": 5,
    "qr_code_id": 1,
    "slip_image_url": "https://i.ibb.co/xxx/payment-slip.jpg",
    "amount": "299.90",
    "status": "pending",
    "created_at": "2025-12-25T14:35:00Z"
  },
  "message": "Payment slip uploaded successfully. Waiting for verification."
}
```

#### **2. Get My Payment Slips**
```
GET /api/qr-payment/slips/my-slips
```
**Authentication:** Required (customer token)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 45,
      "order_id": 123,
      "order_number": "ORD-20251225-001",
      "order_total": "299.90",
      "slip_image_url": "https://i.ibb.co/xxx/payment-slip.jpg",
      "amount": "299.90",
      "status": "approved",
      "bank_name": "Bangkok Bank",
      "verified_by_name": "Admin User",
      "verified_at": "2025-12-25T15:00:00Z",
      "verification_notes": "Payment verified. Order processing.",
      "created_at": "2025-12-25T14:35:00Z"
    }
  ]
}
```

#### **3. Get Payment Slip by Order**
```
GET /api/qr-payment/slips/order/:orderId
```
**Authentication:** Required (customer token)

---

### **ADMIN ENDPOINTS:**

#### **1. Get All QR Codes**
```
GET /api/qr-payment/qr-codes
```
**Authentication:** Required (admin token)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "bank_name": "Bangkok Bank",
      "account_name": "GreenArt81 Co Ltd",
      "account_number": "123-456-7890",
      "qr_code_image_url": "https://i.ibb.co/xxx/qr-bangkok-bank.jpg",
      "payment_type": "bank_transfer",
      "is_active": true,
      "created_by": 1,
      "created_by_name": "Admin User",
      "created_at": "2025-12-20T10:00:00Z"
    }
  ]
}
```

#### **2. Create QR Code**
```
POST /api/qr-payment/qr-codes
```
**Authentication:** Required (admin token)

**Request:**
```json
{
  "bank_name": "Bangkok Bank",
  "account_name": "GreenArt81 Co Ltd",
  "account_number": "123-456-7890",
  "qr_code_image_url": "https://i.ibb.co/xxx/qr-bangkok-bank.jpg",
  "payment_type": "bank_transfer"
}
```

#### **3. Update QR Code**
```
PUT /api/qr-payment/qr-codes/:id
```
**Authentication:** Required (admin token)

**Request:**
```json
{
  "is_active": false
}
```

#### **4. Delete QR Code**
```
DELETE /api/qr-payment/qr-codes/:id
```
**Authentication:** Required (admin token)

#### **5. Get All Payment Slips**
```
GET /api/qr-payment/slips/all?status=pending
```
**Authentication:** Required (admin token)

**Query Parameters:**
- `status` (optional): `pending`, `approved`, `rejected`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 45,
      "order_id": 123,
      "order_number": "ORD-20251225-001",
      "order_total": "299.90",
      "payment_status": "pending_verification",
      "customer_name": "John Doe",
      "customer_email": "john@example.com",
      "slip_image_url": "https://i.ibb.co/xxx/payment-slip.jpg",
      "amount": "299.90",
      "payment_date": "2025-12-25T14:30:00Z",
      "transaction_reference": "TXN12345",
      "notes": "Paid via mobile banking",
      "bank_name": "Bangkok Bank",
      "account_name": "GreenArt81 Co Ltd",
      "status": "pending",
      "created_at": "2025-12-25T14:35:00Z"
    }
  ]
}
```

#### **6. Verify/Reject Payment Slip**
```
PUT /api/qr-payment/slips/:id/verify
```
**Authentication:** Required (admin token)

**Request:**
```json
{
  "status": "approved",
  "verification_notes": "Payment verified. Order processing."
}
```

**Status:** `approved` or `rejected`

**When Approved:**
- Payment slip status → `approved`
- Order payment_status → `completed`
- Order order_status → `processing`

**When Rejected:**
- Payment slip status → `rejected`
- Order payment_status → `failed`

---

## 🔄 Complete Payment Flow:

```
1. CHECKOUT PHASE:
   Customer completes checkout
   → Order created with status "pending"
   → Customer sees "Complete Payment" button

2. PAYMENT SELECTION:
   Customer clicks "Pay Now"
   → Frontend calls GET /api/qr-payment/qr-codes/active
   → Displays all active QR codes
   → Customer selects a QR code (bank)

3. CUSTOMER PAYS:
   Customer scans QR code with banking app
   → Transfers money
   → Takes screenshot of payment slip/receipt

4. SLIP UPLOAD:
   Customer uploads payment slip image
   → Upload to /api/upload/single first (get URL)
   → POST /api/qr-payment/slips with slip URL
   → Order status → "pending_verification"

5. ADMIN VERIFICATION:
   Admin sees notification
   → GET /api/qr-payment/slips/all?status=pending
   → Views payment slip image
   → Checks bank account for payment
   → PUT /api/qr-payment/slips/:id/verify

6. COMPLETION:
   If approved:
   → Order status → "processing"
   → Customer gets notification
   → Admin ships order

   If rejected:
   → Order status → "payment_failed"
   → Customer can re-upload slip
```

---

## 🎨 Frontend Integration:

### **Step 1: Display QR Codes (Checkout Page)**

```javascript
// After order creation
const handleShowPaymentQR = async (orderId) => {
  try {
    // Get active QR codes
    const response = await api.get('/qr-payment/qr-codes/active');
    const qrCodes = response.data.data;

    // Display QR codes to user
    setPaymentQRCodes(qrCodes);
    setShowQRModal(true);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

**UI Example:**
```jsx
<div className="qr-codes-list">
  {qrCodes.map(qr => (
    <div key={qr.id} className="qr-card" onClick={() => selectQR(qr)}>
      <img src={qr.qr_code_image_url} alt={qr.bank_name} />
      <h3>{qr.bank_name}</h3>
      <p>{qr.account_name}</p>
      <p>{qr.account_number}</p>
    </div>
  ))}
</div>
```

### **Step 2: Upload Payment Slip**

```javascript
const handleUploadSlip = async (orderId, qrCodeId) => {
  try {
    // 1. Upload slip image first
    const formData = new FormData();
    formData.append('image', slipFile);

    const uploadResponse = await api.post('/upload/single', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    const slipImageUrl = uploadResponse.data.data.url;

    // 2. Submit payment slip
    const slipData = {
      order_id: orderId,
      qr_code_id: qrCodeId,
      slip_image_url: slipImageUrl,
      amount: orderTotal,
      payment_date: new Date(),
      transaction_reference: transactionRef,
      notes: paymentNotes
    };

    await api.post('/qr-payment/slips', slipData);

    alert('Payment slip uploaded! Waiting for verification.');
    navigate('/my-orders');
  } catch (error) {
    console.error('Upload error:', error);
    alert('Failed to upload payment slip');
  }
};
```

### **Step 3: Check Payment Status**

```javascript
const checkPaymentStatus = async (orderId) => {
  try {
    const response = await api.get(`/qr-payment/slips/order/${orderId}`);
    const slip = response.data.data;

    if (slip.status === 'approved') {
      return 'Payment Verified ✅';
    } else if (slip.status === 'pending') {
      return 'Pending Verification ⏳';
    } else if (slip.status === 'rejected') {
      return 'Payment Rejected ❌';
    }
  } catch (error) {
    return 'No payment slip uploaded';
  }
};
```

---

## 🎯 Admin Dashboard Integration:

### **QR Code Management Page**

```javascript
// Get all QR codes
const qrCodes = await api.get('/qr-payment/qr-codes');

// Create new QR code
const createQR = async () => {
  // Upload QR image first
  const imageUrl = await uploadImage(qrImageFile);

  // Create QR code
  await api.post('/qr-payment/qr-codes', {
    bank_name: 'Bangkok Bank',
    account_name: 'GreenArt81',
    account_number: '123-456-7890',
    qr_code_image_url: imageUrl,
    payment_type: 'bank_transfer'
  });
};

// Toggle QR code active/inactive
const toggleQR = async (id, currentStatus) => {
  await api.put(`/qr-payment/qr-codes/${id}`, {
    is_active: !currentStatus
  });
};
```

### **Payment Verification Page**

```javascript
// Get pending payment slips
const pendingSlips = await api.get('/qr-payment/slips/all?status=pending');

// Verify payment slip
const verifySlip = async (slipId) => {
  await api.put(`/qr-payment/slips/${slipId}/verify`, {
    status: 'approved',
    verification_notes: 'Payment verified. Order processing.'
  });

  alert('Payment approved! Order is now processing.');
};

// Reject payment slip
const rejectSlip = async (slipId) => {
  await api.put(`/qr-payment/slips/${slipId}/verify`, {
    status: 'rejected',
    verification_notes: 'Payment amount mismatch. Please upload correct slip.'
  });

  alert('Payment rejected. Customer notified.');
};
```

---

## 📊 Database Schema:

### **payment_qr_codes Table:**
```sql
id                  SERIAL PRIMARY KEY
bank_name           VARCHAR(255)
account_name        VARCHAR(255)
account_number      VARCHAR(255)
qr_code_image_url   TEXT
payment_type        VARCHAR(100)  -- 'bank_transfer', 'mobile_banking', 'promptpay'
is_active           BOOLEAN
created_by          INTEGER (references users)
created_at          TIMESTAMP
updated_at          TIMESTAMP
```

### **payment_slips Table:**
```sql
id                    SERIAL PRIMARY KEY
order_id              INTEGER (references orders)
user_id               INTEGER (references users)
qr_code_id            INTEGER (references payment_qr_codes)
slip_image_url        TEXT
amount                DECIMAL(10, 2)
payment_date          TIMESTAMP
transaction_reference VARCHAR(255)
notes                 TEXT
status                VARCHAR(50)  -- 'pending', 'approved', 'rejected'
verified_by           INTEGER (references users)
verified_at           TIMESTAMP
verification_notes    TEXT
created_at            TIMESTAMP
updated_at            TIMESTAMP
```

---

## ✅ Advantages of QR Payment:

1. **No Payment Gateway Fees** - Direct bank transfer
2. **Local Payment Methods** - PromptPay, PayNow, GCash, etc.
3. **Manual Verification** - Admin controls payment approval
4. **Proof of Payment** - Customer uploads receipt
5. **Popular in Asia** - Widely used in Thailand, Singapore, Philippines

---

## 🚀 Deployment:

Everything is ready! Just push to GitHub:

```bash
git add .
git commit -m "Add QR Code Payment System"
git push origin main
```

Render will auto-deploy. No additional environment variables needed!

---

## ✨ Summary:

**Backend:** ✅ 100% Complete!
**Database:** ✅ QR payment tables created!
**Endpoints:** ✅ All QR payment APIs ready!
**Migration:** ✅ Already run on your database!

**Payment Statuses:**
- `pending` - Slip uploaded, waiting verification
- `approved` - Payment verified by admin
- `rejected` - Payment rejected by admin

**Order Flow:**
1. Customer creates order
2. Customer sees QR codes
3. Customer pays via bank app
4. Customer uploads payment slip
5. Admin verifies payment
6. Order processes automatically ✅

---

**Your QR Code Payment System is ready to use!** 📱✨

No third-party payment gateway needed - direct bank transfers with proof!

