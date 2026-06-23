#!/bin/bash

# Konfigurasi Pengujian Skripsi
USERS=(1 10 20 50 100 200 500)
DURATION=60
RAMP_UP=5

# Buat direktori hasil jika belum ada
mkdir -p hasil_pengujian_skripsi/reports

echo "Memulai Rangkaian Pengujian Skripsi Sistem CPL..."
echo "Total skenario: ${#USERS[@]} level user x 2 tipe cache = 14 pengujian"
echo "Durasi tiap pengujian: $DURATION detik"
echo "------------------------------------------------------"

for u in "${USERS[@]}"; do
    echo "[$(date +'%H:%M:%S')] =========================================="
    echo "Menjalankan COLD CACHE - $u Users"
    echo "========================================================="
    
    COLD_JTL="hasil_pengujian_skripsi/test_cold_${u}user.jtl"
    COLD_REPORT="hasil_pengujian_skripsi/reports/report_cold_${u}user"
    
    rm -rf $COLD_JTL $COLD_REPORT
    
    jmeter -n -t Dashboard_Cold.jmx -Jusers=$u -Jramp_up=$RAMP_UP -Jduration=$DURATION -l $COLD_JTL -e -o $COLD_REPORT
    
    echo ""
    echo "[$(date +'%H:%M:%S')] =========================================="
    echo "Menjalankan WARM CACHE - $u Users"
    echo "========================================================="
    
    WARM_JTL="hasil_pengujian_skripsi/test_warm_${u}user.jtl"
    WARM_REPORT="hasil_pengujian_skripsi/reports/report_warm_${u}user"
    
    rm -rf $WARM_JTL $WARM_REPORT
    
    jmeter -n -t Dashboard_Warm.jmx -Jusers=$u -Jramp_up=$RAMP_UP -Jduration=$DURATION -l $WARM_JTL -e -o $WARM_REPORT
    echo ""
done

echo "[$(date +'%H:%M:%S')] Seluruh rangkaian pengujian selesai!"
echo "Silakan periksa folder 'hasil_pengujian_skripsi/reports' untuk melihat HTML Report dari masing-masing skenario."
