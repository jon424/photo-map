# Azure App Service Deployment for Photo Map
terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~>3.0"
    }
  }
}

provider "azurerm" {
  features {
    resource_group {
      prevent_deletion_if_contains_resources = false
    }
  }
}

# Create a resource group
resource "azurerm_resource_group" "main" {
  name     = "rg-photo-map-${random_string.suffix.result}"
  location = "West US 2"

  tags = {
    Environment = "Production"
    Project     = "PhotoMap"
  }
}

# Generate random suffix for unique naming
resource "random_string" "suffix" {
  length  = 8
  special = false
  upper   = false
}

# Use existing Storage Account
data "azurerm_storage_account" "main" {
  name                = "stphotomap2t70yg7v"
  resource_group_name = "rg-photo-map-2t70yg7v"
}

# Create container for photos in storage account
resource "azurerm_storage_container" "photos" {
  name                  = "photos"
  storage_account_id    = data.azurerm_storage_account.main.id
  container_access_type = "blob"
}

# Upload static website files
resource "azurerm_storage_blob" "index" {
  name                   = "index.html"
  storage_account_name   = data.azurerm_storage_account.main.name
  storage_container_name = "$web"
  type                  = "Block"
  source                = "../public/index.html"
  content_type          = "text/html"
}

resource "azurerm_storage_blob" "styles" {
  name                   = "styles.css"
  storage_account_name   = data.azurerm_storage_account.main.name
  storage_container_name = "$web"
  type                  = "Block"
  source                = "../public/styles.css"
  content_type          = "text/css"
}

resource "azurerm_storage_blob" "app" {
  name                   = "app.js"
  storage_account_name   = data.azurerm_storage_account.main.name
  storage_container_name = "$web"
  type                  = "Block"
  source                = "../public/app.js"
  content_type          = "application/javascript"
}

# Create App Service Plan
resource "azurerm_service_plan" "main" {
  name                = "asp-photo-map-${random_string.suffix.result}"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  os_type             = "Linux"
  sku_name            = "F1"

  tags = {
    Environment = "Production"
    Project     = "PhotoMap"
  }
}

# Create Linux Web App
resource "azurerm_linux_web_app" "main" {
  name                = "app-photo-map-${random_string.suffix.result}"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_service_plan.main.location
  service_plan_id     = azurerm_service_plan.main.id

  site_config {
    application_stack {
      node_version = "18-lts"
    }
  }

  app_settings = {
    "WEBSITE_NODE_DEFAULT_VERSION" = "18.17.0"
    "STORAGE_ACCOUNT_NAME"         = data.azurerm_storage_account.main.name
    "STORAGE_CONNECTION_STRING"     = data.azurerm_storage_account.main.primary_connection_string
    "USE_LOCAL_STORAGE"           = "true"
  }

  tags = {
    Environment = "Production"
    Project     = "PhotoMap"
  }
}

# Output important values
output "resource_group_name" {
  value = azurerm_resource_group.main.name
}

output "static_website_url" {
  value = data.azurerm_storage_account.main.primary_web_endpoint
}

output "storage_account_name" {
  value = data.azurerm_storage_account.main.name
}

output "app_service_url" {
  value = "https://${azurerm_linux_web_app.main.default_hostname}"
}

output "app_service_name" {
  value = azurerm_linux_web_app.main.name
}
