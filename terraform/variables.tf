variable "resource_group_name" {
  default = "tontine-resources"
}

variable "location" {
  default = "North Europe"
}

variable "admin_username" {
  description = "User name for the VM"
  default     = "azureuser"
}

variable "admin_password" {
  description = "Password for the VM"
  sensitive   = true
}