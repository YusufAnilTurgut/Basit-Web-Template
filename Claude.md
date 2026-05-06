# Project Notes

Bu repo alan bagimsiz web proje template'idir.

## Amac

- .NET API, Next.js frontend, SQL Server ve Nginx reverse proxy icin temiz baslangic saglar.
- Backend sadece DB baglantisini test eden generic endpoint icerir.
- Frontend tek sayfada API ve DB durumunu gosterir.

## Calistirma

```powershell
pwsh scripts/setup-env.ps1 -Mode local
docker compose up --build
```

## Backend

Ana proje:

```text
backend/BasicWebTemplate.API/BasicWebTemplate.API
```

Onemli endpoint:

```text
GET /api/database/status
```

Bu endpoint SQL Server'a `SELECT 1` sorgusu atar.

## Frontend

Ana ekran:

```text
frontend/app/page.tsx
```

API base URL:

```text
NEXT_PUBLIC_API_URL
```

## Nginx

- `nginx/nginx.local.conf`: local HTTP config
- `nginx/nginx.prod.conf`: production template
- `nginx/nginx.conf`: docker compose tarafindan mount edilen aktif config

Production domain ve sertifika path'leri `scripts/setup-env.ps1 -Mode prod` ile `nginx/nginx.conf` icine yazilir.
