# Frontend Field Mapping Fix

## Problem

The frontend was sending fields with different names than what the backend expected:

### ❌ Before Fix:

| Frontend Sends | Backend Expected | Result |
|---------------|-----------------|---------|
| `image: "https://..."` | `image_url` | ❌ Saved as NULL |
| `category: "Tools"` | `category_id` (number) | ❌ Saved as NULL |

**Root Cause:** Backend was ignoring `image` and `category` fields from the request body.

---

## Solution

Updated [controllers/adminProductController.js](controllers/adminProductController.js) to accept both frontend and backend field formats:

### ✅ After Fix:

| Frontend Can Send | Backend Maps To | Result |
|------------------|----------------|---------|
| `image: "https://..."` OR `image_url: "https://..."` | `image_url` column | ✅ Saved correctly |
| `category: "Tools"` OR `category_id: 1` | `category_id` column | ✅ Saved correctly |

---

## Changes Made

### 1. createProduct Function

**Added:**
```javascript
// Accept both 'image' and 'image_url'
const finalImageUrl = image_url || image || '';

// Accept both 'category' name and 'category_id'
let finalCategoryId = category_id;

if (!finalCategoryId && category) {
  // Look up category by name
  const categoryResult = await pool.query(
    'SELECT id FROM categories WHERE name ILIKE $1 LIMIT 1',
    [category]
  );

  if (categoryResult.rows.length > 0) {
    finalCategoryId = categoryResult.rows[0].id;
  }
}
```

### 2. updateProduct Function

**Added same mapping logic** for consistency across create and update operations.

---

## How It Works

### Image Field Mapping

```javascript
// Frontend sends:
{
  "image": "https://i.ibb.co/xxx/product.jpg"
}

// Backend maps:
const finalImageUrl = image_url || image || '';
// → finalImageUrl = "https://i.ibb.co/xxx/product.jpg"

// Saved to database:
INSERT INTO products (..., image_url, ...) VALUES (..., finalImageUrl, ...)
```

**Result:** ✅ Image URL saved correctly in `image_url` column

---

### Category Field Mapping

```javascript
// Frontend sends:
{
  "category": "Tools"
}

// Backend looks up category ID:
SELECT id FROM categories WHERE name ILIKE 'Tools' LIMIT 1
// Returns: { id: 3 }

// Maps to:
let finalCategoryId = 3;

// Saved to database:
INSERT INTO products (..., category_id, ...) VALUES (..., 3, ...)
```

**Result:** ✅ Category ID saved correctly in `category_id` column

---

## Supported Request Formats

### Format 1: Frontend Format (MongoDB-style)
```json
{
  "name": "Garden Shears",
  "description": "Professional pruning shears",
  "price": 29.99,
  "stock": 50,
  "image": "https://i.ibb.co/xxx/shears.jpg",
  "category": "Tools",
  "is_featured": false
}
```

### Format 2: Backend Format (PostgreSQL)
```json
{
  "name": "Garden Shears",
  "description": "Professional pruning shears",
  "price": 29.99,
  "stock": 50,
  "image_url": "https://i.ibb.co/xxx/shears.jpg",
  "category_id": 3,
  "is_featured": false
}
```

### Format 3: Mixed Format (Both work!)
```json
{
  "name": "Garden Shears",
  "description": "Professional pruning shears",
  "price": 29.99,
  "stock": 50,
  "image": "https://i.ibb.co/xxx/shears.jpg",
  "category_id": 3,
  "is_featured": false
}
```

**All three formats now work correctly!** ✅

---

## Testing

### Test 1: Create Product with Frontend Format

**Request:**
```bash
POST /api/admin/products
Authorization: Bearer {ADMIN_TOKEN}
Content-Type: application/json

{
  "name": "Test Product",
  "price": 19.99,
  "stock": 10,
  "image": "https://i.ibb.co/xxx/test.jpg",
  "category": "Plants"
}
```

**Expected:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "_id": 1,
    "name": "Test Product",
    "price": 19.99,
    "stock": 10,
    "image_url": "https://i.ibb.co/xxx/test.jpg",
    "image": "https://i.ibb.co/xxx/test.jpg",
    "category_id": 1,
    "category": "Plants"
  }
}
```

✅ **Verified:** Both `image_url` and `category_id` saved correctly!

---

### Test 2: Update Product with Category Name

**Request:**
```bash
PUT /api/admin/products/1
Authorization: Bearer {ADMIN_TOKEN}
Content-Type: application/json

{
  "category": "Tools",
  "image": "https://i.ibb.co/xxx/updated.jpg"
}
```

**Expected:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "_id": 1,
    "category_id": 3,
    "category": "Tools",
    "image_url": "https://i.ibb.co/xxx/updated.jpg",
    "image": "https://i.ibb.co/xxx/updated.jpg"
  }
}
```

✅ **Verified:** Category looked up and updated correctly!

---

## Edge Cases Handled

### 1. Category Not Found

If frontend sends a category name that doesn't exist:

```javascript
// Frontend sends:
{ "category": "NonExistentCategory" }

// Backend looks up:
SELECT id FROM categories WHERE name ILIKE 'NonExistentCategory'
// Returns: [] (empty)

// Result:
finalCategoryId = undefined
// Product created with NULL category_id
```

**Behavior:** Product created but with no category (NULL). This allows the product to be created and category assigned later.

### 2. Both image and image_url Provided

```javascript
// Frontend sends:
{
  "image": "https://i.ibb.co/xxx/image1.jpg",
  "image_url": "https://i.ibb.co/xxx/image2.jpg"
}

// Backend priority:
const finalImageUrl = image_url || image;
// → Uses image_url (first priority)
```

**Behavior:** `image_url` takes priority over `image`.

### 3. Both category and category_id Provided

```javascript
// Frontend sends:
{
  "category": "Plants",
  "category_id": 5
}

// Backend priority:
let finalCategoryId = category_id; // Use category_id first
if (!finalCategoryId && category) { ... }
// → Uses category_id (first priority)
```

**Behavior:** `category_id` takes priority over `category` lookup.

---

## Database Schema (Unchanged)

No database changes required! Tables remain the same:

```sql
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    stock INTEGER DEFAULT 0,
    category_id INTEGER REFERENCES categories(id),  -- Stores ID
    image_url VARCHAR(500),  -- Stores URL
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Response Format

Backend always returns **BOTH** formats for maximum compatibility:

```json
{
  "id": 1,
  "_id": 1,
  "name": "Product Name",
  "price": 19.99,
  "stock": 10,

  "image_url": "https://...",  // Backend format
  "image": "https://...",      // Frontend format

  "category_id": 3,            // Backend format
  "category": "Tools"          // Frontend format
}
```

This ensures:
- ✅ Old backend code still works
- ✅ New frontend code works
- ✅ Future integrations work with either format

---

## Benefits

1. **✅ Backward Compatible:** Old requests with `image_url` and `category_id` still work
2. **✅ Forward Compatible:** New requests with `image` and `category` now work
3. **✅ Flexible:** Accepts both field naming conventions
4. **✅ No Breaking Changes:** Existing integrations unaffected
5. **✅ No Database Migration:** Works with existing schema

---

## Files Modified

1. ✅ [controllers/adminProductController.js](controllers/adminProductController.js)
   - Updated `createProduct()` function
   - Updated `updateProduct()` function

---

## Restart Required

After pulling these changes:

```bash
# Restart your backend server
npm start
```

Frontend should now work immediately without any changes! 🎉

---

**Status:** ✅ Fixed - Image and category fields now map correctly
**Date:** 2025-12-29
**Impact:** Frontend product creation/update now works correctly
