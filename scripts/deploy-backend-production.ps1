param(
  [Parameter(Mandatory = $true)]
  [string] $ServerHost,

  [Parameter(Mandatory = $true)]
  [string] $ServerUser,

  [Parameter(Mandatory = $true)]
  [string] $RemoteAppPath,

  [string] $ProcessName = "security-alert-backend",
  [string] $PackagePath = "builds/backend-production-deploy.zip"
)

$ErrorActionPreference = "Stop"

$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$package = Resolve-Path (Join-Path $root $PackagePath)
$remoteArchive = "/tmp/backend-production-deploy.zip"
$target = $RemoteAppPath.TrimEnd("/")

Write-Host "Uploading backend package to $ServerUser@$ServerHost..." -ForegroundColor Cyan
scp $package "$ServerUser@$ServerHost`:$remoteArchive"

Write-Host "Extracting and restarting backend on server..." -ForegroundColor Cyan
ssh "$ServerUser@$ServerHost" @"
set -e
mkdir -p "$target"
unzip -o "$remoteArchive" -d "$target"
cd "$target/backend"
npm install --omit=dev
if command -v pm2 >/dev/null 2>&1; then
  pm2 restart "$ProcessName" || pm2 start src/server.js --name "$ProcessName"
  pm2 save || true
else
  echo "PM2 tidak ditemukan. Jalankan backend manual dengan: cd $target/backend && npm start"
fi
"@

Write-Host "Done. Test health endpoint:" -ForegroundColor Green
Write-Host "curl http://security-alerts.pertaarungas.com/api/health"
