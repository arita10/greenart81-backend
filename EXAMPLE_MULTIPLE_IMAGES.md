# Example: One Product with Multiple Images

## Scenario
Product ID 14 needs 4 images:
1. Front view (primary)
2. Side view
3. Back view
4. Detail view

---

## Database Structure

### Before (current state)
```
product_images table:
┌────┬────────────┬────────────┬────────────┬────────────┐
│ id │ product_id │ image_url  │ is_primary │ sort_order │
├────┼────────────┼────────────┼────────────┼────────────┤
│ 1  │ 14         │ image1.jpg │ true       │ 0          │
└────┴────────────┴────────────┴────────────┴────────────┘
Only 1 image
```

### After adding 3 more images
```
product_images table:
┌────┬────────────┬────────────────┬────────────┬────────────┐
│ id │ product_id │ image_url      │ is_primary │ sort_order │
├────┼────────────┼────────────────┼────────────┼────────────┤
│ 1  │ 14         │ front_view.jpg │ true       │ 0          │ ← Primary
│ 5  │ 14         │ side_view.jpg  │ false      │ 1          │ ← New
│ 6  │ 14         │ back_view.jpg  │ false      │ 2          │ ← New
│ 7  │ 14         │ detail_view.jpg│ false      │ 3          │ ← New
└────┴────────────┴────────────────┴────────────┴────────────┘
Now 4 images for same product!
```

---

## Step-by-Step Implementation

### Step 1: Select 4 images in frontend

```jsx
<input
  type="file"
  multiple
  accept="image/*"
  onChange={(e) => {
    const files = Array.from(e.target.files);
    // User selects 4 images
  }}
/>
```

---

### Step 2: Upload all 4 images

```javascript
const files = [file1, file2, file3, file4]; // 4 selected files

const formData = new FormData();
files.forEach(file => formData.append('images', file));

const uploadResponse = await axios.post(
  'https://greenart81-backend.onrender.com/api/upload/product/multiple',
  formData,
  { headers: { 'Authorization': `Bearer ${adminToken}` } }
);

console.log('Uploaded:', uploadResponse.data.data.images);
// Returns 4 Cloudinary URLs
```

**Response:**
```json
{
  "success": true,
  "data": {
    "images": [
      {
        "url": "https://res.cloudinary.com/.../front_view.jpg",
        "thumbUrl": "https://res.cloudinary.com/.../front_thumb.jpg",
        "mediumUrl": "https://res.cloudinary.com/.../front_medium.jpg",
        "sortOrder": 0
      },
      {
        "url": "https://res.cloudinary.com/.../side_view.jpg",
        "thumbUrl": "https://res.cloudinary.com/.../side_thumb.jpg",
        "mediumUrl": "https://res.cloudinary.com/.../side_medium.jpg",
        "sortOrder": 1
      },
      {
        "url": "https://res.cloudinary.com/.../back_view.jpg",
        "thumbUrl": "https://res.cloudinary.com/.../back_thumb.jpg",
        "mediumUrl": "https://res.cloudinary.com/.../back_medium.jpg",
        "sortOrder": 2
      },
      {
        "url": "https://res.cloudinary.com/.../detail_view.jpg",
        "thumbUrl": "https://res.cloudinary.com/.../detail_thumb.jpg",
        "mediumUrl": "https://res.cloudinary.com/.../detail_medium.jpg",
        "sortOrder": 3
      }
    ],
    "count": 4
  }
}
```

---

### Step 3: Add all 4 images to product

```javascript
const productId = 14;
const uploadedImages = uploadResponse.data.data.images;

await axios.post(
  `https://greenart81-backend.onrender.com/api/products/${productId}/images`,
  {
    images: uploadedImages.map((img, index) => ({
      url: img.url,
      thumbUrl: img.thumbUrl,
      mediumUrl: img.mediumUrl,
      altText: ['Front view', 'Side view', 'Back view', 'Detail view'][index],
      isPrimary: index === 0, // Only first is primary
      sortOrder: index
    }))
  },
  { headers: { 'Authorization': `Bearer ${adminToken}` } }
);
```

**Database now has 4 rows for product 14!**

---

### Step 4: Frontend displays all 4 images

```javascript
// Get all images for product
const response = await axios.get(
  `https://greenart81-backend.onrender.com/api/products/14/images`
);

const images = response.data.data; // Array of 4 images
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "product_id": 14,
      "image_url": "https://res.cloudinary.com/.../front_view.jpg",
      "thumb_url": "https://res.cloudinary.com/.../front_thumb.jpg",
      "medium_url": "https://res.cloudinary.com/.../front_medium.jpg",
      "alt_text": "Front view",
      "is_primary": true,
      "sort_order": 0
    },
    {
      "id": 5,
      "product_id": 14,
      "image_url": "https://res.cloudinary.com/.../side_view.jpg",
      "thumb_url": "https://res.cloudinary.com/.../side_thumb.jpg",
      "medium_url": "https://res.cloudinary.com/.../side_medium.jpg",
      "alt_text": "Side view",
      "is_primary": false,
      "sort_order": 1
    },
    {
      "id": 6,
      "product_id": 14,
      "image_url": "https://res.cloudinary.com/.../back_view.jpg",
      "thumb_url": "https://res.cloudinary.com/.../back_thumb.jpg",
      "medium_url": "https://res.cloudinary.com/.../back_medium.jpg",
      "alt_text": "Back view",
      "is_primary": false,
      "sort_order": 2
    },
    {
      "id": 7,
      "product_id": 14,
      "image_url": "https://res.cloudinary.com/.../detail_view.jpg",
      "thumb_url": "https://res.cloudinary.com/.../detail_thumb.jpg",
      "medium_url": "https://res.cloudinary.com/.../detail_medium.jpg",
      "alt_text": "Detail view",
      "is_primary": false,
      "sort_order": 3
    }
  ],
  "message": "Product images retrieved successfully"
}
```

---

### Step 5: Display in UI

```jsx
const ProductGallery = ({ productId }) => {
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const loadImages = async () => {
      const response = await axios.get(
        `https://greenart81-backend.onrender.com/api/products/${productId}/images`
      );
      setImages(response.data.data);
      setSelectedImage(response.data.data[0]); // Set first as selected
    };
    loadImages();
  }, [productId]);

  return (
    <div>
      {/* Main image */}
      <img
        src={selectedImage?.image_url}
        alt={selectedImage?.alt_text}
        style={{ width: '500px', height: '500px' }}
      />

      {/* Thumbnails - all 4 images */}
      <div style={{ display: 'flex', gap: '10px' }}>
        {images.map((img) => (
          <img
            key={img.id}
            src={img.thumb_url}
            alt={img.alt_text}
            onClick={() => setSelectedImage(img)}
            style={{
              width: '80px',
              height: '80px',
              cursor: 'pointer',
              border: selectedImage?.id === img.id ? '2px solid blue' : '1px solid gray'
            }}
          />
        ))}
      </div>
    </div>
  );
};
```

---

## Summary

✅ **Database:** `product_images` table supports multiple rows per product
✅ **API:** Upload and add multiple images with one API call
✅ **Storage:** Each image stored as separate row with same `product_id`
✅ **Retrieve:** Get all images for one product with one API call
✅ **Limit:** Up to 10 images per product
✅ **Fully working:** Ready to use now!
