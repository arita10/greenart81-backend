# Multiple Product Images - API Quick Reference

## Overview
Products now support multiple images with a separate `product_images` table. Each product can have up to 10 images with metadata like thumbnails, alt text, and sort order.

## ✅ What Changed

### Product API Responses
All product endpoints now return an `images` array in addition to the single `image` field:

```json
{
  "id": 14,
  "_id": 14,
  "name": "Product Name",
  "image": "https://cloudinary.../primary_image.jpg",  // Primary image (backward compatible)
  "image_url": "https://cloudinary.../primary_image.jpg",  // Same as image
  "images": [  // NEW: Array of all images
    {
      "id": 1,
      "url": "https://cloudinary.../full_size.jpg",
      "thumbUrl": "https://cloudinary.../thumb.jpg",
      "mediumUrl": "https://cloudinary.../medium.jpg",
      "altText": "Product front view",
      "isPrimary": true,
      "sortOrder": 0
    },
    {
      "id": 2,
      "url": "https://cloudinary.../image2.jpg",
      "thumbUrl": "https://cloudinary.../thumb2.jpg",
      "mediumUrl": "https://cloudinary.../medium2.jpg",
      "altText": "Product side view",
      "isPrimary": false,
      "sortOrder": 1
    }
  ],
  "price": 299.99,
  "category": "Decorative",
  // ... other fields
}
```

### Backward Compatibility
- ✅ `image` field still works (shows primary image)
- ✅ `image_url` field still works (shows primary image)
- ✅ Existing frontend code continues to work
- ✅ Old products automatically migrated

---

## 📡 API Endpoints

### 1. Upload Multiple Images (Admin)

**Upload up to 10 product images to Cloudinary**

```http
POST /api/upload/product/multiple
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data
```

**Request:**
```javascript
const formData = new FormData();
files.forEach(file => formData.append('images', file));

const response = await axios.post('/api/upload/product/multiple', formData, {
  headers: {
    'Authorization': `Bearer ${adminToken}`,
    'Content-Type': 'multipart/form-data'
  }
});
```

**Response:**
```json
{
  "success": true,
  "data": {
    "images": [
      {
        "url": "https://res.cloudinary.com/.../product_123_0_image1.jpg",
        "thumbUrl": "https://res.cloudinary.com/.../thumb.jpg",
        "mediumUrl": "https://res.cloudinary.com/.../medium.jpg",
        "sortOrder": 0
      },
      {
        "url": "https://res.cloudinary.com/.../product_123_1_image2.jpg",
        "thumbUrl": "https://res.cloudinary.com/.../thumb.jpg",
        "mediumUrl": "https://res.cloudinary.com/.../medium.jpg",
        "sortOrder": 1
      }
    ],
    "count": 2
  },
  "message": "2 product images uploaded successfully"
}
```

---

### 2. Add Images to Product (Admin)

**Link uploaded images to a product**

```http
POST /api/products/:productId/images
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "images": [
    {
      "url": "https://res.cloudinary.com/.../image1.jpg",
      "thumbUrl": "https://res.cloudinary.com/.../thumb1.jpg",
      "mediumUrl": "https://res.cloudinary.com/.../medium1.jpg",
      "altText": "Front view",
      "isPrimary": true,
      "sortOrder": 0
    },
    {
      "url": "https://res.cloudinary.com/.../image2.jpg",
      "thumbUrl": "https://res.cloudinary.com/.../thumb2.jpg",
      "mediumUrl": "https://res.cloudinary.com/.../medium2.jpg",
      "altText": "Side view",
      "isPrimary": false,
      "sortOrder": 1
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "product_id": 14,
      "image_url": "https://res.cloudinary.com/.../image1.jpg",
      "thumb_url": "https://res.cloudinary.com/.../thumb1.jpg",
      "medium_url": "https://res.cloudinary.com/.../medium1.jpg",
      "alt_text": "Front view",
      "is_primary": true,
      "sort_order": 0,
      "created_at": "2025-01-04T10:00:00Z"
    }
  ],
  "message": "Product images added successfully"
}
```

---

### 3. Get Product Images (Public)

**Get all images for a specific product**

```http
GET /api/products/:productId/images
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "product_id": 14,
      "image_url": "https://res.cloudinary.com/.../image1.jpg",
      "thumb_url": "https://res.cloudinary.com/.../thumb1.jpg",
      "medium_url": "https://res.cloudinary.com/.../medium1.jpg",
      "alt_text": "Front view",
      "is_primary": true,
      "sort_order": 0,
      "created_at": "2025-01-04T10:00:00Z"
    },
    {
      "id": 2,
      "product_id": 14,
      "image_url": "https://res.cloudinary.com/.../image2.jpg",
      "thumb_url": "https://res.cloudinary.com/.../thumb2.jpg",
      "medium_url": "https://res.cloudinary.com/.../medium2.jpg",
      "alt_text": "Side view",
      "is_primary": false,
      "sort_order": 1,
      "created_at": "2025-01-04T10:01:00Z"
    }
  ],
  "message": "Product images retrieved successfully"
}
```

---

### 4. Update Image Metadata (Admin)

**Update image details like alt text, sort order, or set as primary**

```http
PUT /api/products/images/:imageId
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "altText": "Updated alt text",
  "isPrimary": true,
  "sortOrder": 0
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "product_id": 14,
    "image_url": "https://res.cloudinary.com/.../image2.jpg",
    "alt_text": "Updated alt text",
    "is_primary": true,
    "sort_order": 0,
    "updated_at": "2025-01-04T11:00:00Z"
  },
  "message": "Product image updated successfully"
}
```

---

### 5. Delete Image (Admin)

**Delete a specific product image**

```http
DELETE /api/products/images/:imageId
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "data": null,
  "message": "Product image deleted successfully"
}
```

**Auto-behavior:**
- If deleted image was primary, the first remaining image becomes primary
- If no images remain, product's `image_url` is set to null

---

### 6. Reorder Images (Admin)

**Change the display order of images**

```http
PUT /api/products/:productId/images/reorder
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "imageIds": [3, 1, 2]  // New order (image IDs)
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 3,
      "sort_order": 0,
      "image_url": "..."
    },
    {
      "id": 1,
      "sort_order": 1,
      "image_url": "..."
    },
    {
      "id": 2,
      "sort_order": 2,
      "image_url": "..."
    }
  ],
  "message": "Product images reordered successfully"
}
```

---

## 🎯 Frontend Integration Examples

### Example 1: Create Product with Multiple Images

```javascript
// Step 1: Upload images
const uploadImages = async (files) => {
  const formData = new FormData();
  files.forEach(file => formData.append('images', file));

  const response = await axios.post('/api/upload/product/multiple', formData, {
    headers: {
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': 'multipart/form-data'
    }
  });

  return response.data.data.images;
};

// Step 2: Create product
const createProduct = async (productData) => {
  const response = await axios.post('/api/admin/products', productData, {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });

  return response.data.data;
};

// Step 3: Add images to product
const addImagesToProduct = async (productId, uploadedImages) => {
  await axios.post(`/api/products/${productId}/images`, {
    images: uploadedImages.map((img, index) => ({
      url: img.url,
      thumbUrl: img.thumbUrl,
      mediumUrl: img.mediumUrl,
      isPrimary: index === 0, // First image is primary
      sortOrder: index
    }))
  }, {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
};

// Complete workflow
const createProductWithImages = async (productData, imageFiles) => {
  // 1. Upload images
  const uploadedImages = await uploadImages(imageFiles);

  // 2. Create product with first image
  const product = await createProduct({
    ...productData,
    image_url: uploadedImages[0].url
  });

  // 3. Add all images to product
  await addImagesToProduct(product.id, uploadedImages);

  return product;
};
```

---

### Example 2: Display Product Gallery

```jsx
// Product Detail Page
const ProductDetail = ({ productId }) => {
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    const response = await axios.get(`/api/products/${productId}`);
    const productData = response.data.data;
    setProduct(productData);
    setSelectedImage(productData.images[0] || { url: productData.image });
  };

  return (
    <div>
      {/* Main Image Display */}
      <img
        src={selectedImage?.url || product?.image}
        alt={selectedImage?.altText || product?.name}
        className="main-image"
      />

      {/* Thumbnail Gallery */}
      <div className="thumbnails">
        {product?.images?.map((img) => (
          <img
            key={img.id}
            src={img.thumbUrl}
            alt={img.altText}
            onClick={() => setSelectedImage(img)}
            className={selectedImage?.id === img.id ? 'selected' : ''}
          />
        ))}
      </div>

      {/* Fallback for products with only legacy single image */}
      {(!product?.images || product.images.length === 0) && product?.image && (
        <img src={product.image} alt={product.name} />
      )}
    </div>
  );
};
```

---

### Example 3: Admin Image Manager

```jsx
const ProductImageManager = ({ productId }) => {
  const [images, setImages] = useState([]);

  const loadImages = async () => {
    const response = await axios.get(`/api/products/${productId}/images`);
    setImages(response.data.data);
  };

  const setPrimaryImage = async (imageId) => {
    await axios.put(`/api/products/images/${imageId}`, {
      isPrimary: true
    }, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    loadImages();
  };

  const deleteImage = async (imageId) => {
    await axios.delete(`/api/products/images/${imageId}`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    loadImages();
  };

  const reorderImages = async (newOrder) => {
    await axios.put(`/api/products/${productId}/images/reorder`, {
      imageIds: newOrder
    }, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    loadImages();
  };

  return (
    <div>
      {images.map((img) => (
        <div key={img.id} className="image-item">
          <img src={img.thumb_url} alt={img.alt_text} />
          {img.is_primary && <span className="badge">Primary</span>}
          <button onClick={() => setPrimaryImage(img.id)}>Set Primary</button>
          <button onClick={() => deleteImage(img.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
};
```

---

## 🔄 Migration Notes

### For Existing Products
- All existing products with `image_url` have been automatically migrated
- Existing single images are now in `product_images` table marked as primary
- No frontend changes required for backward compatibility

### Gradual Adoption
1. **Phase 1**: Use existing `image` field (current behavior)
2. **Phase 2**: Display `images` array in product gallery
3. **Phase 3**: Admin can upload multiple images
4. **Phase 4**: Full image management (reorder, set primary, etc.)

---

## 🎨 Image Sizes Available

Each uploaded image provides 3 sizes:

1. **url** - Full size (max 1000x1000, optimized)
2. **thumbUrl** - Thumbnail (200x200, cropped)
3. **mediumUrl** - Medium (500x500, limited)

Use appropriate size for performance:
- Product cards/lists: `thumbUrl` or `mediumUrl`
- Product detail main image: `url`
- Gallery thumbnails: `thumbUrl`

---

## ⚙️ Configuration

**Upload Limits:**
- Max images per upload: 10
- Max file size: Configured in multer (default: 5MB per file)
- Supported formats: JPG, PNG, WebP (configured in Cloudinary)

**Cloudinary Folders:**
- Product images: `greenart81/products/`
- Automatic optimization and format conversion enabled

---

## 🐛 Troubleshooting

### Problem: Product has no images array
**Solution**: The product was created before migration. Fetch images explicitly:
```javascript
const images = await axios.get(`/api/products/${productId}/images`);
```

### Problem: Primary image not updating
**Solution**: Make sure `isPrimary: true` is sent when adding/updating images. Only one image per product should be primary.

### Problem: Images not showing in product list
**Solution**: Check if you're using the correct image URL from the `images` array or fallback to legacy `image` field.

---

## 📚 Related Documentation

- Full implementation guide: [MULTIPLE_IMAGES_IMPLEMENTATION.md](MULTIPLE_IMAGES_IMPLEMENTATION.md)
- Database schema: [config/add-product-images-table.sql](config/add-product-images-table.sql)
