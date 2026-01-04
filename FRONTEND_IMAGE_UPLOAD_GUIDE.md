# Frontend Image Upload & Management - Complete Guide

## 🎯 Overview

This guide shows you exactly how to implement product image upload and management in your React frontend.

---

## 📋 Table of Contents

1. [Single Image Upload (Existing - Still Works)](#1-single-image-upload-existing)
2. [Multiple Images Upload (NEW)](#2-multiple-images-upload-new)
3. [Add Images to Product](#3-add-images-to-product)
4. [Manage Product Images](#4-manage-product-images)
5. [Complete React Components](#5-complete-react-components)

---

## 1. Single Image Upload (Existing - Still Works)

### Upload Single Product Image

**Endpoint:** `POST /api/upload/product`

**Use Case:** Upload one product image (legacy method, still supported)

```javascript
// Upload single image
const uploadSingleImage = async (file, adminToken) => {
  const formData = new FormData();
  formData.append('image', file);

  try {
    const response = await axios.post(
      'https://greenart81-backend.onrender.com/api/upload/product',
      formData,
      {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'multipart/form-data'
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Upload error:', error.response?.data || error.message);
    throw error;
  }
};

// Example Response:
{
  "success": true,
  "data": {
    "imageUrl": "https://res.cloudinary.com/dq0dbdqmo/image/upload/.../product_123.jpg",
    "thumbUrl": "https://res.cloudinary.com/dq0dbdqmo/image/upload/w_200,h_200/.../product_123.jpg",
    "mediumUrl": "https://res.cloudinary.com/dq0dbdqmo/image/upload/w_500,h_500/.../product_123.jpg"
  },
  "message": "Product image uploaded successfully"
}

// Usage in component:
const handleSingleUpload = async (event) => {
  const file = event.target.files[0];
  const result = await uploadSingleImage(file, adminToken);
  setProductData({
    ...productData,
    image_url: result.data.imageUrl
  });
};
```

---

## 2. Multiple Images Upload (NEW)

### Upload Multiple Product Images (Up to 10)

**Endpoint:** `POST /api/upload/product/multiple`

**Use Case:** Upload multiple images at once for a product

```javascript
// Upload multiple images
const uploadMultipleImages = async (files, adminToken) => {
  const formData = new FormData();

  // Add each file with the same field name 'images'
  files.forEach(file => {
    formData.append('images', file);
  });

  try {
    const response = await axios.post(
      'https://greenart81-backend.onrender.com/api/upload/product/multiple',
      formData,
      {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'multipart/form-data'
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Multiple upload error:', error.response?.data || error.message);
    throw error;
  }
};

// Example Response:
{
  "success": true,
  "data": {
    "images": [
      {
        "url": "https://res.cloudinary.com/.../product_1735993200_0_img1.jpg",
        "thumbUrl": "https://res.cloudinary.com/.../thumb1.jpg",
        "mediumUrl": "https://res.cloudinary.com/.../medium1.jpg",
        "sortOrder": 0
      },
      {
        "url": "https://res.cloudinary.com/.../product_1735993200_1_img2.jpg",
        "thumbUrl": "https://res.cloudinary.com/.../thumb2.jpg",
        "mediumUrl": "https://res.cloudinary.com/.../medium2.jpg",
        "sortOrder": 1
      },
      {
        "url": "https://res.cloudinary.com/.../product_1735993200_2_img3.jpg",
        "thumbUrl": "https://res.cloudinary.com/.../thumb3.jpg",
        "mediumUrl": "https://res.cloudinary.com/.../medium3.jpg",
        "sortOrder": 2
      }
    ],
    "count": 3
  },
  "message": "3 product images uploaded successfully"
}

// Usage in component:
const handleMultipleUpload = async (event) => {
  const files = Array.from(event.target.files);

  // Validate: max 10 files
  if (files.length > 10) {
    alert('Maximum 10 images allowed');
    return;
  }

  const result = await uploadMultipleImages(files, adminToken);
  setUploadedImages(result.data.images);
};
```

---

## 3. Add Images to Product

### Link Uploaded Images to a Product

**Endpoint:** `POST /api/products/:productId/images`

**Use Case:** After uploading images, attach them to a specific product

```javascript
// Add images to product
const addImagesToProduct = async (productId, uploadedImages, adminToken) => {
  try {
    const response = await axios.post(
      `https://greenart81-backend.onrender.com/api/products/${productId}/images`,
      {
        images: uploadedImages.map((img, index) => ({
          url: img.url,
          thumbUrl: img.thumbUrl,
          mediumUrl: img.mediumUrl,
          altText: `Product image ${index + 1}`, // Optional
          isPrimary: index === 0, // First image is primary
          sortOrder: index
        }))
      },
      {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Add images error:', error.response?.data || error.message);
    throw error;
  }
};

// Example Response:
{
  "success": true,
  "data": [
    {
      "id": 1,
      "product_id": 14,
      "image_url": "https://res.cloudinary.com/.../image1.jpg",
      "thumb_url": "https://res.cloudinary.com/.../thumb1.jpg",
      "medium_url": "https://res.cloudinary.com/.../medium1.jpg",
      "alt_text": "Product image 1",
      "is_primary": true,
      "sort_order": 0,
      "created_at": "2025-01-04T12:00:00Z"
    },
    // ... more images
  ],
  "message": "Product images added successfully"
}

// Usage after creating product:
const handleCreateProduct = async (productData, imageFiles) => {
  // 1. Create product first
  const product = await createProduct(productData);

  // 2. Upload images
  const uploadResult = await uploadMultipleImages(imageFiles, adminToken);

  // 3. Link images to product
  await addImagesToProduct(product.id, uploadResult.data.images, adminToken);

  alert('Product created with images!');
};
```

---

## 4. Manage Product Images

### 4.1 Get All Images for a Product

**Endpoint:** `GET /api/products/:productId/images`

**Use Case:** Fetch all images for a product (public, no auth needed)

```javascript
// Get product images
const getProductImages = async (productId) => {
  try {
    const response = await axios.get(
      `https://greenart81-backend.onrender.com/api/products/${productId}/images`
    );
    return response.data;
  } catch (error) {
    console.error('Get images error:', error.response?.data || error.message);
    throw error;
  }
};

// Example Response:
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
      "created_at": "2025-01-04T12:00:00Z"
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
      "created_at": "2025-01-04T12:01:00Z"
    }
  ],
  "message": "Product images retrieved successfully"
}

// Usage:
useEffect(() => {
  const loadImages = async () => {
    const result = await getProductImages(productId);
    setImages(result.data);
  };
  loadImages();
}, [productId]);
```

---

### 4.2 Update Image (Set as Primary, Change Alt Text)

**Endpoint:** `PUT /api/products/images/:imageId`

**Use Case:** Update image metadata (admin only)

```javascript
// Update image
const updateProductImage = async (imageId, updates, adminToken) => {
  try {
    const response = await axios.put(
      `https://greenart81-backend.onrender.com/api/products/images/${imageId}`,
      updates,
      {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Update image error:', error.response?.data || error.message);
    throw error;
  }
};

// Example: Set as primary image
const setPrimaryImage = async (imageId) => {
  await updateProductImage(imageId, { isPrimary: true }, adminToken);
  // Reload images
  loadImages();
};

// Example: Update alt text
const updateAltText = async (imageId, altText) => {
  await updateProductImage(imageId, { altText }, adminToken);
};

// Example Response:
{
  "success": true,
  "data": {
    "id": 2,
    "product_id": 14,
    "image_url": "https://res.cloudinary.com/.../image2.jpg",
    "alt_text": "Updated alt text",
    "is_primary": true,
    "sort_order": 1,
    "updated_at": "2025-01-04T13:00:00Z"
  },
  "message": "Product image updated successfully"
}
```

---

### 4.3 Delete Image

**Endpoint:** `DELETE /api/products/images/:imageId`

**Use Case:** Remove an image from a product (admin only)

```javascript
// Delete image
const deleteProductImage = async (imageId, adminToken) => {
  try {
    const response = await axios.delete(
      `https://greenart81-backend.onrender.com/api/products/images/${imageId}`,
      {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Delete image error:', error.response?.data || error.message);
    throw error;
  }
};

// Example Response:
{
  "success": true,
  "data": null,
  "message": "Product image deleted successfully"
}

// Usage with confirmation:
const handleDeleteImage = async (imageId) => {
  if (window.confirm('Delete this image?')) {
    await deleteProductImage(imageId, adminToken);
    // Reload images
    loadImages();
  }
};
```

**Note:** If you delete the primary image, the system automatically sets the first remaining image as primary.

---

### 4.4 Reorder Images

**Endpoint:** `PUT /api/products/:productId/images/reorder`

**Use Case:** Change the display order of images (admin only)

```javascript
// Reorder images
const reorderProductImages = async (productId, imageIds, adminToken) => {
  try {
    const response = await axios.put(
      `https://greenart81-backend.onrender.com/api/products/${productId}/images/reorder`,
      { imageIds },
      {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Reorder error:', error.response?.data || error.message);
    throw error;
  }
};

// Example: Move image to first position
const moveImageToFirst = async (imageId, allImages) => {
  const newOrder = [
    imageId,
    ...allImages.filter(img => img.id !== imageId).map(img => img.id)
  ];

  await reorderProductImages(productId, newOrder, adminToken);
  loadImages();
};

// Example Response:
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

## 5. Complete React Components

### 5.1 Create/Edit Product with Multiple Images

```jsx
import React, { useState } from 'react';
import axios from 'axios';

const ProductForm = ({ existingProduct = null, adminToken }) => {
  const [productData, setProductData] = useState({
    name: existingProduct?.name || '',
    description: existingProduct?.description || '',
    price: existingProduct?.price || '',
    stock: existingProduct?.stock || '',
    category: existingProduct?.category || '',
  });

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const API_BASE = 'https://greenart81-backend.onrender.com/api';

  // Handle file selection
  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);

    if (files.length > 10) {
      alert('Maximum 10 images allowed');
      return;
    }

    setSelectedFiles(files);
  };

  // Upload multiple images
  const uploadImages = async (files) => {
    const formData = new FormData();
    files.forEach(file => formData.append('images', file));

    const response = await axios.post(
      `${API_BASE}/upload/product/multiple`,
      formData,
      {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percent);
        }
      }
    );

    return response.data.data.images;
  };

  // Create product
  const createProduct = async (data) => {
    const response = await axios.post(
      `${API_BASE}/admin/products`,
      data,
      {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data.data;
  };

  // Add images to product
  const addImagesToProduct = async (productId, uploadedImages) => {
    await axios.post(
      `${API_BASE}/products/${productId}/images`,
      {
        images: uploadedImages.map((img, index) => ({
          url: img.url,
          thumbUrl: img.thumbUrl,
          mediumUrl: img.mediumUrl,
          altText: `${productData.name} - Image ${index + 1}`,
          isPrimary: index === 0,
          sortOrder: index
        }))
      },
      {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
  };

  // Submit form
  const handleSubmit = async (event) => {
    event.preventDefault();
    setUploading(true);

    try {
      // Step 1: Upload images
      let uploadedImages = [];
      if (selectedFiles.length > 0) {
        uploadedImages = await uploadImages(selectedFiles);
      }

      // Step 2: Create product with first image
      const productPayload = {
        ...productData,
        image_url: uploadedImages[0]?.url || ''
      };

      const createdProduct = await createProduct(productPayload);

      // Step 3: Add all images to product
      if (uploadedImages.length > 0) {
        await addImagesToProduct(createdProduct.id, uploadedImages);
      }

      alert('Product created successfully with images!');

      // Reset form
      setProductData({
        name: '',
        description: '',
        price: '',
        stock: '',
        category: ''
      });
      setSelectedFiles([]);
      setUploadProgress(0);

    } catch (error) {
      console.error('Error creating product:', error);
      alert('Error: ' + (error.response?.data?.error || error.message));
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>{existingProduct ? 'Edit' : 'Create'} Product</h2>

      <div>
        <label>Product Name:</label>
        <input
          type="text"
          value={productData.name}
          onChange={(e) => setProductData({...productData, name: e.target.value})}
          required
        />
      </div>

      <div>
        <label>Description:</label>
        <textarea
          value={productData.description}
          onChange={(e) => setProductData({...productData, description: e.target.value})}
        />
      </div>

      <div>
        <label>Price:</label>
        <input
          type="number"
          step="0.01"
          value={productData.price}
          onChange={(e) => setProductData({...productData, price: e.target.value})}
          required
        />
      </div>

      <div>
        <label>Stock:</label>
        <input
          type="number"
          value={productData.stock}
          onChange={(e) => setProductData({...productData, stock: e.target.value})}
          required
        />
      </div>

      <div>
        <label>Category:</label>
        <input
          type="text"
          value={productData.category}
          onChange={(e) => setProductData({...productData, category: e.target.value})}
          required
        />
      </div>

      <div>
        <label>Product Images (up to 10):</label>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
        />
        {selectedFiles.length > 0 && (
          <p>{selectedFiles.length} file(s) selected</p>
        )}
      </div>

      {uploading && (
        <div>
          <p>Uploading... {uploadProgress}%</p>
          <progress value={uploadProgress} max="100" />
        </div>
      )}

      <button type="submit" disabled={uploading}>
        {uploading ? 'Creating...' : 'Create Product'}
      </button>
    </form>
  );
};

export default ProductForm;
```

---

### 5.2 Image Manager Component (for editing existing products)

```jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ProductImageManager = ({ productId, adminToken }) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const API_BASE = 'https://greenart81-backend.onrender.com/api';

  // Load images
  const loadImages = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/products/${productId}/images`);
      setImages(response.data.data);
    } catch (error) {
      console.error('Load images error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadImages();
  }, [productId]);

  // Upload and add new images
  const handleAddImages = async (event) => {
    const files = Array.from(event.target.files);

    if (files.length === 0) return;
    if (images.length + files.length > 10) {
      alert('Cannot exceed 10 images total');
      return;
    }

    setUploading(true);
    try {
      // Upload images
      const formData = new FormData();
      files.forEach(file => formData.append('images', file));

      const uploadResponse = await axios.post(
        `${API_BASE}/upload/product/multiple`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      // Add to product
      await axios.post(
        `${API_BASE}/products/${productId}/images`,
        {
          images: uploadResponse.data.data.images.map((img, index) => ({
            url: img.url,
            thumbUrl: img.thumbUrl,
            mediumUrl: img.mediumUrl,
            isPrimary: images.length === 0 && index === 0, // Primary if first image
            sortOrder: images.length + index
          }))
        },
        {
          headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      alert('Images added successfully!');
      loadImages();
    } catch (error) {
      console.error('Add images error:', error);
      alert('Error: ' + (error.response?.data?.error || error.message));
    } finally {
      setUploading(false);
    }
  };

  // Set as primary
  const setPrimary = async (imageId) => {
    try {
      await axios.put(
        `${API_BASE}/products/images/${imageId}`,
        { isPrimary: true },
        {
          headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      loadImages();
    } catch (error) {
      console.error('Set primary error:', error);
      alert('Error setting primary image');
    }
  };

  // Delete image
  const deleteImage = async (imageId) => {
    if (!window.confirm('Delete this image?')) return;

    try {
      await axios.delete(
        `${API_BASE}/products/images/${imageId}`,
        {
          headers: {
            'Authorization': `Bearer ${adminToken}`
          }
        }
      );
      loadImages();
    } catch (error) {
      console.error('Delete error:', error);
      alert('Error deleting image');
    }
  };

  if (loading) return <p>Loading images...</p>;

  return (
    <div className="image-manager">
      <h3>Product Images ({images.length}/10)</h3>

      <div className="image-grid">
        {images.map((img) => (
          <div key={img.id} className="image-item">
            <img src={img.thumb_url} alt={img.alt_text} />
            {img.is_primary && <span className="primary-badge">Primary</span>}
            <div className="image-actions">
              {!img.is_primary && (
                <button onClick={() => setPrimary(img.id)}>Set Primary</button>
              )}
              <button onClick={() => deleteImage(img.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      {images.length < 10 && (
        <div className="add-images">
          <label htmlFor="add-images-input">
            <button type="button" disabled={uploading}>
              {uploading ? 'Uploading...' : 'Add More Images'}
            </button>
          </label>
          <input
            id="add-images-input"
            type="file"
            multiple
            accept="image/*"
            onChange={handleAddImages}
            style={{ display: 'none' }}
          />
        </div>
      )}
    </div>
  );
};

export default ProductImageManager;
```

---

### 5.3 Product Display with Image Gallery

```jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ProductDetail = ({ productId }) => {
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  const API_BASE = 'https://greenart81-backend.onrender.com/api';

  useEffect(() => {
    loadProduct();
  }, [productId]);

  const loadProduct = async () => {
    try {
      const response = await axios.get(`${API_BASE}/products/${productId}`);
      const productData = response.data.data;
      setProduct(productData);

      // Set first image as selected (or primary image)
      if (productData.images && productData.images.length > 0) {
        const primary = productData.images.find(img => img.isPrimary) || productData.images[0];
        setSelectedImage(primary);
      } else if (productData.image) {
        // Fallback for products with only legacy single image
        setSelectedImage({ url: productData.image });
      }
    } catch (error) {
      console.error('Load product error:', error);
    }
  };

  if (!product) return <p>Loading...</p>;

  return (
    <div className="product-detail">
      <div className="product-images">
        {/* Main Image Display */}
        <div className="main-image">
          <img
            src={selectedImage?.url || product.image}
            alt={selectedImage?.altText || product.name}
          />
        </div>

        {/* Thumbnail Gallery */}
        {product.images && product.images.length > 1 && (
          <div className="thumbnails">
            {product.images.map((img) => (
              <img
                key={img.id}
                src={img.thumbUrl}
                alt={img.altText}
                onClick={() => setSelectedImage(img)}
                className={selectedImage?.id === img.id ? 'selected' : ''}
                style={{
                  cursor: 'pointer',
                  border: selectedImage?.id === img.id ? '2px solid blue' : '1px solid #ccc',
                  width: '80px',
                  height: '80px',
                  objectFit: 'cover',
                  margin: '5px'
                }}
              />
            ))}
          </div>
        )}
      </div>

      <div className="product-info">
        <h1>{product.name}</h1>
        <p className="price">${product.price}</p>
        <p className="description">{product.description}</p>
        <p className="stock">Stock: {product.stock}</p>
        <p className="category">Category: {product.category}</p>
        <button>Add to Cart</button>
      </div>
    </div>
  );
};

export default ProductDetail;
```

---

## 🔑 Authentication Headers

All admin endpoints require authentication:

```javascript
const config = {
  headers: {
    'Authorization': `Bearer ${adminToken}`,
    'Content-Type': 'application/json' // or 'multipart/form-data' for file uploads
  }
};
```

Get admin token from login:
```javascript
const login = async (email, password) => {
  const response = await axios.post('https://greenart81-backend.onrender.com/api/auth/login', {
    email,
    password
  });

  const { token } = response.data.data;
  localStorage.setItem('adminToken', token);
  return token;
};
```

---

## 🎨 CSS Styling Example

```css
.image-manager {
  padding: 20px;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 15px;
  margin: 20px 0;
}

.image-item {
  position: relative;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 10px;
}

.image-item img {
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: 4px;
}

.primary-badge {
  position: absolute;
  top: 15px;
  right: 15px;
  background: #4CAF50;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.image-actions {
  display: flex;
  gap: 5px;
  margin-top: 10px;
}

.image-actions button {
  flex: 1;
  padding: 5px;
  font-size: 12px;
}

.thumbnails {
  display: flex;
  gap: 10px;
  margin-top: 15px;
  overflow-x: auto;
}
```

---

## 📝 Summary

**For Creating New Products:**
1. Upload images: `POST /api/upload/product/multiple`
2. Create product: `POST /api/admin/products`
3. Link images: `POST /api/products/:productId/images`

**For Editing Existing Products:**
1. Load images: `GET /api/products/:productId/images`
2. Add more: Upload → Link to product
3. Manage: Set primary, delete, reorder

**For Displaying Products:**
1. Get product: `GET /api/products/:productId`
2. Use `product.images` array for gallery
3. Fallback to `product.image` for old products

---

## 🐛 Common Issues

**Issue: CORS error**
Solution: Backend already has CORS enabled, but make sure you're using the correct URL with https://

**Issue: 401 Unauthorized**
Solution: Check that admin token is valid and included in Authorization header

**Issue: Files not uploading**
Solution: Ensure FormData is used and Content-Type is multipart/form-data

**Issue: Images array is empty**
Solution: Old products need images added using the image manager component
