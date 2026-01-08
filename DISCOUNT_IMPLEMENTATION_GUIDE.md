# Discount & Sale Price Implementation Guide

## ✅ What's Been Added

### Database Fields (in `products` table)
- `discount_percentage` - Discount % (0-100)
- `discount_price` - Optional pre-calculated sale price
- `is_on_sale` - Boolean flag for active sales
- `sale_start_date` - Optional sale start date
- `sale_end_date` - Optional sale end date

### API Auto-Calculation
All product APIs now automatically return:
- `originalPrice` - Original full price
- `salePrice` - Discounted price (auto-calculated)
- `discountPercentage` - Active discount %
- `discountAmount` - Amount saved
- `isOnSale` - Is currently on sale

---

## 📊 How It Works

### Automatic Calculation

**Backend automatically calculates:**
```
salePrice = price × (1 - discountPercentage / 100)

Example:
- Original price: $100
- Discount: 20%
- Sale price: $100 × (1 - 20/100) = $80
- Amount saved: $20
```

**Date-based sales:**
- If `sale_start_date` is set and hasn't arrived → discount not active
- If `sale_end_date` is set and has passed → discount not active
- Backend checks dates automatically

---

## 🔧 Admin Panel Implementation

### 1. Add Discount Fields to Product Form

```jsx
// Add to your ProductForm component
<div>
  <label>Discount Percentage (%):</label>
  <input
    type="number"
    min="0"
    max="100"
    step="0.01"
    value={productData.discountPercentage || 0}
    onChange={(e) => setProductData({
      ...productData,
      discountPercentage: parseFloat(e.target.value) || 0
    })}
  />
</div>

<div>
  <label>
    <input
      type="checkbox"
      checked={productData.isOnSale || false}
      onChange={(e) => setProductData({
        ...productData,
        isOnSale: e.target.checked
      })}
    />
    Mark as On Sale
  </label>
</div>

{/* Optional: Sale dates */}
<div>
  <label>Sale Start Date (optional):</label>
  <input
    type="datetime-local"
    value={productData.saleStartDate || ''}
    onChange={(e) => setProductData({
      ...productData,
      saleStartDate: e.target.value
    })}
  />
</div>

<div>
  <label>Sale End Date (optional):</label>
  <input
    type="datetime-local"
    value={productData.saleEndDate || ''}
    onChange={(e) => setProductData({
      ...productData,
      saleEndDate: e.target.value
    })}
  />
</div>

{/* Show preview */}
{productData.price && productData.discountPercentage > 0 && productData.isOnSale && (
  <div style={{ padding: '10px', background: '#e8f5e9', borderRadius: '4px' }}>
    <p><strong>Price Preview:</strong></p>
    <p>Original: ${parseFloat(productData.price).toFixed(2)}</p>
    <p>Sale: ${(productData.price * (1 - productData.discountPercentage / 100)).toFixed(2)}</p>
    <p>You save: ${(productData.price * productData.discountPercentage / 100).toFixed(2)} ({productData.discountPercentage}% off)</p>
  </div>
)}
```

---

### 2. Update Product Creation API Call

```javascript
const createProduct = async (productData, adminToken) => {
  const response = await axios.post(
    'https://greenart81-backend.onrender.com/api/admin/products',
    {
      name: productData.name,
      description: productData.description,
      price: productData.price,
      stock: productData.stock,
      category: productData.category,
      image_url: productData.image_url,
      is_featured: productData.isFeatured || false,
      use_as_slider: productData.useAsSlider || false,

      // NEW: Discount fields
      discount_percentage: productData.discountPercentage || 0,
      is_on_sale: productData.isOnSale || false,
      sale_start_date: productData.saleStartDate || null,
      sale_end_date: productData.saleEndDate || null
    },
    {
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }
    }
  );

  return response.data.data;
};
```

---

### 3. Update Product Update API Call

```javascript
const updateProduct = async (productId, productData, adminToken) => {
  const response = await axios.put(
    `https://greenart81-backend.onrender.com/api/admin/products/${productId}`,
    {
      name: productData.name,
      description: productData.description,
      price: productData.price,
      stock: productData.stock,
      category: productData.category,
      image_url: productData.image_url,
      is_featured: productData.isFeatured,
      use_as_slider: productData.useAsSlider,

      // NEW: Discount fields
      discount_percentage: productData.discountPercentage,
      is_on_sale: productData.isOnSale,
      sale_start_date: productData.saleStartDate,
      sale_end_date: productData.saleEndDate
    },
    {
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }
    }
  );

  return response.data.data;
};
```

---

### 4. Display in Product List (Admin)

```jsx
const ProductList = () => {
  const [products, setProducts] = useState([]);

  // ... fetch products

  return (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Price</th>
          <th>Sale Price</th>
          <th>Discount</th>
          <th>On Sale</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {products.map(product => (
          <tr key={product.id}>
            <td>{product.name}</td>
            <td>${product.originalPrice.toFixed(2)}</td>
            <td>
              {product.isOnSale ? (
                <span style={{ color: 'red', fontWeight: 'bold' }}>
                  ${product.salePrice.toFixed(2)}
                </span>
              ) : (
                <span>${product.salePrice.toFixed(2)}</span>
              )}
            </td>
            <td>
              {product.isOnSale && product.discountPercentage > 0 ? (
                <span style={{ background: '#ff5252', color: 'white', padding: '2px 8px', borderRadius: '4px' }}>
                  {product.discountPercentage}% OFF
                </span>
              ) : (
                '-'
              )}
            </td>
            <td>
              {product.isOnSale ? (
                <span style={{ color: 'green' }}>✓ Yes</span>
              ) : (
                <span style={{ color: 'gray' }}>No</span>
              )}
            </td>
            <td>
              <button onClick={() => handleEdit(product.id)}>Edit</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
```

---

### 5. Quick Discount Toggle

```jsx
// Add quick toggle in product list
const toggleDiscount = async (productId, currentStatus) => {
  await axios.put(
    `https://greenart81-backend.onrender.com/api/admin/products/${productId}`,
    {
      is_on_sale: !currentStatus
    },
    {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    }
  );

  // Refresh list
  loadProducts();
};

// In your table
<button onClick={() => toggleDiscount(product.id, product.isOnSale)}>
  {product.isOnSale ? 'Deactivate Sale' : 'Activate Sale'}
</button>
```

---

## 🎨 Frontend Display (Customer View)

### Product Card

```jsx
const ProductCard = ({ product }) => {
  return (
    <div className="product-card">
      {product.isOnSale && (
        <div className="sale-badge">
          {product.discountPercentage}% OFF
        </div>
      )}

      <img src={product.image} alt={product.name} />

      <h3>{product.name}</h3>

      <div className="price-container">
        {product.isOnSale ? (
          <>
            <span className="original-price" style={{ textDecoration: 'line-through', color: '#999' }}>
              ${product.originalPrice.toFixed(2)}
            </span>
            <span className="sale-price" style={{ color: '#ff5252', fontWeight: 'bold', fontSize: '1.2em' }}>
              ${product.salePrice.toFixed(2)}
            </span>
            <span className="savings" style={{ color: '#4caf50' }}>
              Save ${product.discountAmount.toFixed(2)}
            </span>
          </>
        ) : (
          <span className="regular-price">
            ${product.price.toFixed(2)}
          </span>
        )}
      </div>
    </div>
  );
};
```

### Product Detail Page

```jsx
const ProductDetail = ({ product }) => {
  return (
    <div>
      {product.isOnSale && (
        <div className="sale-banner" style={{ background: '#ff5252', color: 'white', padding: '10px', marginBottom: '20px' }}>
          🔥 LIMITED TIME SALE - {product.discountPercentage}% OFF!
        </div>
      )}

      <h1>{product.name}</h1>

      <div className="price-section">
        {product.isOnSale ? (
          <div>
            <div className="sale-price" style={{ fontSize: '2em', color: '#ff5252', fontWeight: 'bold' }}>
              ${product.salePrice.toFixed(2)}
            </div>
            <div className="original-price" style={{ fontSize: '1.2em', textDecoration: 'line-through', color: '#999' }}>
              ${product.originalPrice.toFixed(2)}
            </div>
            <div className="savings" style={{ background: '#e8f5e9', padding: '8px', borderRadius: '4px', color: '#2e7d32' }}>
              ✓ You save ${product.discountAmount.toFixed(2)} ({product.discountPercentage}% discount)
            </div>
          </div>
        ) : (
          <div className="regular-price" style={{ fontSize: '2em', fontWeight: 'bold' }}>
            ${product.price.toFixed(2)}
          </div>
        )}
      </div>
    </div>
  );
};
```

---

## 📝 API Response Example

```javascript
GET /api/products/14

{
  "success": true,
  "data": {
    "id": 14,
    "name": "Product Name",
    "price": 100,              // Original price
    "originalPrice": 100,      // Same as price
    "salePrice": 80,           // Calculated: 100 * (1 - 20/100)
    "discountPercentage": 20,  // 20% off
    "discountAmount": 20,      // You save $20
    "isOnSale": true,          // Currently on sale
    "discount_percentage": 20, // Raw database value
    "is_on_sale": true,        // Raw database value
    "sale_start_date": null,
    "sale_end_date": null,
    // ... other fields
  }
}
```

---

## 🔥 Quick Start Examples

### Example 1: Set 20% Discount

```bash
# SQL
UPDATE products SET discount_percentage = 20, is_on_sale = true WHERE id = 14;

# Or via API
PUT /api/admin/products/14
{
  "discount_percentage": 20,
  "is_on_sale": true
}
```

### Example 2: Flash Sale (24 hours)

```javascript
await axios.put(`/api/admin/products/${productId}`, {
  discount_percentage: 50,
  is_on_sale: true,
  sale_start_date: new Date().toISOString(),
  sale_end_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
});
```

### Example 3: Remove Discount

```javascript
await axios.put(`/api/admin/products/${productId}`, {
  discount_percentage: 0,
  is_on_sale: false
});
```

---

## ✅ Summary

**What you need to add in Admin Panel:**

1. ✅ **Form fields:**
   - Discount percentage input (0-100)
   - "On Sale" checkbox
   - Optional: Sale start/end date pickers
   - Preview of sale price

2. ✅ **Product list:**
   - Show original price
   - Show sale price (if on sale)
   - Show discount badge
   - Quick toggle for sale status

3. ✅ **API calls:**
   - Include discount fields in create/update
   - All fields optional (default 0/false)

**No backend changes needed - everything auto-calculates!** 🎉
