# Discount Fields Not Saving - Issue Analysis

## 🔍 Problem Identified

**Issue:** When frontend sends `discount_percentage: 10` and `is_on_sale: true`, they are NOT being saved to the database.

## Root Cause

The UPDATE query uses `COALESCE()` which has a critical flaw for discount fields:

```sql
UPDATE products
SET discount_percentage = COALESCE($9, discount_percentage),
    is_on_sale = COALESCE($10, is_on_sale)
```

### Why This Fails:

**Scenario 1: Setting discount to 0 or false**
```javascript
// Frontend sends:
{ discount_percentage: 0, is_on_sale: false }

// COALESCE($9, discount_percentage) treats:
// - 0 as NULL/falsy → keeps old value
// - false as NULL/falsy → keeps old value

// Result: Values NOT updated! ❌
```

**Scenario 2: Partial updates**
```javascript
// Frontend sends only:
{ name: "New Name" }

// discount_percentage is undefined in request
// COALESCE(undefined, discount_percentage) → keeps old value ✅

// This works correctly
```

### The Problem with COALESCE:

`COALESCE($param, old_value)` returns:
- `$param` if it's NOT NULL
- `old_value` if `$param` IS NULL

**BUT:** JavaScript's `undefined` becomes `NULL` in SQL, while `0` and `false` are valid values!

In the current code:
- `discount_percentage = 0` → SQL parameter is `0` (not NULL)
- `is_on_sale = false` → SQL parameter is `false` (not NULL)

**These SHOULD work!** Let me check if there's another issue...

## 🧪 Testing Required

The issue might be:
1. Frontend sending camelCase (`discountPercentage`) instead of snake_case (`discount_percentage`)
2. Frontend not sending the fields at all
3. SQL type mismatch (sending string instead of number/boolean)

## 🔧 Solution Options

### Option A: Accept Both Field Name Formats

Update the controller to normalize both camelCase and snake_case:

```javascript
const updateProduct = async (req, res) => {
  const { id } = req.params;

  // Normalize both naming conventions
  const discount_percentage = req.body.discount_percentage ?? req.body.discountPercentage;
  const is_on_sale = req.body.is_on_sale ?? req.body.isOnSale;
  const sale_start_date = req.body.sale_start_date ?? req.body.saleStartDate;
  const sale_end_date = req.body.sale_end_date ?? req.body.saleEndDate;

  // ... rest of code
};
```

### Option B: Fix UPDATE Query for Boolean/Zero Values

Replace `COALESCE` with explicit NULL checks:

```sql
UPDATE products
SET discount_percentage = CASE WHEN $9 IS NOT NULL THEN $9 ELSE discount_percentage END,
    is_on_sale = CASE WHEN $10 IS NOT NULL THEN $10 ELSE is_on_sale END
```

But this is complex. Better solution:

### Option C: ✅ Recommended - Build Dynamic UPDATE Query

Only update fields that are actually provided:

```javascript
const updates = [];
const values = [];
let valueIndex = 1;

if (discount_percentage !== undefined) {
  updates.push(`discount_percentage = $${valueIndex++}`);
  values.push(parseFloat(discount_percentage) || 0);
}

if (is_on_sale !== undefined) {
  updates.push(`is_on_sale = $${valueIndex++}`);
  values.push(Boolean(is_on_sale));
}

const query = `UPDATE products SET ${updates.join(', ')} WHERE id = $${valueIndex}`;
values.push(id);
```

## 📋 Next Steps

1. ✅ First, verify what the frontend is actually sending
2. ✅ Add logging to see the exact values received
3. ✅ Check if it's a naming issue (camelCase vs snake_case)
4. ✅ Implement the fix based on findings
