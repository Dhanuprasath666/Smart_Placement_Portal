# 🎓 CampusHire — Smart Placement Portal

A full-stack college placement management system where admins post company opportunities, eligible students get auto-notified based on their CGPA and branch, and students can apply with one click — no Google Forms needed.

---

## 🚀 Live Demo

- **Frontend:** [placement-portal-bk43.vercel.app](https://placement-portal-bk43.onrender.com)
- **Backend API:** [placement-portal-api.onrender.com](https://placement-portal-bk43.onrender.com)

---

## 💡 Why I Built This

During my third year, placement company details were shared informally — group chats, emails, word of mouth. Many students missed opportunities simply because the information didn't reach them in time. There was no single reliable place every student could check.

I built CampusHire to solve this:
- Admins post verified company visit details once — every eligible student sees it immediately
- Students don't re-enter their details for every company — one click applies their saved profile
- Admins don't manage separate Google Forms — everything is tracked in one dashboard
- Placement results are verified with proof documents, giving institutions an accurate, tamper-resistant placement record

---

## ✨ Features

### 👨‍🎓 Student
- Register and build a profile (CGPA, branch, skills, LinkedIn, GitHub)
- **Auto-notification** when a new company is posted matching their CGPA and branch
- **One-click apply** — profile data auto-filled, no repeated form-filling
- Self-report placement results with offer letter and ID card upload
- View personal placement history

### 👨‍💼 Admin
- Post company visit announcements with eligibility criteria (min CGPA, eligible branches, roles, package range)
- View all interested applicants per company with full profile snapshots
- Verify and approve/reject student placement submissions
- Archive old company visits (soft delete — data preserved)

### 👑 Super Admin
- Create and manage admin accounts
- Full oversight across all placements and users

### 📊 Analytics
- College-wide placement statistics (average LPA, highest LPA, total placed)
- Batch-wise placement tracking

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js (Vite), React Router, Context API, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB (Mongoose ODM) |
| File Storage | Cloudinary (offer letters, ID cards, profile photos) |
| Authentication | JWT (JSON Web Tokens) + bcrypt |
| Deployment | Frontend → Vercel, Backend → Render |

---

## 🏗️ System Architecture

```
[ Browser / React Client ]  →  Vercel
         |
         | HTTPS (axios)
         |
[ Express REST API ]  →  Render
         |
    _____|_____
   |           |
[ MongoDB    [ Cloudinary ]
  Atlas ]     (file storage)
```

**Request flow:** React → axios HTTP request → Express router → middleware (CORS → verifyToken → isAdmin) → Controller → MongoDB/Cloudinary → JSON response → React updates UI

---

## 🗄️ Database Collections

| Collection | Purpose |
|---|---|
| `User` | Students, admins, superadmins — role-based via single collection |
| `CompanyVisit` | Company announcements posted by admins |
| `Placement` | Student self-reported placement results (pending → approved/rejected) |
| `CompanyApplication` | One-click applications linking students to company visits |

---

## 🔐 Authentication & Security

- Passwords hashed with **bcrypt** (never stored plain text)
- **JWT tokens** signed at login, expire in 7 days
- Token sent in `Authorization: Bearer` header on every protected request
- **Three middleware layers:** `verifyToken` → `isAdmin` → `isSuperAdmin`
- Frontend route protection via `ProtectedRoute` component (UX layer)
- Backend re-verifies eligibility independently at apply-time (never trusts frontend alone)
- **Compound unique index** on `(user, companyVisit)` prevents duplicate applications at DB level

---

## 📁 Project Structure

```
campushire/
├── client/                  # React frontend (Vite)
│   ├── src/
│   │   ├── pages/           # One file per screen/route
│   │   ├── components/      # Reusable components (ProtectedRoute, Sidebar)
│   │   ├── context/         # AuthContext — global login state
│   │   └── utils/           # api.js — all axios calls centralized
│   └── .env                 # VITE_API_URL
│
├── server/                  # Express backend
│   ├── controllers/         # Business logic per feature
│   ├── routes/              # URL → controller mapping
│   ├── models/              # Mongoose schemas (4 collections)
│   ├── middleware/          # auth.js (verifyToken, isAdmin, isSuperAdmin)
│   │                        # upload.js (Multer for file handling)
│   ├── config/              # Cloudinary config
│   └── .env                 # MongoDB URI, JWT secret, Cloudinary keys
│
└── README.md
```

---

## ⚙️ Getting Started

### Prerequisites
- Node.js v18+
- MongoDB Atlas account
- Cloudinary account

### 1. Clone the repo
```bash
git clone https://github.com/your-username/campushire.git
cd campushire
```

### 2. Setup the backend
```bash
cd server
npm install
```

Create a `.env` file in `/server`:
```env
PORT=5000
MONGODB_URI=your_mongodb_atlas_uri
JWT_SECRET=your_jwt_secret
ADMIN_SECRET=your_admin_registration_secret
SUPERADMIN_SECRET=your_superadmin_registration_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
NODE_ENV=development
```

Start the server:
```bash
npm run dev      # development (auto-reload)
npm start        # production
```

### 3. Setup the frontend
```bash
cd ../client
npm install
```

Create a `.env` file in `/client`:
```env
VITE_API_URL=http://localhost:5000
```

Start the frontend:
```bash
npm run dev
```

### 4. Access the app
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000`

---

## 🔑 Key Implementation Details

### Eligibility-Based Notifications
When an admin posts a company, the backend immediately scans all students and pushes a notification into any matching student's profile (CGPA ≥ minCgpa AND branch in eligibleBranches). A second check runs on every dashboard load as a safety net — catching students who registered after the company was posted. Duplicate notifications are prevented via a `Set` of already-notified company IDs.

### File Upload Flow
Files never touch MongoDB or the server's disk. Multer captures uploaded files in memory as a buffer → streams them to Cloudinary via `upload_stream` → Cloudinary returns a `secure_url` → only the URL string is saved to MongoDB.

### Application Snapshot
When a student applies, their current profile data (CGPA, branch, skills, etc.) is copied as a snapshot into the `CompanyApplication` document — not just referenced. This means admins always see what the student's profile looked like at apply-time, even if the student updates their profile later.

---

## 📸 Screenshots

> <img width="1917" height="1081" alt="image" src="https://github.com/user-attachments/assets/a1444fdf-5471-4335-9d1b-ce6b6ef2abfe" />
><img width="1917" height="1072" alt="image" src="https://github.com/user-attachments/assets/bdc0982b-1f03-451e-a09d-d0ce93e8640f" />
><img width="1900" height="1026" alt="image" src="https://github.com/user-attachments/assets/11d0f701-b863-4777-9cee-e087dbf86522" />
><img width="1912" height="1081" alt="image" src="https://github.com/user-attachments/assets/f66cb982-7289-45e7-9a20-66cd52b56ac7" />


---

## 🤝 Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

---

## 📄 License

MIT

---

Built with ❤️ for college students who deserve better than a WhatsApp forward for placement news.
