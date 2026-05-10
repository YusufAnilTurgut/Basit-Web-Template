# Basic Web Template

.NET API + Next.js frontend + SQL Server + Nginx icin temiz baslangic template'i.

Bu template uygulama alani kodu icermez. Backend yalnizca SQL Server'a sorgu atar ve veritabanindan sonuc alip alamadigini bildirir. Frontend bu durumu tek ekranda gosterir.

## Stack

| Katman | Teknoloji |
| --- | --- |
| Backend | .NET 10 Web API |
| Frontend | Next.js 16 + React 19 + TypeScript |
| Database | SQL Server 2022 Express |
| Reverse proxy | Nginx |
| Runtime | Docker Compose |

## API

Backend route prefix'i `/api` olarak kalir.

| Endpoint | Aciklama |
| --- | --- |
| `GET /api` | API ayakta mi kontrolu |
| `GET /api/database/status` | SQL Server'a `SELECT 1` atar, sonuc donup donmedigini bildirir |

Ornek cevap:

```json
{
  "status": "ok",
  "databaseConnected": true,
  "hasResult": true,
  "result": "1",
  "elapsedMilliseconds": 12,
  "message": "Database query returned a result."
}
```

## Ilk Kurulum

PowerShell ile interaktif kurulum:

```powershell
pwsh scripts/setup-env.ps1 -Mode local
```

Production icin:

```powershell
pwsh scripts/setup-env.ps1 -Mode prod
```

Script sunlari uretir:

- `.env`
- `nginx/nginx.conf`

Production modunda domain, HTTP/HTTPS host portlari ve SSL sertifika path'leri sorulur. `nginx/nginx.prod.conf` dosyasi template olarak kullanilir; container'a direkt mount edilen dosya `nginx/nginx.conf` dosyasidir.

## Elle Ayarlama

Script kullanmak istemezsen:

```powershell
Copy-Item .env.example .env
```

Gerekli alanlar:

```env
SA_PASSWORD=ChangeThis!12345
DB_NAME=AppTemplateDb
NEXT_PUBLIC_API_URL=http://localhost/api
FRONTEND_ORIGIN=http://localhost
LOCAL_FRONTEND_ORIGIN=http://localhost:3000
NGINX_HTTP_PORT=80
NGINX_HTTPS_PORT=443
NGINX_CONF_FILE=./nginx/nginx.local.conf
LETSENCRYPT_PATH=./nginx/letsencrypt
```

Production sunucuda genelde:

```env
NEXT_PUBLIC_API_URL=https://example.com/api
FRONTEND_ORIGIN=https://example.com
NGINX_CONF_FILE=./nginx/nginx.conf
LETSENCRYPT_PATH=/etc/letsencrypt
```

## Docker ile Calistirma

```powershell
docker compose up --build
```

Varsayilan adres:

- Frontend: `http://localhost`
- API: `http://localhost/api/database/status`

Port cakisirsa `.env` icinden `NGINX_HTTP_PORT` ve `NGINX_HTTPS_PORT` degerlerini degistir.

## Lokal Gelistirme

Backend:

```powershell
cd backend\BasicWebTemplate.API\BasicWebTemplate.API
dotnet run
```

Frontend:

```powershell
cd frontend
npm install
npm run dev
```

Frontend dev modunda varsayilan API adresi:

```text
http://localhost:5094/api
```

Farkli adres kullanacaksan `frontend/.env.local` olustur:

```env
NEXT_PUBLIC_API_URL=http://localhost:5094/api
```

## Klasor Yapisi

```text
backend/
  BasicWebTemplate.API/
    BasicWebTemplate.API/
      Controllers/DatabaseController.cs
      Data/AppDbContext.cs
frontend/
  app/page.tsx
nginx/
  nginx.conf
  nginx.local.conf
  nginx.prod.conf
scripts/
  setup-env.ps1
docker-compose.yml
```

## Notlar

- Domain ve host portlari koda gomulu degil; `.env` ve setup script'i ile verilir.
- Local Docker calistirmada `NGINX_CONF_FILE=./nginx/nginx.local.conf`, production'da `NGINX_CONF_FILE=./nginx/nginx.conf` kullanilir.
- Backend production'da Nginx arkasinda HTTP 8080 dinler.
- CORS origin'leri `Cors__AllowedOrigins__0` ve `Cors__AllowedOrigins__1` env degerlerinden gelir.
- Backend ilk acilista configured SQL database yoksa `EnsureCreated` ile olusturmayi dener.
- SQL Server verisi `sqlserver_data` Docker volume'unde saklanir.
