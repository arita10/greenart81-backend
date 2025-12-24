# 📸 Image Upload Guide - GreenArt81

## 🎯 FREE Image Storage with ImgBB

Your backend now supports **FREE unlimited image uploads** using ImgBB!

---

## 🚀 Quick Setup (3 Steps)

### **Step 1: Get FREE ImgBB API Key**

1. Go to https://api.imgbb.com/
2. Click **"Get API Key"**
3. Sign up with email (free, no credit card needed)
4. Copy your API key

### **Step 2: Add to Environment Variables**

**Local (.env file):**
```env
IMGBB_API_KEY=your_imgbb_api_key_here
```

**Render Dashboard:**
- Go to your service → Environment
- Add: `IMGBB_API_KEY` = your API key
- Click **Save Changes**

### **Step 3: Test Upload**

```bash
curl -X POST https://greenart81-backend.onrender.com/api/upload/single \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "image=@/path/to/image.jpg"
```

---

## 📋 Upload API Endpoints

### **1. Upload Single Image**
```
POST /api/upload/single
```

**Headers:**
- `Authorization: Bearer {token}`
- `Content-Type: multipart/form-data`

**Body:**
- `image` (file) - Image file (jpeg, jpg, png, gif, webp)

**Response:**
```json
{
  "success": true,
  "data": {
    "url": "https://i.ibb.co/xxx/image.jpg",
    "displayUrl": "https://i.ibb.co/xxx/image.jpg",
    "thumbUrl": "https://i.ibb.co/xxx/thumb.jpg",
    "mediumUrl": "https://i.ibb.co/xxx/medium.jpg",
    "deleteUrl": "https://ibb.co/xxx/delete"
  },
  "message": "Image uploaded successfully"
}
```

---

### **2. Upload Multiple Images (Up to 5)**
```
POST /api/upload/multiple
```

**Headers:**
- `Authorization: Bearer {token}`
- `Content-Type: multipart/form-data`

**Body:**
- `images` (files) - Multiple image files (max 5)

**Response:**
```json
{
  "success": true,
  "data": {
    "images": [
      {
        "url": "https://i.ibb.co/xxx/image1.jpg",
        "displayUrl": "https://i.ibb.co/xxx/image1.jpg",
        "thumbUrl": "https://i.ibb.co/xxx/thumb1.jpg",
        "mediumUrl": "https://i.ibb.co/xxx/medium1.jpg",
        "deleteUrl": "https://ibb.co/xxx/delete1"
      },
      {
        "url": "https://i.ibb.co/xxx/image2.jpg",
        "displayUrl": "https://i.ibb.co/xxx/image2.jpg",
        "thumbUrl": "https://i.ibb.co/xxx/thumb2.jpg",
        "mediumUrl": "https://i.ibb.co/xxx/medium2.jpg",
        "deleteUrl": "https://ibb.co/xxx/delete2"
      }
    ],
    "count": 2
  },
  "message": "2 images uploaded successfully"
}
```

---

### **3. Upload Product Image (Admin Only)**
```
POST /api/upload/product
```

**Headers:**
- `Authorization: Bearer {admin_token}`
- `Content-Type: multipart/form-data`

**Body:**
- `image` (file) - Product image

**Response:**
```json
{
  "success": true,
  "data": {
    "imageUrl": "https://i.ibb.co/xxx/product.jpg",
    "thumbUrl": "https://i.ibb.co/xxx/thumb.jpg",
    "mediumUrl": "https://i.ibb.co/xxx/medium.jpg"
  },
  "message": "Product image uploaded successfully"
}
```

---

## 🎨 Frontend Integration

### **React Example - Single Image Upload**

```javascript
import React, { useState } from 'react';
import axios from 'axios';

function ImageUploader() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'https://greenart81-backend.onrender.com/api/upload/single',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setImageUrl(response.data.data.url);
      alert('Image uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleFileSelect} />
      <button onClick={handleUpload} disabled={uploading}>
        {uploading ? 'Uploading...' : 'Upload Image'}
      </button>
      {imageUrl && <img src={imageUrl} alt="Uploaded" style={{maxWidth: '300px'}} />}
    </div>
  );
}

export default ImageUploader;
```

---

### **React Example - Multiple Images Upload**

```javascript
import React, { useState } from 'react';
import axios from 'axios';

function MultipleImageUploader() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [imageUrls, setImageUrls] = useState([]);
  const [uploading, setUploading] = useState(false);

  const handleFilesSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      alert('Maximum 5 images allowed');
      return;
    }
    setSelectedFiles(files);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    const formData = new FormData();
    selectedFiles.forEach(file => {
      formData.append('images', file);
    });

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'https://greenart81-backend.onrender.com/api/upload/multiple',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      const urls = response.data.data.images.map(img => img.url);
      setImageUrls(urls);
      alert(`${urls.length} images uploaded successfully!`);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={handleFilesSelect}
      />
      <p>{selectedFiles.length} files selected (max 5)</p>
      <button onClick={handleUpload} disabled={uploading}>
        {uploading ? 'Uploading...' : 'Upload Images'}
      </button>
      <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
        {imageUrls.map((url, index) => (
          <img key={index} src={url} alt={`Upload ${index}`} style={{maxWidth: '150px'}} />
        ))}
      </div>
    </div>
  );
}

export default MultipleImageUploader;
```

---

### **Admin Product Form with Image Upload**

```javascript
import React, { useState } from 'react';
import axios from 'axios';

function AdminProductForm() {
  const [product, setProduct] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category_id: 1,
    image_url: ''
  });
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.post(
        'https://greenart81-backend.onrender.com/api/upload/product',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      // Set the uploaded image URL to product
      setProduct(prev => ({
        ...prev,
        image_url: response.data.data.imageUrl
      }));

      alert('Product image uploaded!');
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.post(
        'https://greenart81-backend.onrender.com/api/admin/products',
        product,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      alert('Product created successfully!');
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to create product');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Product Name"
        value={product.name}
        onChange={(e) => setProduct({...product, name: e.target.value})}
      />

      <textarea
        placeholder="Description"
        value={product.description}
        onChange={(e) => setProduct({...product, description: e.target.value})}
      />

      <input
        type="number"
        placeholder="Price"
        value={product.price}
        onChange={(e) => setProduct({...product, price: e.target.value})}
      />

      <input
        type="number"
        placeholder="Stock"
        value={product.stock}
        onChange={(e) => setProduct({...product, stock: e.target.value})}
      />

      <div>
        <label>Product Image:</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          disabled={uploading}
        />
        {uploading && <p>Uploading image...</p>}
        {product.image_url && (
          <img src={product.image_url} alt="Preview" style={{maxWidth: '200px'}} />
        )}
      </div>

      <button type="submit" disabled={!product.image_url}>
        Create Product
      </button>
    </form>
  );
}

export default AdminProductForm;
```

---

## 📝 Image Validation

**Allowed formats:**
- JPEG / JPG
- PNG
- GIF
- WebP

**Max file size:** 5MB per image

**Max images (multiple upload):** 5 images

---

## 🔧 Testing with cURL

### Upload Single Image
```bash
curl -X POST https://greenart81-backend.onrender.com/api/upload/single \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "image=@/path/to/image.jpg"
```

### Upload Multiple Images
```bash
curl -X POST https://greenart81-backend.onrender.com/api/upload/multiple \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "images=@/path/to/image1.jpg" \
  -F "images=@/path/to/image2.jpg" \
  -F "images=@/path/to/image3.jpg"
```

### Upload Product Image (Admin)
```bash
curl -X POST https://greenart81-backend.onrender.com/api/upload/product \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -F "image=@/path/to/product.jpg"
```

---

## 🆘 Troubleshooting

### Error: "No image file provided"
- Make sure field name is correct (`image` or `images`)
- Check Content-Type is `multipart/form-data`

### Error: "Only image files are allowed"
- File must be jpeg, jpg, png, gif, or webp
- Check file extension

### Error: "File too large"
- Max size is 5MB per image
- Compress image before uploading

### Error: "Maximum 5 images allowed"
- Only 5 images max for multiple upload
- Split into multiple requests

### Error: "Image upload failed"
- Check IMGBB_API_KEY is set correctly
- Verify ImgBB API key is valid
- Check internet connection

---

## ✅ Complete Workflow

### **For Product Creation:**

1. **Admin uploads product image:**
```javascript
POST /api/upload/product
→ Returns: { imageUrl: "https://i.ibb.co/xxx/product.jpg" }
```

2. **Admin creates product with image URL:**
```javascript
POST /api/admin/products
Body: {
  name: "Peace Lily",
  description: "Beautiful plant",
  price: 29.99,
  stock: 50,
  category_id: 1,
  image_url: "https://i.ibb.co/xxx/product.jpg"  // From step 1
}
```

---

## 🎁 ImgBB Benefits

✅ **FREE unlimited storage**
✅ **No credit card required**
✅ **Fast CDN delivery**
✅ **Auto-generate thumbnails**
✅ **Direct image URLs**
✅ **No bandwidth limits**
✅ **99.9% uptime**

---

## 📌 Summary

**3 Upload Endpoints:**
1. `/api/upload/single` - Any authenticated user
2. `/api/upload/multiple` - Any authenticated user (max 5)
3. `/api/upload/product` - Admin only

**Setup Steps:**
1. Get free ImgBB API key
2. Add to environment variables
3. Upload images from frontend
4. Use returned URLs in your database

---

**Your image upload system is ready! Just add your ImgBB API key!** 📸✨
