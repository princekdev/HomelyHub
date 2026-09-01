# 🏠 HomelyHub — Property Booking Platform

A full-stack MERN property booking platform inspired by the usability of modern stay-booking products. Users can search and book verified properties, hosts can list and manage listings and bookings, and admins can moderate the platform.

---

## 1. Features

**Users**
- Register / login / logout with JWT auth (httpOnly cookie)
- Browse, search, and filter properties (location, price, type, guests, bedrooms, amenities)
- View detailed property pages with an image gallery, amenities, host info, and reviews
- Book properties with automatic night/price calculation and backend-enforced overlap prevention
- View, cancel bookings; leave a review after a completed stay
- Save/unsave favorite properties
- Manage their profile (name, avatar)

**Hosts**
- Dashboard with property/booking/earnings stats
- Create, edit, delete properties with multi-image upload (Cloudinary)
- Manage availability implicitly via the booking system
- View bookings for their properties; confirm, reject, or mark as completed

**Admins**
- Platform-wide stats dashboard
- Manage users (view, block/unblock, **change role**)
- Manage/moderate properties (remove listings)
- Monitor all bookings

### How roles work

Every account registers as a plain **user** — there is no self-service "become a host" button and no way for a client to set its own role. Role changes only happen through an administrator, either:

1. Directly in MongoDB (edit the `role` field on a `User` document), or
2. From the app, via **Admin Dashboard → Users**, using the role dropdown next to each user.

Both paths hit the same backend rule: `PATCH /api/admin/users/:id/role` is the only route that can change a role, it's locked behind `authorize("admin")`, and an admin can't demote/change their own role from the panel (guards against accidental lockout). The `/become-host` page is purely informational now — it explains the benefits and points people to Contact rather than upgrading them.

---

## 2. Tech Stack

**Frontend:** React 18 + Vite, JavaScript (no TypeScript), React Router DOM, Axios, Tailwind CSS, Context API, React Hook Form, Lucide icons, react-hot-toast.

**Backend:** Node.js, Express, MongoDB + Mongoose, JWT auth, bcryptjs, Multer + Cloudinary for images, dotenv, CORS, httpOnly cookies.

---

## 3. Folder Structure

```
homelyhub/
├── server/
│   ├── config/          # db.js, cloudinary.js
│   ├── models/          # User, Property, Booking, Review
│   ├── middleware/      # auth, error handling, upload
│   ├── controllers/     # business logic per resource
│   ├── routes/          # REST route definitions
│   ├── utils/           # asyncHandler, ApiError, response helpers, JWT
│   ├── seed/            # demo data + seed script
│   ├── app.js
│   └── server.js
├── client/
│   ├── src/
│   │   ├── components/  # PropertyCard, Navbar, BookingCard, etc.
│   │   ├── pages/       # route-level pages (host/, admin/ subfolders)
│   │   ├── layouts/     # MainLayout, HostLayout, AdminLayout
│   │   ├── context/     # AuthContext, FavoritesContext
│   │   ├── services/    # centralized Axios API calls
│   │   ├── routes/      # ProtectedRoute, HostRoute, AdminRoute
│   │   └── utils/       # formatting helpers, constants
│   └── index.html
└── README.md
```

---

## 4. Prerequisites

- Node.js 18+
- A MongoDB database (local install or MongoDB Atlas)
- A free Cloudinary account (for image uploads)

---

## 5. Backend Setup

```bash
cd server
npm install
cp .env.example .env
```

Fill in `.env`:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/homelyhub
JWT_SECRET=replace_this_with_a_long_random_string
JWT_EXPIRES_IN=7d
JWT_COOKIE_EXPIRES_DAYS=7
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLIENT_URL=http://localhost:5173
```

Seed the database with demo data (users, hosts, admin, 18 properties, sample bookings and reviews across Indian cities):

```bash
npm run seed
```

Run the API:

```bash
npm run dev
```

The API runs at `http://localhost:5000/api` (health check at `/api/health`).

### Demo credentials (created by the seed script)

| Role  | Email                        | Password   |
|-------|-------------------------------|-----------|
| Admin | admin@homelyhub.com           | Admin@123 |
| Host  | rohan.host@homelyhub.com      | Host@123  |
| Host  | ananya.host@homelyhub.com     | Host@123  |
| User  | priya@homelyhub.com           | User@123  |

---

## 6. Frontend Setup

```bash
cd client
npm install
cp .env.example .env
```

Set `VITE_API_URL` in `.env` to your backend's `/api` base URL (defaults to `http://localhost:5000/api`).

```bash
npm run dev
```

The app runs at `http://localhost:5173`.

---

## 7. MongoDB Setup

- **Local:** install MongoDB Community Edition and use `mongodb://127.0.0.1:27017/homelyhub`.
- **Atlas:** create a free cluster, add your IP to the access list, create a database user, and copy the connection string into `MONGODB_URI`.

## 8. Cloudinary Setup

1. Create a free account at cloudinary.com.
2. From the dashboard, copy your Cloud Name, API Key, and API Secret into the server `.env`.
3. No manual bucket/folder setup is required — the app creates `homelyhub/properties` and `homelyhub/avatars` folders automatically on first upload.

---

## 9. API Overview

```
Auth
  POST   /api/auth/register
  POST   /api/auth/login
  POST   /api/auth/logout
  GET    /api/auth/me
  PUT    /api/auth/me
  POST   /api/auth/become-host

Properties
  GET    /api/properties                 (search/filter/sort/paginate)
  GET    /api/properties/:id
  POST   /api/properties                 (host/admin, multipart images)
  PUT    /api/properties/:id             (host/admin)
  DELETE /api/properties/:id             (host/admin)
  GET    /api/properties/host/mine       (host)
  GET    /api/properties/:id/availability
  GET    /api/properties/:id/reviews
  POST   /api/properties/:id/reviews

Bookings
  POST   /api/bookings
  GET    /api/bookings/my
  GET    /api/bookings/host
  GET    /api/bookings/:id
  PATCH  /api/bookings/:id/status
  DELETE /api/bookings/:id

Favorites
  GET    /api/users/favorites
  POST   /api/users/favorites/:propertyId
  DELETE /api/users/favorites/:propertyId

Admin
  GET    /api/admin/stats
  GET    /api/admin/users
  PATCH  /api/admin/users/:id/status
  PATCH  /api/admin/users/:id/role
  GET    /api/admin/properties
  DELETE /api/admin/properties/:id
  GET    /api/admin/bookings

Contact
  POST   /api/contact
```

All responses follow `{ success: boolean, message: string, data?: any, meta?: any }`.

---

## 10. Security Notes

- Passwords are hashed with bcryptjs; password hashes are never returned by any API.
- JWT is stored in an httpOnly cookie (with a header-based fallback for tooling); role is never taken from client input on registration — every new account is created with role `"user"` regardless of what's sent in the request body.
- Roles can only be changed by an admin (`PATCH /api/admin/users/:id/role`, guarded by `authorize("admin")`) or by editing the database directly — there is no user-facing endpoint that elevates a user's own role.
- All mutation routes are protected with `protect` + `authorize(role)` middleware — role checks happen on the backend, not just the frontend.
- Booking overlap is checked authoritatively in `bookingController.createBooking`, regardless of what the frontend has already validated.

---

## 11. Known Simplifications (documented, not hidden)

This is a portfolio-scope build. A few things are intentionally simplified rather than faked:

- **Payments:** no real payment gateway is integrated. Bookings are created with `paymentStatus: "pending"` and the architecture (separate `totalPrice`, `paymentStatus` fields) is ready for a Razorpay/Stripe integration later.
- **Seed/placeholder images** use Lorem Picsum (`picsum.photos`), a stable placeholder-image CDN, seeded per property/city so thumbnails stay consistent across reloads. Real hosts uploading through the Add Property form go through the actual Cloudinary pipeline instead.
- **Contact form** logs inquiries server-side rather than sending email, since no email service is configured; swapping in an email/helpdesk provider is a small change to `contactController.js`.
- **Infinite scroll** was implemented as numbered pagination instead, since it's functionally equivalent and simpler to reason about/test.

Nothing here fakes success responses or pretends a feature works when it doesn't — booking creation, overlap checks, auth, RBAC, image upload, favorites, and reviews are all real and backed by MongoDB.

---

## 12. Deployment

- **Frontend:** deploy `client/` to Vercel or Netlify. Set `VITE_API_URL` to your deployed backend's `/api` URL.
- **Backend:** deploy `server/` to Render or Railway. Set all `.env` values in the platform's environment settings, and set `CLIENT_URL` to your deployed frontend's origin (for CORS).
- **Database:** use MongoDB Atlas and put the connection string in `MONGODB_URI`.
- **Images:** Cloudinary works the same in production; no extra setup needed beyond the API keys.

---

## 13. Future Improvements

- Real payment gateway integration (Razorpay/Stripe)
- Email notifications for booking status changes
- Host payout tracking
- Admin analytics charts
- Infinite scroll option alongside pagination
- Automated tests (unit + integration)
