# Discount System - API Endpoints Reference

## 📍 Complete API List for Discount Features

---

## 1. Admin: Create Product with Discount

**Endpoint:** `POST https://greenart81-backend.onrender.com/api/admin/products`

**Headers:**
```json
{
  "Authorization": "Bearer <admin_token>",
  "Content-Type": "application/json"
}
```

**Request Body:**
```json
{
  "name": "Product Name",
  "description": "Product description",
  "price": 100,
  "stock": 50,
  "category": "Category Name",
  "image_url": "https://cloudinary.com/image.jpg",
  "is_featured": false,
  "use_as_slider": false,

  "discount_percentage": 20,
  "is_on_sale": true,
  "sale_start_date": "2026-01-15T00:00:00.000Z",
  "sale_end_date": "2026-02-15T23:59:59.000Z"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "id": 19,
    "name": "Product Name",
    "price": 100,
    "originalPrice": 100,
    "salePrice": 80,
    "discountPercentage": 20,
    "discountAmount": 20,
    "isOnSale": true,
    "discount_percentage": 20,
    "is_on_sale": true,
    "sale_start_date": "2026-01-15T00:00:00.000Z",
    "sale_end_date": "2026-02-15T23:59:59.000Z"
  }
}
```

---

## 2. Admin: Update Product with Discount

**Endpoint:** `PUT https://greenart81-backend.onrender.com/api/admin/products/:id`

**Headers:**
```json
{
  "Authorization": "Bearer <admin_token>",
  "Content-Type": "application/json"
}
```

**Request Body (partial update):**
```json
{
  "discount_percentage": 30,
  "is_on_sale": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Product updated successfully",
  "data": {
    "id": 14,
    "name": "Gül kapaklı mumluk veya takı kutusu",
    "price": 105,
    "originalPrice": 105,
    "salePrice": 73.5,
    "discountPercentage": 30,
    "discountAmount": 31.5,
    "isOnSale": true
  }
}
```

---

## 3. Admin: Get All Products (with discount data)

**Endpoint:** `GET https://greenart81-backend.onrender.com/api/admin/products?page=1&limit=20`

**Headers:**
```json
{
  "Authorization": "Bearer <admin_token>"
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 14,
      "name": "Product",
      "price": 105,
      "originalPrice": 105,
      "salePrice": 84,
      "discountPercentage": 20,
      "discountAmount": 21,
      "isOnSale": true,
      "discount_percentage": 20,
      "is_on_sale": true
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 18,
    "totalPages": 1
  }
}
```

---

## 4. Customer: Get All Products (with discount data)

**Endpoint:** `GET https://greenart81-backend.onrender.com/api/products`

**No authentication required**

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 14,
      "name": "Product",
      "price": 105,
      "originalPrice": 105,
      "salePrice": 84,
      "discountPercentage": 20,
      "discountAmount": 21,
      "isOnSale": true
    }
  ]
}
```

---

## 5. Customer: Get Single Product (with discount data)

**Endpoint:** `GET https://greenart81-backend.onrender.com/api/products/:id`

**No authentication required**

**Example:** `GET https://greenart81-backend.onrender.com/api/products/14`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 14,
    "name": "Gül kapaklı mumluk veya takı kutusu",
    "description": "Product description",
    "price": 105,
    "originalPrice": 105,
    "salePrice": 84,
    "discountPercentage": 20,
    "discountAmount": 21,
    "isOnSale": true,
    "discount_percentage": 20,
    "is_on_sale": true,
    "sale_start_date": null,
    "sale_end_date": null,
    "stock": 50,
    "category": "Category Name",
    "image": "https://cloudinary.com/image.jpg",
    "images": []
  }
}
```

---

## 6. Customer: Get Products by Category (with discount)

**Endpoint:** `GET https://greenart81-backend.onrender.com/api/products/category/:categoryId`

**No authentication required**

**Response:** Same structure as "Get All Products"

---

## 7. Customer: Search Products (with discount)

**Endpoint:** `GET https://greenart81-backend.onrender.com/api/search?q=product+name`

**No authentication required**

**Response:** Same structure as "Get All Products"

---

## 8. Quick Toggle Sale Status

**Endpoint:** `PUT https://greenart81-backend.onrender.com/api/admin/products/:id`

**Headers:**
```json
{
  "Authorization": "Bearer <admin_token>",
  "Content-Type": "application/json"
}
```

**Request Body (only toggle sale status):**
```json
{
  "is_on_sale": true
}
```

**Or turn off:**
```json
{
  "is_on_sale": false
}
```

---

## ✅ Field Mapping Summary

| Request Field | Database Field | Type | Default | Required |
|--------------|---------------|------|---------|----------|
| `discount_percentage` | `discount_percentage` | DECIMAL(5,2) | 0 | No |
| `is_on_sale` | `is_on_sale` | BOOLEAN | false | No |
| `sale_start_date` | `sale_start_date` | TIMESTAMP | null | No |
| `sale_end_date` | `sale_end_date` | TIMESTAMP | null | No |

---

## 🔥 Common Use Cases

### Use Case 1: Set 20% Discount
```bash
curl -X PUT https://greenart81-backend.onrender.com/api/admin/products/14 \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "discount_percentage": 20,
    "is_on_sale": true
  }'
```

### Use Case 2: 24-Hour Flash Sale
```javascript
const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);

await axios.put(`https://greenart81-backend.onrender.com/api/admin/products/14`, {
  discount_percentage: 50,
  is_on_sale: true,
  sale_start_date: new Date().toISOString(),
  sale_end_date: tomorrow.toISOString()
}, {
  headers: { 'Authorization': `Bearer ${adminToken}` }
});
```

### Use Case 3: Remove Discount
```javascript
await axios.put(`https://greenart81-backend.onrender.com/api/admin/products/14`, {
  discount_percentage: 0,
  is_on_sale: false
}, {
  headers: { 'Authorization': `Bearer ${adminToken}` }
});
```

---

## ⚠️ Important Notes

1. **Date Validation:** If `sale_start_date` is in the future, the discount won't be active yet
2. **Date Expiration:** If `sale_end_date` is in the past, the discount is automatically deactivated
3. **Both Fields Required:** You must set BOTH `discount_percentage` AND `is_on_sale: true` for the sale to work
4. **Automatic Calculation:** Backend automatically calculates `salePrice` and `discountAmount` - you don't send these
5. **All Endpoints Include Discount:** Every product endpoint (GET, POST, PUT) returns discount information

---

## 🧪 Test the Discount System

Test with product ID 14:

```bash
# 1. Set 20% discount
curl -X PUT https://greenart81-backend.onrender.com/api/admin/products/14 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"discount_percentage": 20, "is_on_sale": true}'

# 2. Get product to verify
curl https://greenart81-backend.onrender.com/api/products/14

# Expected response:
# "price": 105,
# "salePrice": 84,
# "discountPercentage": 20,
# "discountAmount": 21,
# "isOnSale": true
```
