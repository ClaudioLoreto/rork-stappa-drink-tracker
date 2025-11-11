# Stappa Backend API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication
Most endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## Auth Endpoints

### Register
```http
POST /api/auth/register
```
**Body:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "Password123@",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+39 333 1234567",
  "city": "Milano",
  "province": "MI",
  "region": "Lombardia"
}
```

### Login
```http
POST /api/auth/login
```
**Body:**
```json
{
  "username": "john_doe",
  "password": "Password123@"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "...",
    "username": "john_doe",
    "role": "USER"
  }
}
```

### Get Current User
```http
GET /api/auth/me
```
**Headers:** Authorization required

---

## User Endpoints

### Get All Users
```http
GET /api/users
```
**Headers:** Authorization required (ROOT only)

### Get User by ID
```http
GET /api/users/:id
```
**Headers:** Authorization required

### Update Profile
```http
PUT /api/users/profile
```
**Headers:** Authorization required
**Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+39 333 9876543",
  "city": "Roma"
}
```

### Toggle Favorite Establishment
```http
POST /api/users/favorites/:establishmentId
```
**Headers:** Authorization required

### Get Favorites
```http
GET /api/users/favorites
```
**Headers:** Authorization required

---

## Establishment Endpoints

### Get All Establishments
```http
GET /api/establishments
```
**Query params:** `?city=Milano&region=Lombardia&status=ACTIVE`

### Get Single Establishment
```http
GET /api/establishments/:id
```

### Create Establishment
```http
POST /api/establishments
```
**Headers:** Authorization required (ROOT only)
**Body:**
```json
{
  "name": "Bar Centrale",
  "address": "Via Roma 1",
  "city": "Milano",
  "province": "MI",
  "region": "Lombardia",
  "phone": "+39 02 1234567",
  "email": "info@barcentrale.com"
}
```

### Update Establishment
```http
PUT /api/establishments/:id
```
**Headers:** Authorization required (ROOT or SENIOR_MERCHANT of establishment)

### Delete Establishment
```http
DELETE /api/establishments/:id
```
**Headers:** Authorization required (ROOT only)

### Assign Senior Merchant
```http
POST /api/establishments/:id/assign-merchant
```
**Headers:** Authorization required (ROOT only)
**Body:**
```json
{
  "userId": "user-id-here"
}
```

---

## Promo Endpoints

### Get All Promos
```http
GET /api/promos
```
**Query params:** `?establishmentId=...&isActive=true`

### Get Single Promo
```http
GET /api/promos/:id
```

### Create Promo
```http
POST /api/promos
```
**Headers:** Authorization required (ROOT or SENIOR_MERCHANT)
**Body:**
```json
{
  "establishmentId": "...",
  "ticketCost": 5,
  "ticketsRequired": 10,
  "rewardValue": 10,
  "description": "Buy 10 get 1 free",
  "durationDays": 30
}
```

### Update Promo
```http
PUT /api/promos/:id
```
**Headers:** Authorization required (ROOT or SENIOR_MERCHANT)

### Delete Promo
```http
DELETE /api/promos/:id
```
**Headers:** Authorization required (ROOT or SENIOR_MERCHANT)

---

## QR Code Endpoints

### Generate Validation QR
```http
POST /api/qr/generate-validation
```
**Headers:** Authorization required (MERCHANT, SENIOR_MERCHANT, or ROOT)
**Body:**
```json
{
  "establishmentId": "..."
}
```

### Generate Bonus QR
```http
POST /api/qr/generate-bonus
```
**Headers:** Authorization required (ROOT only)
**Body:**
```json
{
  "bonusDrinks": 5
}
```

### Scan QR Code
```http
POST /api/qr/scan
```
**Headers:** Authorization required
**Body:**
```json
{
  "qrCode": "validation_abc123..."
}
```

### Get User Progress
```http
GET /api/qr/progress/:establishmentId
```
**Headers:** Authorization required

---

## Validation Endpoints

### Get User Validations
```http
GET /api/validations/user/:userId
```
**Headers:** Authorization required

### Get Establishment Validations
```http
GET /api/validations/establishment/:establishmentId
```
**Headers:** Authorization required (MERCHANT, SENIOR_MERCHANT, or ROOT)

---

## Merchant Request Endpoints

### Create Request
```http
POST /api/merchant-requests
```
**Headers:** Authorization required
**Body:**
```json
{
  "establishmentName": "My Bar",
  "establishmentAddress": "Via Roma 1",
  "city": "Milano",
  "province": "MI",
  "region": "Lombardia",
  "notes": "I am the owner"
}
```

### Get All Requests
```http
GET /api/merchant-requests
```
**Headers:** Authorization required (ROOT only)

### Approve Request
```http
POST /api/merchant-requests/:id/approve
```
**Headers:** Authorization required (ROOT only)
**Body:**
```json
{
  "establishmentId": "existing-establishment-id",
  "role": "SENIOR_MERCHANT"
}
```

### Reject Request
```http
POST /api/merchant-requests/:id/reject
```
**Headers:** Authorization required (ROOT only)
**Body:**
```json
{
  "reason": "Insufficient documentation"
}
```

---

## Bug Report Endpoints

### Create Bug Report
```http
POST /api/bug-reports
```
**Headers:** Authorization required
**Body:** (multipart/form-data)
```
title: "App crashes on login"
description: "Detailed description..."
priority: "HIGH"
screenshot: [file]
```

### Get All Bug Reports
```http
GET /api/bug-reports
```
**Headers:** Authorization required (ROOT only)
**Query params:** `?status=OPEN&priority=HIGH`

### Update Bug Status
```http
PATCH /api/bug-reports/:id
```
**Headers:** Authorization required (ROOT only)
**Body:**
```json
{
  "status": "IN_PROGRESS",
  "adminNotes": "Working on it"
}
```

---

## Review Endpoints

### Create or Update Review
```http
POST /api/reviews
```
**Headers:** Authorization required
**Body:**
```json
{
  "establishmentId": "...",
  "rating": 5,
  "comment": "Great place!"
}
```
**Note:** If user already reviewed this establishment, it will update the existing review.

### Get Establishment Reviews
```http
GET /api/reviews/establishment/:establishmentId
```
**Headers:** Authorization required

**Response:**
```json
{
  "reviews": [
    {
      "id": "...",
      "rating": 5,
      "comment": "Great place!",
      "createdAt": "2024-01-15T10:30:00Z",
      "user": {
        "id": "...",
        "username": "john_doe",
        "firstName": "John",
        "lastName": "Doe"
      }
    }
  ],
  "stats": {
    "total": 15,
    "averageRating": 4.3
  }
}
```

### Get User Reviews
```http
GET /api/reviews/user/:userId
```
**Headers:** Authorization required

### Delete Review
```http
DELETE /api/reviews/establishment/:establishmentId
```
**Headers:** Authorization required

---

## Schedule Endpoints

### Create or Update Schedule
```http
POST /api/schedules
```
**Headers:** Authorization required (SENIOR_MERCHANT or ROOT)
**Body:**
```json
{
  "establishmentId": "...",
  "schedules": [
    {
      "dayOfWeek": 0,
      "openTime": "18:00",
      "closeTime": "01:00",
      "isClosed": false
    },
    {
      "dayOfWeek": 1,
      "openTime": "17:00",
      "closeTime": "01:00",
      "isClosed": false
    }
  ]
}
```
**Note:** dayOfWeek: 0=Sunday, 1=Monday, 2=Tuesday, etc.

### Get Establishment Schedule
```http
GET /api/schedules/:establishmentId
```
**Headers:** Authorization required

**Response:**
```json
{
  "schedules": [
    {
      "dayOfWeek": 0,
      "openTime": "18:00",
      "closeTime": "01:00",
      "isClosed": false
    }
  ]
}
```

---

## Social Post Endpoints

### Create Social Post
```http
POST /api/social
```
**Headers:** Authorization required (MERCHANT, SENIOR_MERCHANT, or ROOT)
**Body:**
```json
{
  "establishmentId": "...",
  "type": "POST",
  "content": "🍺 Happy Hour tonight!",
  "imageUrl": "https://..."
}
```
**Note:** type can be "POST" or "STORY"

### Get Establishment Posts
```http
GET /api/social/:establishmentId
```
**Headers:** Authorization required
**Query params:** `?type=POST` or `?type=STORY`

**Response:**
```json
{
  "posts": [
    {
      "id": "...",
      "type": "POST",
      "content": "🍺 Happy Hour tonight!",
      "imageUrl": null,
      "createdAt": "2024-01-15T18:00:00Z",
      "author": {
        "id": "...",
        "username": "mario_rossi",
        "role": "SENIOR_MERCHANT"
      }
    }
  ]
}
```

### Delete Social Post
```http
DELETE /api/social/:id
```
**Headers:** Authorization required (author, SENIOR_MERCHANT of establishment, or ROOT)

---

## Roles and Permissions

### USER
- View establishments, promos, reviews
- Create reviews
- Scan QR codes
- View own progress and validations
- Toggle favorites
- Submit bug reports and merchant requests

### MERCHANT
- All USER permissions
- Generate validation QR codes for their establishment
- View establishment validations
- Create social posts (if `canPostSocial` is true)

### SENIOR_MERCHANT
- All MERCHANT permissions
- Manage establishment details
- Create/edit/delete promos
- Manage schedules
- Create/delete social posts
- Assign merchants to establishment

### ROOT
- All permissions
- User management
- Create/delete establishments
- Approve/reject merchant requests
- View/manage bug reports
- Generate bonus QR codes

---

## Error Responses

All endpoints return consistent error responses:

```json
{
  "error": "Error message here"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

---

## Test Credentials

### ROOT Admin
- Username: `root`
- Password: `Root1234@`

### Senior Merchant
- Username: `mario_rossi`
- Password: `Senior1234@`

### Merchant
- Username: `carlo_neri`
- Password: `Merchant1234@`

### User
- Username: `giovanni_test`
- Password: `User1234@`

---

## Database Tables

The backend includes 11 tables:
1. **User** - User accounts with roles
2. **Establishment** - Bars/restaurants
3. **Promo** - Loyalty card promotions
4. **QRCode** - Generated QR codes for validation/bonus
5. **Validation** - Scan history
6. **UserProgress** - Drinks count per establishment
7. **MerchantRequest** - Merchant registration requests
8. **BugReport** - User-submitted bug reports
9. **Review** ⭐ - User reviews (1-5 stars + comment)
10. **Schedule** 📅 - Opening hours per day of week
11. **SocialPost** 📱 - Posts and stories from establishments
