# 🚀 Deploy LaundryPro ke Vercel

Panduan lengkap untuk deploy aplikasi LaundryPro ke Vercel.

## 📋 Prerequisites

1. Akun GitHub
2. Akun Vercel (gratis)
3. Database PostgreSQL (gratis dari Neon atau Vercel Postgres)

## 🗄️ Step 1: Setup Database PostgreSQL

### Opsi A: Menggunakan Neon (Recommended - Gratis)

1. Buka https://neon.tech
2. Klik "Sign Up" dan login dengan GitHub
3. Buat project baru:
   - Name: `laundrypro`
   - Region: Pilih terdekat (Singapore/Tokyo untuk Asia)
4. Copy **Connection String** yang diberikan
5. Simpan untuk nanti digunakan di Vercel

### Opsi B: Menggunakan Vercel Postgres

1. Nanti akan dibuat otomatis dari dashboard Vercel setelah deploy
2. Ikuti instruksi di dashboard Vercel setelah connect project

## 📤 Step 2: Push ke GitHub

1. Buat repository baru di GitHub:
   ```bash
   # Initialize git (jika belum)
   git init
   
   # Add remote
   git remote add origin https://github.com/USERNAME/laundrypro.git
   
   # Add all files
   git add .
   
   # Commit
   git commit -m "Initial commit - LaundryPro v1.0"
   
   # Push
   git push -u origin main
   ```

## 🌐 Step 3: Deploy ke Vercel

1. Buka https://vercel.com
2. Klik "Add New" → "Project"
3. Import repository GitHub Anda (`laundrypro`)
4. Configure Project:
   - **Framework Preset**: Next.js (auto-detect)
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (auto-detect)
   - **Output Directory**: `.next` (auto-detect)

5. **Environment Variables** - Tambahkan:
   ```
   DATABASE_URL=postgresql://...     (dari Neon/Vercel Postgres)
   DIRECT_URL=postgresql://...       (sama dengan DATABASE_URL)
   ```

6. Klik **"Deploy"**

## ⚙️ Step 4: Setup Database Schema

Setelah deploy berhasil:

1. Buka dashboard Vercel project Anda
2. Klik tab **"Settings"** → **"Environment Variables"**
3. Pastikan `DATABASE_URL` dan `DIRECT_URL` sudah terisi
4. Kembali ke **"Deployments"**
5. Klik deployment terbaru → **"..."** → **"Redeploy"**
6. Centang ✅ **"Use existing Build Cache"** → Klik **"Redeploy"**

Atau jalankan manual dari terminal lokal:

```bash
# Set environment variable
export DATABASE_URL="postgresql://..."

# Push schema to production database
npx prisma db push

# (Optional) Seed data
npm run db:seed
```

## 🎉 Step 5: Verifikasi Deployment

1. Buka URL deployment Anda (contoh: `https://laundrypro.vercel.app`)
2. Test halaman:
   - Dashboard ✅
   - POS ✅
   - Orders ✅
   - Customers ✅
   - Inventory ✅
   - Services ✅
   - Reports ✅
   - Settings ✅

## 🔧 Troubleshooting

### Error: "Can't reach database server"
- Pastikan DATABASE_URL benar
- Cek apakah database Neon masih aktif
- Verifikasi format connection string

### Error: "Build failed"
- Cek build logs di Vercel
- Pastikan semua dependencies ada di `package.json`
- Coba build lokal: `npm run build`

### Error: "Prisma Client not found"
- Pastikan `postinstall` script ada di `package.json`
- Redeploy dengan "Use existing Build Cache" dimatikan

## 📱 Custom Domain (Optional)

1. Buka **Settings** → **Domains**
2. Tambahkan domain Anda
3. Update DNS records sesuai instruksi Vercel
4. Tunggu propagasi DNS (5-60 menit)

## 🔐 Security Tips

1. **Jangan commit `.env` ke Git**
2. Gunakan environment variables di Vercel untuk secrets
3. Enable "Deployment Protection" di Vercel settings
4. Tambahkan authentication (next step development)

## 📊 Monitoring

- Dashboard Vercel: Lihat analytics, logs, metrics
- Neon Console: Monitor database queries
- Setup alerts untuk downtime

## 🆘 Support

Jika ada masalah:
1. Cek Vercel logs: Dashboard → Deployment → Function Logs
2. Cek Prisma logs di terminal
3. Contact support Vercel/Neon

---

✅ **Selamat! Aplikasi LaundryPro Anda sudah live di production!** 🎉
