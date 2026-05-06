# DevOps Reference

Bu dosya Docker tabanli template deploy akisini ozetler.

## Servisler

| Servis | Icerik | Container port |
| --- | --- | --- |
| `sqlserver` | SQL Server 2022 Express | 1433 |
| `backend` | .NET API | 8080 |
| `frontend` | Next.js standalone server | 3000 |
| `nginx` | Reverse proxy | 80, 443 |

Host tarafinda Nginx portlari `.env` ile ayarlanir:

```env
NGINX_HTTP_PORT=80
NGINX_HTTPS_PORT=443
```

## Production Kurulum

1. Sunucuda Docker ve Docker Compose kur.
2. DNS kayitlarini sunucu IP adresine yonlendir.
3. SSL sertifikalarini host uzerinde al:

```bash
sudo certbot certonly --nginx -d example.com -d www.example.com
```

4. Repo icinde production config uret:

```powershell
pwsh scripts/setup-env.ps1 -Mode prod
```

5. `.env` icinde production degerlerini kontrol et:

```env
NEXT_PUBLIC_API_URL=https://example.com/api
FRONTEND_ORIGIN=https://example.com
LETSENCRYPT_PATH=/etc/letsencrypt
```

6. Servisleri baslat:

```bash
docker compose up --build -d
```

## Nginx Akisi

```text
Browser
  -> Nginx :80/:443
    -> /api/*  -> backend:8080
    -> /*      -> frontend:3000
```

Backend route prefix'i korunur. Nginx rewrite kullanmaz.

## Kontrol Komutlari

```bash
docker compose ps
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f nginx
docker compose logs -f sqlserver
```

API kontrolu:

```bash
curl http://localhost/api/database/status
```

Production:

```bash
curl https://example.com/api/database/status
```

## Backup

SQL Server volume adi:

```text
sqlserver_data
```

Production'da duzenli SQL backup icin host tarafinda `sqlcmd` veya ayrica bir backup container'i kullan.

## Degistirilecek Yerler

Yeni proje baslatirken genelde sadece sunlar degisir:

- `.env`
- `nginx/nginx.conf`
- Frontend ekranlari
- Backend controller/model katmani
