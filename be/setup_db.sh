#!/bin/bash

# Script untuk setup database dan user untuk project sistem_cpl

echo "Membuat database dan user..."
sudo mysql -e "CREATE DATABASE IF NOT EXISTS sistem_cpl;"
sudo mysql -e "CREATE USER IF NOT EXISTS 'admin'@'localhost' IDENTIFIED BY 'admin';"
sudo mysql -e "GRANT ALL PRIVILEGES ON sistem_cpl.* TO 'admin'@'localhost';"
sudo mysql -e "FLUSH PRIVILEGES;"

echo "Selesai! Database 'sistem_cpl' siap dan user 'admin' telah dibuat."
echo "Silakan coba jalankan ulang backend."
