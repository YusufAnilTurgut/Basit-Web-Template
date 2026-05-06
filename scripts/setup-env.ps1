param(
    [string]$Mode = ""
)

$ErrorActionPreference = "Stop"

function Read-Value {
    param(
        [string]$Prompt,
        [string]$Default
    )

    $suffix = if ($Default) { " [$Default]" } else { "" }
    $value = Read-Host "$Prompt$suffix"
    if ([string]::IsNullOrWhiteSpace($value)) {
        return $Default
    }

    return $value.Trim()
}

$root = Split-Path -Parent $PSScriptRoot

if (-not $Mode) {
    $Mode = Read-Value "Mode (local/prod)" "local"
}

if ($Mode -ne "local" -and $Mode -ne "prod") {
    throw "Mode must be 'local' or 'prod'."
}

$dbName = Read-Value "Database name" "AppTemplateDb"
$saPassword = Read-Value "SQL Server SA password" "ChangeThis!12345"
$httpPort = Read-Value "Nginx HTTP host port" "80"
$httpsPort = Read-Value "Nginx HTTPS host port" "443"

if ($Mode -eq "prod") {
    $domains = Read-Value "Domain list for nginx server_name" "example.com www.example.com"
    $primaryDomain = ($domains -split "\s+")[0]
    $frontendOriginDefault = if ($httpsPort -eq "443") { "https://$primaryDomain" } else { "https://$primaryDomain`:$httpsPort" }
    $apiUrlDefault = "$frontendOriginDefault/api"
    $letsencryptPath = Read-Value "Let's Encrypt host path" "/etc/letsencrypt"
    $sslCertificate = Read-Value "SSL certificate path inside nginx container" "/etc/letsencrypt/live/$primaryDomain/fullchain.pem"
    $sslCertificateKey = Read-Value "SSL certificate key path inside nginx container" "/etc/letsencrypt/live/$primaryDomain/privkey.pem"

    $templatePath = Join-Path $root "nginx/nginx.prod.conf"
    $nginxConfig = Get-Content -LiteralPath $templatePath -Raw
    $nginxConfig = $nginxConfig.Replace("{{SERVER_NAME}}", $domains).Replace("{{SSL_CERTIFICATE}}", $sslCertificate).Replace("{{SSL_CERTIFICATE_KEY}}", $sslCertificateKey)
} else {
    $frontendOriginDefault = if ($httpPort -eq "80") { "http://localhost" } else { "http://localhost`:$httpPort" }
    $apiUrlDefault = "$frontendOriginDefault/api"
    $letsencryptPath = "./nginx/letsencrypt"

    $templatePath = Join-Path $root "nginx/nginx.local.conf"
    $nginxConfig = Get-Content -LiteralPath $templatePath -Raw
}

$nextPublicApiUrl = Read-Value "NEXT_PUBLIC_API_URL" $apiUrlDefault
$frontendOrigin = Read-Value "Frontend origin for CORS" $frontendOriginDefault
$localFrontendOrigin = Read-Value "Local Next.js dev origin for CORS" "http://localhost:3000"

$envPath = Join-Path $root ".env"
if (Test-Path -LiteralPath $envPath) {
    $stamp = Get-Date -Format "yyyyMMddHHmmss"
    Copy-Item -LiteralPath $envPath -Destination "$envPath.bak.$stamp"
}

$envLines = @(
    "SA_PASSWORD=$saPassword",
    "DB_NAME=$dbName",
    "NEXT_PUBLIC_API_URL=$nextPublicApiUrl",
    "FRONTEND_ORIGIN=$frontendOrigin",
    "LOCAL_FRONTEND_ORIGIN=$localFrontendOrigin",
    "NGINX_HTTP_PORT=$httpPort",
    "NGINX_HTTPS_PORT=$httpsPort",
    "LETSENCRYPT_PATH=$letsencryptPath"
)

Set-Content -LiteralPath $envPath -Value $envLines -Encoding utf8
Set-Content -LiteralPath (Join-Path $root "nginx/nginx.conf") -Value $nginxConfig -Encoding utf8

Write-Host ".env and nginx/nginx.conf generated for $Mode mode."
