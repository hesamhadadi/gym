# 🏋️ GymFinder - باشگاه یاب

A full-stack gym finder web application built with Next.js 14, TypeScript, Tailwind CSS, and MongoDB.

## Features

- 🗺️ **Interactive Map** - Find gyms near your location on OpenStreetMap
- 🔍 **Search & Filter** - Search by name, city, or amenities
- ⭐ **Ratings & Reviews** - User rating and review system
- 💳 **Packages** - Monthly pricing packages with multi-language support
- 🌐 **Multi-language** - Persian (RTL), English, Italian
- 🛡️ **Admin Panel** - Full site management
- 🏋️ **Gym Owner Panel** - Manage packages, view reviews, edit info
- 📱 **Responsive** - Mobile-friendly dark UI

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose
- **Auth**: NextAuth.js
- **Map**: Leaflet.js / OpenStreetMap
- **UI**: Dark theme with orange accents

## Setup

### 1. Clone & Install
```bash
git clone https://github.com/hesamhadadi/gym.git
cd gym
npm install
```

### 2. Environment Variables
Copy `.env.example` to `.env.local` and fill in:
```
MONGODB_URI=your_mongodb_connection_string
NEXTAUTH_SECRET=your_secret_key
NEXTAUTH_URL=http://localhost:3000
```

### 3. Seed Database
```bash
npm run seed
```

This creates:
- Admin: `admin@gymfinder.ir` / `Admin@1234`
- Gym Owners: `owner1@gymfinder.ir` / `Owner@1234`
- Regular User: `ali@test.ir` / `User@1234`
- 8 sample gyms across Iran

### 4. Run
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Routes

| Route | Description |
|-------|-------------|
| `/` | Home page |
| `/gyms` | Gym listing with filters |
| `/gyms/[id]` | Gym detail with map |
| `/map` | Full map view |
| `/auth/login` | Login |
| `/auth/register` | Register |
| `/admin` | Admin panel (admin role) |
| `/dashboard` | Gym owner panel |

## Admin Panel Features

- Dashboard with stats
- Manage gyms (add, edit, delete, verify)
- Manage users
- Register gym owners
- Add gyms with full multilingual data
- Change default site language

## Gym Owner Panel Features

- Overview with stats
- Manage pricing packages
- View user reviews
- Edit contact info & working hours

## Amenities Supported

shower, pool, aerobics, sauna, parking, locker, personalTrainer, yoga, spinning, boxing, supplements, wifi, cafe, womenOnly, open24h
