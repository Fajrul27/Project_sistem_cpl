#!/bin/bash
# Script untuk menjalankan serangkaian pengujian JMeter dan membuat report HTML untuk masing-masing skenario
# Pastikan TestTemplate.jmx sudah ada di parent folder

base_folder="pengetesan new"
mkdir -p "$base_folder"

# Skenario: "Nama_Folder user_count ramp_up"
scenarios=(
  "A_Baseline_1_user 1 1"
  "A_Load_10_user 10 10"
  "A_Load_20_user 20 20"
  "A_Load_50_user 50 30"
  "A_Load_100_user 100 60"
  "B_Stress_200_user 200 60"
  "B_Stress_300_user 300 100"
  "B_Stress_500_user 500 150"
)

for scenario in "${scenarios[@]}"; do
  read -r name users ramp_up <<< "$scenario"
  
  folder="$base_folder/$name"
  mkdir -p "$folder"
  
  echo "Menjalankan JMeter untuk skenario: $name ($users users) ..."
  
  # Jalankan JMeter dalam mode non-GUI dengan parameter
  # Menghasilkan result.jtl dan folder /report berisi index.html
  jmeter -n -t "TestTemplate.jmx" \
    -Jusers=$users -Jramp_up=$ramp_up -Jduration=300 \
    -l "$folder/result.jtl" \
    -e -o "$folder/report" > "$folder/jmeter.log" 2>&1
    
  echo "Skenario $name selesai."
done

echo "Semua pengujian selesai!"
