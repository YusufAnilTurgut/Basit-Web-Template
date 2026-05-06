# Hızlı Komut Referansı

## SSH
```bash
ssh deploy@SUNUCU_IP
```

## Deploy
```bash
~/scripts/deploy.sh
ssh deploy@SUNUCU_IP 'bash ~/scripts/deploy.sh'   # PC'den
```

## Backend
```bash
sudo systemctl status PROJE-api --no-pager
sudo systemctl restart PROJE-api
sudo journalctl -u PROJE-api -n 50 --no-pager
sudo journalctl -u PROJE-api -f                    # canlı takip
```

## Frontend
```bash
pm2 status
pm2 restart PROJE-frontend
pm2 logs PROJE-frontend --lines 30 --nostream
```

## Nginx
```bash
sudo nginx -t
sudo systemctl reload nginx
sudo tail -f /var/log/nginx/error.log
```

## SQL Server
```bash
sudo systemctl status mssql-server --no-pager

# Backup
sudo /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "SIFRE" -C \
  -Q "BACKUP DATABASE PROJE_DB TO DISK='/var/backups/proje.bak'"

# Sorgu
sudo /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "SIFRE" -C -d PROJE_DB \
  -Q "SELECT TOP 10 * FROM TABLO"
```

## SSL
```bash
sudo certbot certificates
sudo certbot renew --dry-run
sudo certbot --nginx -d DOMAIN.com
```

## Firewall
```bash
sudo ufw status
sudo ufw allow 1433/tcp        # SQL geçici aç (SSMS için)
sudo ufw delete allow 1433/tcp # kapat
```

## Sistem
```bash
df -h         # disk
free -h       # ram
htop          # canlı monitör
```

## Git
```bash
cd /home/deploy/repo/PROJE_ADI
git status
git pull origin main
git log --oneline -10
```

## EF Core Migration (kendi PC'de)
```powershell
cd backend\PROJE.API
dotnet ef migrations add MigrationAdi
dotnet ef database update                # local test
git add . && git commit -m "..." && git push
```

## Vim
```
i           insert moduna geç
Esc         komut moduna dön
:w          kaydet
:wq         kaydet ve çık
:q!         kaydetmeden çık
/aranan     ara
dd          satır sil
u           geri al
```

## Test (kendi PC'de)
```powershell
type frontend\.env.production
type frontend\.env.local

cd frontend
Remove-Item -Recurse -Force .next
npm run build

# Build içine env gerçekten gömüldü mü
findstr /s /i "DOMAIN.com" .next\* | findstr /v ".map"
```
