# Terraform-based Photo Map Deployment Script
# This script uses Terraform to create infrastructure AND deploy the static site

Write-Host "Deploying Photo Map App with Terraform..." -ForegroundColor Green

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

# Load environment variables from .env file if it exists
if (Test-Path ".env") {
    Get-Content ".env" | ForEach-Object {
        if ($_ -match "^([^#][^=]+)=(.*)$") {
            [Environment]::SetEnvironmentVariable($matches[1], $matches[2], "Process")
        }
    }
}

# Get current subscription
$SUBSCRIPTION_ID = az account show --query id -o tsv
Write-Host "Using Azure subscription: $SUBSCRIPTION_ID" -ForegroundColor Cyan

# Navigate to terraform directory
Set-Location terraform

# Initialize Terraform
Write-Host "Initializing Terraform..." -ForegroundColor Yellow
terraform init

# Plan the deployment
Write-Host "Planning Terraform deployment..." -ForegroundColor Yellow
terraform plan

# Apply the deployment
Write-Host "Applying Terraform deployment..." -ForegroundColor Yellow
terraform apply -auto-approve

# Get the outputs
$STATIC_URL = terraform output -raw static_website_url
$STORAGE_ACCOUNT = terraform output -raw storage_account_name
$RESOURCE_GROUP = if ($env:RESOURCE_GROUP_NAME) { $env:RESOURCE_GROUP_NAME } else { "rg-photo-map-2t70yg7v" }

Write-Host "Terraform deployment completed!" -ForegroundColor Green
Write-Host "Static website URL: $STATIC_URL" -ForegroundColor Cyan

# Build the application
Set-Location ..
Write-Host "Building the application..." -ForegroundColor Yellow
npm install
npm run build

Write-Host "Deployment completed successfully!" -ForegroundColor Green
Write-Host "Your Photo Map app is now available at: $STATIC_URL" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Visit $STATIC_URL to test your application"
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
Write-Host "   Just run: .\deploy-terraform.ps1"
Write-Host ""
Write-Host "To destroy all resources:" -ForegroundColor Red
Write-Host "   cd terraform && terraform destroy"
