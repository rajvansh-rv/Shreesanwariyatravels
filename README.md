# 🚕 Shree Sanwariya Travels

> **Official Website & Online Booking Platform for Shree Sanwariya Travels, Ujjain (Madhya Pradesh, India)**  
> *Providing trusted taxi services, local city rides, Ujjain to Indore transfers, pilgrimage tour packages, and Tempo Traveller rentals.*

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/React-18-blue.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF.svg)](https://vitejs.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green.svg)](https://www.mongodb.com/atlas)

---

## 📁 Repository Structure

```text
ShreeSanwariyaTravels/
├── backend/                  # Node.js & Express REST API
│   ├── config/               # Database connection (MongoDB Atlas with fallback DNS)
│   ├── middleware/           # Authentication & role-based access control
│   ├── models/               # Mongoose schemas (Booking, User, Review)
│   ├── routes/               # API endpoint routers (Auth, User, Admin, Review)
│   ├── utils/                # Validation & reusable Nodemailer mailer
│   ├── server.js             # Express application entry point
│   ├── .env.example          # Environment variables template
│   └── package.json          # Backend dependencies & scripts
├── frontend/                 # React (Vite) Single Page Application
│   ├── public/               # Static assets, robots.txt, sitemap.xml, branding images
│   ├── src/
│   │   ├── components/       # Reusable UI components (Navbar, Footer, Modals)
│   │   ├── context/          # React Context (AuthContext)
│   │   ├── pages/            # View pages (Home, Admin Portal)
│   │   ├── sections/         # Homepage sections (Hero, Fleet, Destinations, Reviews, Booking)
│   │   ├── services/         # API HTTP client
│   │   ├── App.jsx           # Root application component
│   │   └── main.jsx          # Vite React mounting
│   ├── index.html            # Primary HTML with SEO & JSON-LD Schema
│   ├── .env.example          # Frontend environment variables template
│   └── package.json          # Frontend dependencies & scripts
├── .gitignore                # Root gitignore protecting all secrets & build folders
├── LICENSE                   # MIT Open Source License
└── README.md                 # Project documentation
```

---

## 🌟 Implemented Features

1. **Online Trip Booking Form**:
   - Validation for names, 10-digit Indian phone numbers, travel dates, and vehicle selection.
   - Dual dispatch: Saves structured record to MongoDB Atlas and opens pre-filled WhatsApp confirmation.
2. **GPS Pickup Location (Phase 4)**:
   - Native browser Geolocation API integration (`navigator.geolocation.getCurrentPosition`).
   - Captures exact latitude and longitude with manual override and reset controls.
   - Admin can view the exact customer pickup on Google Maps in one click.
3. **Customer Authentication & Portal**:
   - Customer registration, JWT login, and profile management.
   - View past booking history and review eligibility.
4. **Authentic Customer Review & Rating System**:
   - 5-star rating submissions linked to verified customer bookings.
   - Interactive homepage carousel featuring top approved reviews with touch swipe support.
   - Aggregate rating summary card with star distribution breakdown.
5. **Admin Management Dashboard (`/admin`)**:
   - Secure admin authentication.
   - Live business statistics (Total, Pending, Confirmed, Completed, Cancelled trips).
   - Real-time search, multi-filter, and sorting controls.
   - Status updates, permanent record deletion, and one-click CSV export.
   - Full review moderation panel (Approve, Reject, Toggle Featured).
6. **Automated Email Notifications**:
   - Nodemailer with connection pooling.
   - Branded HTML + Plain Text notifications sent to the admin upon new booking arrival.
   - Safe decoupling: Database bookings are preserved even if SMTP temporarily fails.
7. **Local & Technical SEO (Phase 11)**:
   - Canonical URL tag: `https://shreesanwariyatravels.in/`
   - Complete Open Graph protocol and Twitter / X summary cards.
   - Schema.org JSON-LD `LocalBusiness` and `Service` structured data.
   - Search-engine crawlable `robots.txt` and `sitemap.xml`.
   - Dynamic `noindex, nofollow` meta-tag protection for private admin routes.

---

## 🛠️ Local Development Setup

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **MongoDB Atlas** database cluster

---

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create local environment file from template
cp .env.example .env
```

Open `backend/.env` and configure your credentials:
```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/shree_sanwariya_travels?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_admin_password
ADMIN_TOKEN=your_admin_static_token
EMAIL_USER=your_business_email@gmail.com
EMAIL_PASS=your_16_character_gmail_app_password
ADMIN_EMAIL=your_business_email@gmail.com
```

Start the backend server:
```bash
node server.js
```
*Backend runs on `http://localhost:5000`.*

---

### 2. Frontend Setup

```bash
# Open a new terminal and navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```
*Frontend runs on `http://localhost:5173`.*

---

## 🚀 Production Deployment Guide

### Architecture Overview
- **Frontend**: Deployed on **Netlify**
- **Backend API**: Deployed on **Render**
- **Database**: Hosted on **MongoDB Atlas**

---

### Step 1: Deploy Backend on Render
1. Create a **New Web Service** connected to your GitHub repository.
2. Configure settings:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
3. Add **Environment Variables** in Render Dashboard:
   - `MONGODB_URI`: `mongodb+srv://...`
   - `JWT_SECRET`: `your_secure_jwt_secret`
   - `ADMIN_USERNAME`: `admin`
   - `ADMIN_PASSWORD`: `your_admin_password`
   - `ADMIN_TOKEN`: `your_admin_token`
   - `EMAIL_USER`: `shreesanwariyatravels0713@gmail.com`
   - `EMAIL_PASS`: `[Your 16-character Gmail App Password]`
   - `ADMIN_EMAIL`: `shreesanwariyatravels0713@gmail.com`
   - `NODE_ENV`: `production`

---

### Step 2: Deploy Frontend on Netlify
1. Create a **New Site from Git** connected to your GitHub repository.
2. Configure build settings:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`
3. Add **Environment Variable** in Netlify:
   - `VITE_API_BASE_URL`: `https://your-render-backend-name.onrender.com/api`

---

## 🔒 Security & Privacy Practices

- **Zero Hardcoded Secrets**: All database connection strings, tokens, and passwords reside solely in `.env` files.
- **Git Protected**: `.gitignore` prevents `.env`, `node_modules/`, and build artifacts from ever being committed to version control.
- **Gmail App Password**: SMTP operates securely via Google App Passwords without exposing Google Account credentials.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

**Developed for Shree Sanwariya Travels • Ujjain, Madhya Pradesh, India**
