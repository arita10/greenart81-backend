# Changelog

All notable changes to the GreenArt81 Backend API project.

## [1.0.0] - 2025-12-23

### Initial Release

#### Added
- Complete RESTful API backend for e-commerce platform
- JWT-based authentication system
- Role-based authorization (Customer/Admin)
- PostgreSQL database integration with Aiven cloud
- Complete database schema with 9 tables
- 67 API endpoints covering all e-commerce functionality

#### Authentication & User Management
- User registration with password hashing
- User login with JWT token generation
- Profile management (view, update)
- Password change functionality
- Admin and customer role separation

#### Customer Features
- Product browsing with pagination
- Product search and filtering
- Category-based product listing
- Featured products
- Shopping cart management (add, update, remove, clear)
- Order creation and management
- Order cancellation for pending orders
- Wishlist functionality
- Product reviews and ratings

#### Admin Features
- Product management (CRUD operations)
- Stock management
- Product activation/deactivation
- Bulk product upload
- Order management (view all, update status, delete)
- User management (view, update role, block/unblock, delete)
- Category management (CRUD operations)
- Dashboard analytics:
  - Overall statistics (users, orders, revenue, products)
  - Sales data with date filtering
  - Top selling products
  - Recent orders
  - Low stock alerts
- Review moderation (approve, reject, delete)

#### Database
- Users table with authentication
- Categories table (pre-loaded with 5 categories)
- Products table with category relationships
- Cart table for shopping cart items
- Orders and order_items tables for order management
- Wishlist table for user favorites
- Reviews table for product ratings
- Notifications table for user notifications
- Optimized indexes for performance

#### Security
- Password hashing with bcryptjs
- JWT token authentication
- Token expiration (7 days default)
- SQL injection prevention via parameterized queries
- CORS protection
- Role-based access control
- Input validation

#### Developer Experience
- Comprehensive API documentation
- Quick start guide
- API testing guide with curl examples
- Postman collection for easy testing
- Database initialization scripts
- Environment configuration templates
- Standardized response formats
- Error handling with descriptive codes

#### Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server with auto-reload
- `npm run test-connection` - Test database connectivity
- `npm run init-db` - Initialize database schema
- `npm run reset-db` - Reset database (drop all tables)

#### Documentation
- README.md - Complete project documentation
- QUICKSTART.md - Quick setup guide
- API_TESTING.md - API testing examples
- POSTMAN_COLLECTION.json - Postman import file
- PROJECT_SUMMARY.md - Project overview
- CHANGELOG.md - This file

#### Dependencies
- express: ^4.18.2
- pg: ^8.11.3
- bcryptjs: ^2.4.3
- jsonwebtoken: ^9.0.2
- dotenv: ^16.3.1
- cors: ^2.8.5
- express-validator: ^7.0.1
- multer: ^1.4.5-lts.1
- nodemon: ^3.0.2 (dev)

#### Configuration
- PostgreSQL database (Aiven cloud)
- Server port: 5000
- JWT expiration: 7 days
- CORS enabled
- SSL/TLS support

#### Default Data
- Admin account (admin@greenart81.com)
- 5 product categories:
  - Plants
  - Seeds
  - Pots
  - Tools
  - Fertilizers

### Notes
- Server is production-ready
- All endpoints tested and functional
- Database schema optimized with indexes
- Comprehensive error handling implemented
- Security best practices followed

---

## Future Enhancements (Planned)

### Version 1.1.0
- [ ] Email notifications for orders
- [ ] Password reset functionality
- [ ] Email verification
- [ ] Order tracking system

### Version 1.2.0
- [ ] Payment gateway integration
- [ ] Invoice generation
- [ ] Multiple payment methods
- [ ] Shipping cost calculation

### Version 1.3.0
- [ ] Image upload functionality
- [ ] Product image gallery
- [ ] User avatar upload
- [ ] Image optimization

### Version 1.4.0
- [ ] Advanced analytics
- [ ] Revenue reports
- [ ] Customer analytics
- [ ] Product performance metrics

### Version 2.0.0
- [ ] API documentation (Swagger/OpenAPI)
- [ ] Rate limiting
- [ ] Caching (Redis)
- [ ] WebSocket support for real-time updates
- [ ] Multi-language support
- [ ] Currency conversion

---

## Version History

- **1.0.0** (2025-12-23) - Initial release with complete e-commerce functionality

---

For detailed information about the current version, see [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)
