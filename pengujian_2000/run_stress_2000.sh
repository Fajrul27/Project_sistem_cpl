#!/bin/bash

# Configuration and defaults
API_HOST="${API_HOST:-obe.unugha.ac.id}"
API_PORT="${API_PORT:-443}"
API_PROTOCOL="${API_PROTOCOL:-https}"
USERS="${USERS:-2000}"
RAMP_UP="${RAMP_UP:-300}"
DURATION="${DURATION:-360}"

# Determine directory structure
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

JMX_FILE="$PROJECT_ROOT/config_pengujian_jmeter/Dashboard_Stress_2000.jmx"
OUT_DIR="$SCRIPT_DIR"
JTL_FILE="$OUT_DIR/test_warm_2000user.jtl"
REPORT_DIR="$OUT_DIR/reports/report_warm_2000user"

echo "========================================================="
echo "  Rujuk Pengujian Stress Test 2000 Users Sistem CPL"
echo "========================================================="
echo "Target Host     : ${API_PROTOCOL}://${API_HOST}:${API_PORT}"
echo "Jumlah Users    : ${USERS}"
echo "Ramp-Up Time    : ${RAMP_UP}s"
echo "Durasi Test     : ${DURATION}s"
echo "JMX Config      : ${JMX_FILE}"
echo "JTL Output      : ${JTL_FILE}"
echo "HTML Report     : ${REPORT_DIR}"
echo "---------------------------------------------------------"

# Check if JMX file exists
if [ ! -f "$JMX_FILE" ]; then
    echo "❌ Error: File $JMX_FILE tidak ditemukan!"
    exit 1
fi

# Ensure output reports folder exists
mkdir -p "$OUT_DIR/reports"

# Clean up previous test artifacts
echo "[Pre-Test] Membersihkan sisa pengujian sebelumnya..."
rm -rf "$JTL_FILE" "$REPORT_DIR"

# Warm-up cache if helper script exists
if [ -f "$PROJECT_ROOT/config_pengujian_jmeter/helper_cache.js" ]; then
    echo "[Pre-Test] Melakukan warm-up cache..."
    node "$PROJECT_ROOT/config_pengujian_jmeter/helper_cache.js" warm || true
fi

echo "[$(date +'%H:%M:%S')] Memulai Pengujian JMeter (2000 Users)..."
echo "Command: jmeter -n -t \"$JMX_FILE\" -JHOST=\"$API_HOST\" -JPORT=\"$API_PORT\" -JPROTOCOL=\"$API_PROTOCOL\" -Jusers=$USERS -Jramp_up=$RAMP_UP -Jduration=$DURATION -l \"$JTL_FILE\" -e -o \"$REPORT_DIR\""

jmeter -n -t "$JMX_FILE" \
    -JHOST="$API_HOST" \
    -JPORT="$API_PORT" \
    -JPROTOCOL="$API_PROTOCOL" \
    -Jusers=$USERS \
    -Jramp_up=$RAMP_UP \
    -Jduration=$DURATION \
    -l "$JTL_FILE" \
    -e -o "$REPORT_DIR"

echo "---------------------------------------------------------"
echo "[$(date +'%H:%M:%S')] Pengujian 2000 Users Selesai!"
echo "Laporan HTML tersimpan di: $REPORT_DIR"
