<div align="center">
  <h1>🚦 API Gateway</h1>
  <p><em>Single entry point — handles auth, routing, and rate limiting for the Football Community App</em></p>

  <img src="https://img.shields.io/badge/Runtime-Bun-black?logo=bun" />
  <img src="https://img.shields.io/badge/Framework-Hono-orange" />
  <img src="https://img.shields.io/badge/Language-TypeScript-blue?logo=typescript" />
  <img src="https://img.shields.io/badge/Port-3000-green" />
</div>

---

## 📖 Overview

API Gateway adalah **satu-satunya pintu masuk** untuk seluruh request dari klien (mobile/web). Tidak ada service internal yang langsung diakses oleh klien — semua harus melewati gateway ini terlebih dahulu.

**Tanggung jawab utama:**
- ✅ Memverifikasi JWT token sebelum request diteruskan
- ✅ Menerapkan rate limiting per IP
- ✅ Meneruskan (proxy) request ke microservice yang tepat
- ✅ Menyisipkan informasi user ke header request internal
- ✅ Menangani CORS untuk semua origin

---

## 🗺️ Routing Map

| Route | Diteruskan ke | Auth Required |
|---|---|---|
| `GET /health` | Gateway sendiri (health check) | ❌ |
| `/auth/*` | Auth Service `:3001/auth/*` | ❌ |
| `/upload/*` | Auth Service `:3001/upload/*` | ❌ |
| `/football/*` | Football Service `:3002/football/*` | ✅ JWT |
| `/forum/*` | Forum Service `:3003/forum/*` | ✅ JWT |
| `/report/*` | Report Service `:3005/report/*` | ✅ JWT |

> ℹ️ Route `/auth/*` dan `/upload/*` sengaja **tidak** memerlukan JWT karena digunakan untuk proses login, register, dan verifikasi OTP.

---

## 🔐 Cara Kerja Autentikasi

Untuk setiap request ke `/football/*`, `/forum/*`, dan `/report/*`, gateway melakukan:

```
Request masuk
  │
  ▼
Cek header Authorization: Bearer <token>
  │
  ├─ Tidak ada → 401 Unauthorized
  │
  └─ Ada → Verifikasi JWT dengan JWT_SECRET
              │
              ├─ Token invalid / expired → 401 Unauthorized
              │
              └─ Valid → Ekstrak payload (userId, role, email/username)
                            │
                            ▼
                        Teruskan ke service tujuan dengan header tambahan:
                          x-user-id: <userId>
                          x-user-role: <role>
                          x-user-email: <email>       ← football & report route
                          x-user-username: <username> ← forum route
                          x-internal-secret: <secret>
```

Service internal kemudian memvalidasi `x-internal-secret` untuk memastikan request datang dari gateway, bukan dari luar.

---

## 🛡️ Rate Limiting

Diterapkan pada route terproteksi (`/football/*`, `/forum/*`, dan `/report/*`):

| Parameter | Nilai |
|---|---|
| Maks request | **100 request** |
| Jendela waktu | **per 60 detik** |
| Identifikasi | Berdasarkan IP (`x-forwarded-for` header) |
| Respons saat limit tercapai | `429 Too Many Requests` |

---

## 📂 Struktur Direktori

```
api-gateway/
├── src/
│   ├── index.ts            # Entry point — setup Hono app, daftarkan semua route
│   ├── config/
│   │   └── env.ts          # Parsing & validasi environment variables
│   ├── middlewares/
│   │   ├── auth.middleware.ts        # Verifikasi JWT, set user ke context
│   │   ├── rate-limit.middleware.ts  # In-memory rate limiter per IP
│   │   ├── role.middleware.ts        # Cek role user (USER / ADMIN)
│   │   └── logger.middleware.ts      # Log setiap incoming request
│   ├── routes/
│   │   ├── auth.route.ts      # Proxy semua /auth/* → auth-service
│   │   ├── football.route.ts  # Proxy semua /football/* → football-service (+ auth)
│   │   ├── forum.route.ts     # Proxy semua /forum/* → forum-service (+ auth)
│   │   ├── report.route.ts    # Proxy semua /report/* → report-service (+ auth)
│   │   └── upload.route.ts    # Proxy semua /upload/* → auth-service
│   └── utils/
│       ├── proxy.ts  # Fungsi helper untuk meneruskan request HTTP
│       └── jwt.ts    # Wrapper verifyToken menggunakan jsonwebtoken
├── .env.example     # Template konfigurasi environment
├── Dockerfile       # Docker build image untuk production
├── package.json     # Dependencies dan scripts
└── tsconfig.json    # Konfigurasi TypeScript
```

---

## ⚙️ Konfigurasi Environment

Salin file contoh lalu isi sesuai kebutuhan:

```bash
cp .env.example .env
```

| Variabel | Contoh Nilai | Keterangan |
|---|---|---|
| `PORT` | `3000` | Port yang digunakan gateway |
| `JWT_SECRET` | `jwt_rahasia_kuat` | Secret untuk verifikasi JWT — **harus identik dengan auth-service** |
| `INTERNAL_SECRET` | `internal_rahasia_kuat` | Kunci komunikasi internal — **harus sama di semua service** |
| `AUTH_SERVICE_URL` | `http://auth-service:3001` | URL auth service (nama container Docker) |
| `FOOTBALL_SERVICE_URL` | `http://football-service:3002` | URL football service |
| `FORUM_SERVICE_URL` | `http://forum-service:3003` | URL forum service |
| `REPORT_SERVICE_URL` | `http://report-service:3005` | URL report service |

> ⚠️ **Penting:** Saat development lokal (tanpa Docker), gunakan `http://localhost:PORT` sebagai nilai URL service.

---

## 🚀 Cara Menjalankan

### Prasyarat
- [Bun](https://bun.sh/) v1.x terinstal
- Semua microservice yang dituju harus sudah berjalan (auth, football, forum, report)

### Development (hot-reload)

```bash
# 1. Install dependencies
bun install

# 2. Siapkan environment
cp .env.example .env
# Edit .env sesuai kebutuhan

# 3. Jalankan
bun run dev
```

Server berjalan di: `http://localhost:3000`

### Production

```bash
bun run start
```

### Menggunakan Docker

```bash
# Build image
docker build -t api-gateway:latest .

# Jalankan container
docker run -p 3000:3000 --env-file .env api-gateway:latest
```

---

## 🧪 Verifikasi Berjalan

```bash
curl http://localhost:3000/health
# Response: {"status":"ok","service":"api-gateway"}
```

---

## 🛠️ Tech Stack

| Komponen | Teknologi |
|---|---|
| Runtime | [Bun](https://bun.sh/) |
| Web Framework | [Hono](https://hono.dev/) |
| Auth | jsonwebtoken |
| Language | TypeScript |

---

## ❓ Troubleshooting

**`404 Not Found` saat hit endpoint?**
> Pastikan microservice yang dituju sudah berjalan. Cek juga nilai `AUTH_SERVICE_URL`, `FOOTBALL_SERVICE_URL`, `FORUM_SERVICE_URL`, `REPORT_SERVICE_URL` di `.env` — harus menunjuk ke host dan port yang benar.

**Token valid tapi dapat `401 Unauthorized`?**
> Pastikan nilai `JWT_SECRET` di file `.env` ini **persis sama** dengan `JWT_SECRET` yang digunakan auth-service saat menandatangani token.

**Request internal gagal dengan `403 Forbidden`?**
> Cek nilai `INTERNAL_SECRET` — harus identik di semua service (gateway, auth, football, forum, report, notification).

**`429 Too Many Requests`?**
> Kamu sudah melampaui batas 100 request/menit. Tunggu 60 detik atau sesuaikan nilai `limit` dan `windowMs` di `rate-limit.middleware.ts`.

---

## 🔗 Hubungan dengan Service Lain

Repositori ini adalah bagian dari ekosistem **Football Community App Backend**:

| Repositori | Peran |
|---|---|
| **api-gateway** ← *Kamu di sini* | Entry point & traffic router |
| [auth-service](#) | Autentikasi, profil, biometric |
| [football-service](#) | Data liga, tim, jadwal |
| [forum-service](#) | Post, komentar, voting |
| [report-service](#) | Manajemen laporan dan moderasi |
| [notification-service](#) | Email OTP via RabbitMQ |
