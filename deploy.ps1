# Single Photo Map Deployment Script
# Run this script whenever you make changes to deploy your app

Write-Host "Deploying Photo Map App..." -ForegroundColor Green

# Check if Azure CLI is installed
try {
    $null = Get-Command az -ErrorAction Stop
} catch {
    Write-Host "Azure CLI is not installed. Please install it first:" -ForegroundColor Red
    Write-Host "   https://docs.microsoft.com/en-us/cli/azure/install-azure-cli" -ForegroundColor Yellow
    exit 1
}

# Check if user is logged in to Azure
try {
    $null = az account show 2>$null
} catch {
    Write-Host "Please log in to Azure CLI:" -ForegroundColor Yellow
    az login
}

# Get current subscription
$SUBSCRIPTION_ID = az account show --query id -o tsv
Write-Host "Using Azure subscription: $SUBSCRIPTION_ID" -ForegroundColor Cyan

# Use existing storage account
$STORAGE_ACCOUNT = "stphotomap2t70yg7v"
$RESOURCE_GROUP = "rg-photo-map-2t70yg7v"

Write-Host "Using existing storage account: $STORAGE_ACCOUNT" -ForegroundColor Yellow

# Build the application
Write-Host "Building the application..." -ForegroundColor Yellow
npm install
npm run build

# Copy frontend files to dist folder
Write-Host "Copying frontend files to dist folder..." -ForegroundColor Yellow
Copy-Item public\* dist\ -Recurse -Force

# Upload files to storage account
Write-Host "Uploading files to Azure Storage..." -ForegroundColor Yellow

# Upload main files
az storage blob upload --account-name $STORAGE_ACCOUNT --container-name '$web' --name index.html --file dist/index.html --overwrite
az storage blob upload --account-name $STORAGE_ACCOUNT --container-name '$web' --name styles.css --file dist/styles.css --overwrite
az storage blob upload --account-name $STORAGE_ACCOUNT --container-name '$web' --name app.js --file dist/app.js --overwrite

# Get the static website URL
$WEBSITE_URL = az storage account show --name $STORAGE_ACCOUNT --resource-group $RESOURCE_GROUP --query "primaryEndpoints.web" -o tsv

Write-Host "Deployment completed successfully!" -ForegroundColor Green
Write-Host "Your Photo Map app is now available at: $WEBSITE_URL" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Visit $WEBSITE_URL to test your application"
Write-Host "2. Take photos on your mobile device"
Write-Host "3. See them appear on the global map!"
Write-Host ""
Write-Host "Cost Information:" -ForegroundColor Yellow
Write-Host "   - Storage Account: 5GB free tier"
Write-Host "   - Static website hosting: Free"
Write-Host "   - Total cost: $0/month (completely free!)"
Write-Host ""
Write-Host "To manage your resources:" -ForegroundColor Yellow
Write-Host "   - Azure Portal: https://portal.azure.com"
Write-Host "   - Resource Group: $RESOURCE_GROUP"
Write-Host "   - Storage Account: $STORAGE_ACCOUNT"
Write-Host ""
Write-Host "To deploy changes in the future:" -ForegroundColor Yellow
Write-Host "   Just run: .\deploy.ps1"