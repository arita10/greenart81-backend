# Field Mapping Fix - Frontend Compatibility

## Issue Summary
The frontend was expecting MongoDB-style field names, but the backend uses PostgreSQL with different field naming conventions.

## Fixed Fields Mapping

### Frontend Expected vs Backend Database

| Frontend Field | Backend Database Field | Transformation |
|---------------|----------------------|----------------|
| `_id` | `id` | Added as alias |
| `image` | `image_url` | Mapped in response |
| `stock` | `stock` | Direct mapping |
| `category` | `category_name` | Mapped from JOIN |
| `price` | `price` | Converted to number |

## Changes Made

### 1. Product Controller ([controllers/productController.js](controllers/productController.js))

Added `transformProduct()` helper function that transforms PostgreSQL product data to frontend-compatible format:

```javascript
const transformProduct = (product) => {
  return {
    ...product,
    _id: product.id, // MongoDB-style ID
    image: product.image_url || '', // Map image_url to image
    stock: product.stock || 0, // Ensure stock exists
    category: product.category_name || product.category || '', // Category as string
    price: parseFloat(product.price) || 0 // Ensure price is number
  };
};
```

**Applied to all product endpoints:**
- ✅ `GET /api/products` - All products
- ✅ `GET /api/products/:id` - Single product
- ✅ `GET /api/products/category/:category` - Products by category
- ✅ `GET /api/products/featured` - Featured products
- ✅ `GET /api/products/sliders` - Slider products (newly added)
- ✅ `GET /api/search` - Search results

### 2. Admin Product Controller ([controllers/adminProductController.js](controllers/adminProductController.js))

Added same `transformProduct()` helper function.

**Applied to admin endpoints:**
- ✅ `GET /api/admin/products` - All products (admin view)
- ✅ `POST /api/admin/products` - Create product
- ✅ `PUT /api/admin/products/:id` - Update product

**Additional improvements:**
- Accepts both `image_url` and `image` fields in request body
- Returns transformed product with category name
- Ensures all required fields are present in response

### 3. New Slider Endpoint

Added missing `/api/products/sliders` endpoint that was causing 500 errors:

**Route:** `GET /api/products/sliders`
**Query Params:** `?limit=5` (default)
**Returns:** Featured products or latest products for homepage slider

## Response Format Examples

### Before (PostgreSQL format)
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Product Name",
    "price": "199.00",
    "stock": 10,
    "image_url": "https://i.ibb.co/xxx/image.jpg",
    "category_name": "Plants"
  }
}
```

### After (Frontend-compatible format)
```json
{
  "success": true,
  "data": {
    "id": 1,
    "_id": 1,
    "name": "Product Name",
    "price": 199.00,
    "stock": 10,
    "image_url": "https://i.ibb.co/xxx/image.jpg",
    "image": "https://i.ibb.co/xxx/image.jpg",
    "category_name": "Plants",
    "category": "Plants"
  }
}
```

## Database Schema (No Changes Required)

The PostgreSQL schema remains unchanged:

```sql
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    stock INTEGER DEFAULT 0,  -- ✅ Already using 'stock'
    category_id INTEGER REFERENCES categories(id),
    image_url VARCHAR(500),   -- ✅ Mapped to 'image' in response
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Frontend Compatibility

Now all product responses include:

- ✅ `_id` field (MongoDB-style ID)
- ✅ `image` field (string URL)
- ✅ `stock` field (number)
- ✅ `category` field (string)
- ✅ `price` field (number, not string)

## Testing

### Test the fix:

1. **Get Products:**
```bash
curl http://localhost:5000/api/products
```

**Verify response includes:** `_id`, `image`, `stock`, `category`, `price`

2. **Get Slider Products:**
```bash
curl http://localhost:5000/api/products/sliders
```

**Should return:** 200 OK (not 500 error)

3. **Create Product (Admin):**
```bash
curl -X POST http://localhost:5000/api/admin/products \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Product",
    "price": 99.99,
    "stock": 50,
    "image": "https://i.ibb.co/xxx/image.jpg",
    "category_id": 1
  }'
```

**Should work with both** `image` or `image_url` field names.

## Error Fixes

### 1. ✅ Fixed: 500 Error on `/api/products/sliders`
**Cause:** Endpoint didn't exist
**Fix:** Added `getSliderProducts` controller and route

### 2. ✅ Fixed: Frontend `Cannot read properties of undefined (reading 'slice')`
**Cause:** Frontend expected `image` field but received `image_url` (or null)
**Fix:** Transform function ensures `image` field always exists as string

### 3. ✅ Fixed: Missing `_id` field
**Cause:** PostgreSQL uses `id`, MongoDB uses `_id`
**Fix:** Added `_id` as alias to `id` in all responses

### 4. ✅ Fixed: Category not showing
**Cause:** Frontend expected `category` string, backend returned `category_id` number
**Fix:** Joined with categories table and mapped `category_name` to `category`

### 5. ✅ Fixed: Price as string instead of number
**Cause:** PostgreSQL DECIMAL returns as string
**Fix:** `parseFloat(product.price)` in transform function

## Migration Notes

**No database migration required!** This is a response transformation only.

The changes are backward compatible:
- Old field names still present in response
- New field names added alongside
- Both frontend versions will work

## Restart Required

After pulling these changes, restart your backend:

```bash
npm start
```

No frontend changes required - the frontend will now receive the correct data format!

---

**Status:** ✅ All field mapping issues resolved
**Date:** 2025-12-29
**Files Modified:** 2 controllers, 1 route
