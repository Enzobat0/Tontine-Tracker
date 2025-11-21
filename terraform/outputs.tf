output "vm_public_ip" {
  value = azurerm_public_ip.vm_ip.ip_address
}

output "acr_login_server" {
  value = azurerm_container_registry.acr.login_server
}

output "acr_admin_password" {
  value     = azurerm_container_registry.acr.admin_password
  sensitive = true
}