# 🚀 Azure Deployment Guide

This guide will help you deploy your Photo Map application to Azure using Terraform and Azure services.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

1. **Azure CLI** - [Install Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli)
2. **Terraform** - [Install Terraform](https://www.terraform.io/downloads.html)
3. **Node.js** (v14 or higher) - [Install Node.js](https://nodejs.org/)
4. **Azure Free Subscription** - [Get Azure Free Account](https://azure.microsoft.com/en-us/free/)

## 🏗️ Infrastructure Overview

The deployment creates the following Azure resources:

- **Resource Group**: Container for all resources
- **Cosmos DB**: NoSQL database for photo metadata
- **Azure Storage Account**: Blob storage for photo files
- **App Service Plan**: Hosting plan for the web application
- **App Service**: Web application hosting

## 🚀 Quick Deployment

### Option 1: Automated Deployment (Recommended)

**For Windows (PowerShell):**
```powershell
.\deploy.ps1
```

**For Linux/macOS (Bash):**
```bash
chmod +x deploy.sh
./deploy.sh
```

### Option 2: Manual Deployment

1. **Login to Azure:**
   ```bash
   az login
   ```

2. **Initialize Terraform:**
   ```bash
   cd terraform
   terraform init
   ```

3. **Plan the deployment:**
   ```bash
   terraform plan
   ```

4. **Deploy the infrastructure:**
   ```bash
   terraform apply
   ```

5. **Build and deploy the application:**
   ```bash
   cd ..
   npm install
   npm run build
   
   # Create deployment package
   cd dist
   zip -r ../deployment.zip .
   cd ..
   
   # Deploy to Azure App Service
   az webapp deployment source config-zip \
     --resource-group <resource-group-name> \
     --name <app-service-name> \
     --src deployment.zip
   ```

## 🔧 Configuration

### Environment Variables

The application uses the following environment variables (automatically configured by Terraform):

- `COSMOS_ENDPOINT`: Cosmos DB endpoint
- `COSMOS_KEY`: Cosmos DB access key
- `COSMOS_DATABASE`: Database name (photodb)
- `COSMOS_CONTAINER`: Container name (photos)
- `STORAGE_CONNECTION`: Azure Storage connection string
- `STORAGE_CONTAINER`: Storage container name (photos)
- `NODE_ENV`: Environment (production)

### Custom Configuration

To customize the deployment, edit `terraform/variables.tf`:

```hcl
variable "location" {
  description = "The Azure region where resources will be created"
  type        = string
  default     = "East US"  # Change this to your preferred region
}
```

## 📊 Cost Estimation (Azure Free Tier)

With the Azure Free Tier, you get:

- **Cosmos DB**: 400 RU/s provisioned throughput (free tier eligible)
- **App Service**: F1 tier (free)
- **Storage Account**: 5GB free
- **Total estimated cost**: $0/month (within free tier limits)

## 🔍 Monitoring and Management

### Azure Portal

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to your Resource Group
3. Monitor your resources:
   - **App Service**: View logs and metrics
   - **Cosmos DB**: Monitor throughput and storage
   - **Storage Account**: View blob storage usage

### Application Logs

View application logs:
```bash
az webapp log tail --resource-group <resource-group> --name <app-name>
```

## 🗑️ Cleanup

To remove all resources and avoid charges:

```bash
cd terraform
terraform destroy
```

**⚠️ Warning**: This will permanently delete all data and resources.

## 🔧 Troubleshooting

### Common Issues

**1. Terraform authentication error:**
```bash
az login
az account set --subscription <subscription-id>
```

**2. App Service deployment fails:**
- Check that the application builds successfully: `npm run build`
- Verify the deployment package is created: `ls -la deployment.zip`
- Check App Service logs in Azure Portal

**3. Cosmos DB connection issues:**
- Verify the connection string in App Service settings
- Check that the Cosmos DB account is accessible
- Ensure the database and container exist

**4. Storage access issues:**
- Verify the storage account connection string
- Check that the container exists
- Ensure proper permissions are set

### Getting Help

1. **Check Azure Portal** for resource status and logs
2. **Review Terraform state**: `terraform show`
3. **Check application logs**: `az webapp log tail`
4. **Verify environment variables** in App Service configuration

## 📈 Scaling

### Production Considerations

For production deployment, consider:

1. **Upgrade App Service Plan**: Change from F1 to a paid tier
2. **Enable HTTPS**: Configure custom domain with SSL
3. **Add CDN**: Use Azure CDN for better performance
4. **Monitor costs**: Set up billing alerts
5. **Backup strategy**: Regular backups of Cosmos DB and Storage

### Scaling Commands

```bash
# Scale App Service
az appservice plan update --name <plan-name> --resource-group <rg-name> --sku S1

# Scale Cosmos DB
az cosmosdb sql container throughput update \
  --account-name <cosmos-account> \
  --resource-group <rg-name> \
  --database-name photodb \
  --name photos \
  --throughput 1000
```

## 🔒 Security

### Best Practices

1. **Use Managed Identity** for service-to-service authentication
2. **Enable HTTPS only** in App Service settings
3. **Configure CORS** properly for your domain
4. **Regular security updates** for dependencies
5. **Monitor access logs** for suspicious activity

### Security Configuration

```bash
# Enable HTTPS only
az webapp update --name <app-name> --resource-group <rg-name> --https-only true

# Configure CORS
az webapp cors add --name <app-name> --resource-group <rg-name> --allowed-origins https://yourdomain.com
```

## 📞 Support

If you encounter issues:

1. Check the [Azure Status Page](https://status.azure.com/)
2. Review [Azure Documentation](https://docs.microsoft.com/en-us/azure/)
3. Check [Terraform Azure Provider Documentation](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs)
4. Open an issue in the project repository

---

**🎉 Congratulations!** Your Photo Map application is now running on Azure with Cosmos DB and Azure Storage!
