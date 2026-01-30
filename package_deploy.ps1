$ErrorActionPreference = "Stop"

Write-Host "Cleaning up previous builds and cache..."
if (Test-Path ".next") { Remove-Item ".next" -Recurse -Force }
if (Test-Path "deploy.zip") { Remove-Item "deploy.zip" -Force }

Write-Host "Building application for production..."
npm run build

Write-Host "Copying public folder..."
Copy-Item -Path "public" -Destination ".next/standalone/public" -Recurse -Force

Write-Host "Copying prisma folder..."
Copy-Item -Path "prisma" -Destination ".next/standalone/prisma" -Recurse -Force

Write-Host "Creating static directory..."
New-Item -ItemType Directory -Force -Path ".next/standalone/.next/static"

Write-Host "Copying static assets..."
Copy-Item -Path ".next/static" -Destination ".next/standalone/.next/static" -Recurse -Force

Write-Host "Zipping artifacts to deploy.zip..."
# Using 7-Zip if available for better compression, otherwise fallback to Compress-Archive
Compress-Archive -Path ".next/standalone/*" -DestinationPath "deploy.zip" -Force

Write-Host "✅ Deployment package ready: deploy.zip"
