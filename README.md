# 🏋️ GymFinder

> A full-stack gym discovery platform — find gyms near you, read reviews, compare packages, and manage everything from a powerful admin panel.

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://typescriptlang.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-green?logo=mongodb)](https://mongodb.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38bdf8?logo=tailwindcss)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## ✨ Features

### For Users
- 🗺️ **Interactive Map** — browse gyms on OpenStreetMap, pinpoint locations instantly
- 🔍 **Search & Filter** — filter by city, name, amenities, rating, or price range
- ⭐ **Ratings & Reviews** — read and write reviews for any gym
- 💳 **Pricing Packages** — compare monthly membership plans side by side
- 🌐 **Multi-language** — Persian (RTL), English, and Italian support

### For Gym Owners
- 📊 **Owner Dashboard** — stats overview at a glance
- 📦 **Package Management** — add, edit, and remove pricing tiers
- 💬 **Review Inbox** — read what members are saying
- 🕐 **Working Hours & Contact** — keep your info up to date

### For Admins
- 🛡️ **Admin Panel** — full control over the platform
- ✅ **Gym Verification** — approve or reject gym listings
- 👥 **User Management** — manage members and gym owners
- ➕ **Add Gyms** — create listings with full multilingual data
- 🌍 **Default Language** — change the site's default language globally

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS (dark theme, orange accents) |
| Database | MongoDB + Mongoose |
| Auth | NextAuth.js |
| Map | Leaflet.js + OpenStreetMap |
| UI Pattern | Server Components + Client Islands |

---

## 🏃 Getting Started

### Prerequisites

- Node.js >= 18
- MongoDB instance (local or Atlas)

### Installation

```bash
git clone https://github.com/hesamhadadi/gym.git
cd gym
npm install
```

### Environment Variables

```bash
cp .env.example .env
```

Edit `.env`:

```env
MONGODB_URI=mongodb://localhost:27017/gymfinder
NEXTAUTH_SECRET=your_secret_here
NEXTAUTH_URL=http://localhost:3000
```

### Run

```bash
# Development
npm run dev

# Seed the database
npm run seed

# Production build
npm run build
npm start
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🏋️ Supported Amenities

`shower` `pool` `aerobics` `sauna` `parking` `locker` `personalTrainer` `yoga` `spinning` `boxing` `supplements` `wifi` `cafe` `womenOnly` `open24h`

---

## 📁 Project Structure

```
gym/
├── src/
│   ├── app/              # Next.js App Router pages & API routes
│   ├── components/       # Reusable UI components
│   ├── models/           # Mongoose schemas
│   ├── lib/              # DB connection, auth config, helpers
│   └── types/            # TypeScript type definitions
├── scripts/              # Seed scripts
├── public/               # Static assets
├── .env.example
├── tailwind.config.ts
└── next.config.js
```

---

## 📸 Screenshots

> Coming soon

---

## 🤝 Contributing

Pull requests are welcome. For major changes, please open an issue first.

---

## 📜 License

MIT © [Hesam Hadadi](https://github.com/hesamhadadi)
