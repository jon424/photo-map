#!/bin/bash

# Azure Photo Map Deployment Script
# This script deploys the Photo Map application to Azure using Terraform

set -e

echo "🚀 Starting Azure Photo Map Deployment..."

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
    echo "❌ Azure CLI is not installed. Please install it first:"
    echo "   https://docs.microsoft.com/en-us/cli/azure/install-azure-cli"
    exit 1
fi

# Check if Terraform is installed
if ! command -v terraform &> /dev/null; then
    echo "❌ Terraform is not installed. Please install it first:"
    echo "   https://www.terraform.io/downloads.html"
    exit 1
fi

# Check if user is logged in to Azure
if ! az account show &> /dev/null; then
    echo "🔐 Please log in to Azure CLI:"
    az login
fi

# Get current subscription
SUBSCRIPTION_ID=$(az account show --query id -o tsv)
echo "📋 Using Azure subscription: $SUBSCRIPTION_ID"

# Navigate to terraform directory
cd terraform

# Initialize Terraform
echo "🔧 Initializing Terraform..."
terraform init

# Plan the deployment
echo "📋 Planning Terraform deployment..."
terraform plan -out=tfplan

# Apply the deployment
echo "🏗️ Deploying infrastructure to Azure..."
terraform apply tfplan

# Get outputs
echo "📤 Getting deployment outputs..."
APP_URL=$(terraform output -raw app_service_url)
RESOURCE_GROUP=$(terraform output -raw resource_group_name)

echo "✅ Infrastructure deployed successfully!"
echo "🌐 App Service URL: $APP_URL"
echo "📦 Resource Group: $RESOURCE_GROUP"

# Build the application
echo "🔨 Building the application..."
cd ..
npm install
npm run build

# Create deployment package
echo "📦 Creating deployment package..."
cd dist
zip -r ../deployment.zip .
cd ..

# Deploy to Azure App Service
echo "🚀 Deploying application to Azure App Service..."
az webapp deployment source config-zip \
  --resource-group $RESOURCE_GROUP \
  --name $(terraform -chdir=terraform output -raw app_service_name) \
  --src deployment.zip

echo "🎉 Deployment completed successfully!"
echo "🌐 Your Photo Map app is now available at: $APP_URL"
echo ""
echo "📝 Next steps:"
echo "1. Visit $APP_URL to test your application"
echo "2. Take photos on your mobile device"
echo "3. See them appear on the global map!"
echo ""
echo "🔧 To manage your resources:"
echo "   - Azure Portal: https://portal.azure.com"
echo "   - Resource Group: $RESOURCE_GROUP"
echo ""
echo "🗑️ To clean up resources when done:"
echo "   cd terraform && terraform destroy"
