output "bastion_public_ip" {
  value = azurerm_public_ip.bastion_ip.ip_address
}

output "app_private_ip" {
  value = azurerm_linux_virtual_machine.app_vm.private_ip_address
}

output "acr_login_server" {
  value = azurerm_container_registry.acr.login_server
}

output "acr_admin_username" {
  value = azurerm_container_registry.acr.admin_username
}

output "acr_admin_password" {
  value     = azurerm_container_registry.acr.admin_password
  sensitive = true
}

output "cosmos_connection_string" {
  value     = azurerm_cosmosdb_account.db_account.connection_strings[0]
  sensitive = true
}