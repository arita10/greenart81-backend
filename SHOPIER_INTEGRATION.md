## 🎯 **Complete Guide - Ready to use!**

Your Shopier payment integration and product migration solutions are ready!

### **📦 What I've Created:**

1. **Shopier Payment Service** (`services/shopierService.js`)
2. **Payment Controller** (`controllers/paymentController.js`)
3. **Payment Routes** (`routes/paymentRoutes.js`)
4. **Database Migration** (payment_transactions table)
5. **Product Migration Script** (see below)

---

## 💳 **SHOPIER PAYMENT INTEGRATION**

### **Step 1: Get Your Shopier Credentials**

1. Login to https://www.shopier.com
2. Go to **Panel → Settings → API Settings**
3. Copy these credentials:
   - **API Key**
   - **API Secret**
   - **Website Index** (usually 1)

### **Step 2: Add Credentials to Environment Variables**

**Local (.env file):**
```env
SHOPIER_API_KEY=your_actual_api_key
SHOPIER_API_SECRET=your_actual_api_secret
API_URL=https://greenart81-backend.onrender.com
```

**Render Dashboard:**
Add these environment variables:
- `SHOPIER_API_KEY` = your API key
- `SHOPIER_API_SECRET` = your API secret
- `API_URL` = `https://greenart81-backend.onrender.com`

### **Step 3: Run Database Migration**

Create the payment_transactions table:

```bash
# Run this SQL in your PostgreSQL database
psql -d your_database -f config/add-payment-table.sql
```

Or via API (after deployment):

```bash
curl -X POST https://greenart81-backend.onrender.com/api/run-migration
```

---

## 🔄 **HOW PAYMENT FLOW WORKS**

### **Customer Side (Frontend):**

1. **Customer completes order** → Order created in database
2. **Initialize Shopier payment:**

```javascript
// After order creation
const response = await api.post('/payment/initialize', {
  orderId: createdOrder.id
});

const { paymentForm, shopierUrl } = response.data.data;

// Create and submit form to Shopier
const form = document.createElement('form');
form.method = 'POST';
form.action = shopierUrl;

Object.keys(paymentForm).forEach(key => {
  const input = document.createElement('input');
  input.type = 'hidden';
  input.name = key;
  input.value = paymentForm[key];
  form.appendChild(input);
});

document.body.appendChild(form);
form.submit(); // Redirects to Shopier payment page
```

3. **Customer pays on Shopier**
4. **Shopier redirects back** with payment result
5. **Backend receives callback** → Updates order status

### **Payment API Endpoints:**

```
POST   /api/payment/initialize         Initialize Shopier payment
POST   /api/payment/shopier/callback   Shopier callback (automatic)
GET    /api/payment/status/:orderId    Get payment status
```

---

## 🛍️ **MIGRATE PRODUCTS FROM OLD WEBSITE**

### **Option 1: Manual Export/Import**

#### **Step 1: Export from Shopier**

1. Go to https://www.shopier.com/panel
2. Navigate to **Products** section
3. Export products to CSV/Excel

#### **Step 2: Format for Bulk Upload**

Convert to this JSON format:

```json
{
  "products": [
    {
      "name": "Product Name",
      "description": "Product description",
      "price": 29.99,
      "stock": 50,
      "category_id": 1,
      "image_url": "https://example.com/image.jpg",
      "is_featured": false
    }
  ]
}
```

#### **Step 3: Bulk Upload**

```bash
curl -X POST https://greenart81-backend.onrender.com/api/admin/products/bulk-upload \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d @products.json
```

---

### **Option 2: Automated Script (Recommended)**

I'll create a script to fetch and migrate products:

```javascript
// scripts/migrate-shopier-products.js
const axios = require('axios');
const pool = require('../config/database');

async function migrateProducts() {
  try {
    // Fetch products from old Shopier site
    // Note: Shopier doesn't have a direct API to fetch all products
    // You'll need to either:
    // 1. Export manually and use this script to import
    // 2. Scrape from your old website (if public)

    const products = [
      // Paste your products here or load from file
    ];

    for (const product of products) {
      await pool.query(
        `INSERT INTO products (name, description, price, stock, category_id, image_url)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (name) DO UPDATE
         SET price = EXCLUDED.price, stock = EXCLUDED.stock`,
        [
          product.name,
          product.description,
          product.price,
          product.stock,
          product.category_id,
          product.image_url
        ]
      );
    }

    console.log(`Migrated ${products.length} products successfully!`);
  } catch (error) {
    console.error('Migration error:', error);
  }
}

migrateProducts();
```

---

## 📸 **MIGRATE PRODUCT IMAGES**

### **Option 1: Use Existing Image URLs**

If images are hosted on Shopier CDN, just use the URLs directly.

### **Option 2: Upload to Cloud Storage**

Recommended cloud storage options:
- **Cloudinary** (free tier)
- **AWS S3**
- **ImgBB** (free)

### **Quick Image Upload with ImgBB:**

```javascript
const FormData = require('form-data');
const fs = require('fs');

async function uploadImage(imagePath) {
  const formData = new FormData();
  formData.append('image', fs.createReadStream(imagePath));

  const response = await axios.post(
    'https://api.imgbb.com/1/upload?key=YOUR_IMGBB_API_KEY',
    formData
  );

  return response.data.data.url;
}
```

---

## 🔧 **COMPLETE IMPLEMENTATION STEPS**

### **1. Deploy Payment Integration**

```bash
# Commit and push
git add .
git commit -m "Add Shopier payment integration"
git push origin main

# Render will auto-deploy (wait 2-3 minutes)
```

### **2. Add Environment Variables on Render**

Go to Render Dashboard → Your Service → Environment:
- Add `SHOPIER_API_KEY`
- Add `SHOPIER_API_SECRET`
- Add `API_URL`

### **3. Run Database Migration**

Create payment_transactions table (use Render Shell or SQL client)

### **4. Test Payment Flow**

```bash
# Create test order first, then:
curl -X POST https://greenart81-backend.onrender.com/api/payment/initialize \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"orderId": 1}'
```

### **5. Import Products**

Use bulk upload endpoint with your product data.

---

## 📋 **CHECKLIST**

**Shopier Integration:**
- [ ] Get Shopier API credentials
- [ ] Add to environment variables
- [ ] Deploy code to Render
- [ ] Run database migration
- [ ] Configure callback URL in Shopier panel
- [ ] Test payment flow

**Product Migration:**
- [ ] Export products from Shopier
- [ ] Format as JSON
- [ ] Use bulk upload API
- [ ] Verify all products imported
- [ ] Upload/link product images

---

## 🎨 **FRONTEND INTEGRATION**

### **Checkout Page Changes:**

```javascript
// After creating order
const handlePayment = async (orderId) => {
  try {
    // Initialize Shopier payment
    const response = await api.post('/payment/initialize', { orderId });
    const { paymentForm, shopierUrl } = response.data.data;

    // Create form and submit to Shopier
    const form = createPaymentForm(shopierUrl, paymentForm);
    form.submit(); // Redirects to Shopier
  } catch (error) {
    console.error('Payment error:', error);
  }
};

function createPaymentForm(action, data) {
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = action;

  Object.keys(data).forEach(key => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = key;
    input.value = data[key];
    form.appendChild(input);
  });

  document.body.appendChild(form);
  return form;
}
```

### **Payment Success Page:**

After payment, Shopier redirects to your success URL. Show:
- Order confirmation
- Payment status
- Order details

---

## 🆘 **TROUBLESHOOTING**

### **Payment Not Working:**
1. Check Shopier API credentials
2. Verify callback URL in Shopier panel
3. Check server logs for errors
4. Ensure signature generation is correct

### **Products Not Importing:**
1. Check JSON format
2. Verify category IDs exist
3. Check admin token is valid
4. Review server error logs

---

## 📞 **NEXT STEPS**

1. **Get Shopier credentials** from your Shopier panel
2. **Add to Render environment variables**
3. **Test payment flow** with small amount
4. **Export your existing products**
5. **Import using bulk upload API**

---

**Your Shopier integration is ready! Just add your credentials and deploy!** 🚀
