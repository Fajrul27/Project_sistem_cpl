#!/usr/bin/env python3
import csv
import os
import statistics
from collections import defaultdict

JTL_DIR = "/mnt/data170/Project PKL Akademik 2025/Project_sistem_cpl/hasil_pengujian_skripsi"

SCENARIOS = [
    ("cold", 1), ("cold", 10), ("cold", 20), ("cold", 50),
    ("cold", 100), ("cold", 200), ("cold", 500),
    ("warm", 1), ("warm", 10), ("warm", 20), ("warm", 50),
    ("warm", 100), ("warm", 200), ("warm", 500),
]

ENDPOINT_MAP = {
    "1. Auth (/api/auth/login)": "Auth",
    "2. Stats (/api/dashboard/stats)": "Stats",
    "3. Dosen (/api/dashboard/dosen)": "Dosen",
    "4. Students (/api/dashboard/students)": "Students",
}

def parse_jtl(filepath):
    """Parse a JTL file and return rows."""
    rows = []
    try:
        with open(filepath, newline='', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                rows.append(row)
    except Exception as e:
        print(f"Error reading {filepath}: {e}")
    return rows

def compute_stats(rows, endpoint_filter=None):
    """Compute stats for given rows, optionally filtered by label."""
    if endpoint_filter:
        rows = [r for r in rows if r.get('label','') == endpoint_filter]
    
    if not rows:
        return None
    
    elapsed = [int(r['elapsed']) for r in rows]
    success = [r['success'].strip().lower() == 'true' for r in rows]
    timestamps = [int(r['timeStamp']) for r in rows]
    
    total = len(elapsed)
    failed = sum(1 for s in success if not s)
    error_rate = (failed / total * 100) if total > 0 else 0
    
    avg_rt = statistics.mean(elapsed)
    min_rt = min(elapsed)
    max_rt = max(elapsed)
    
    # Throughput = total requests / total duration in seconds
    if len(timestamps) > 1:
        duration_sec = (max(timestamps) - min(timestamps)) / 1000.0
        # Add avg elapsed for last request
        duration_sec += statistics.mean(elapsed) / 1000.0
        throughput = total / duration_sec if duration_sec > 0 else 0
    else:
        throughput = 0
    
    # Percentiles
    sorted_elapsed = sorted(elapsed)
    p90_idx = int(0.90 * total) - 1
    p95_idx = int(0.95 * total) - 1
    p99_idx = int(0.99 * total) - 1
    p90 = sorted_elapsed[max(0, p90_idx)]
    p95 = sorted_elapsed[max(0, p95_idx)]
    p99 = sorted_elapsed[max(0, p99_idx)]
    
    return {
        "total": total,
        "failed": failed,
        "error_rate": round(error_rate, 2),
        "avg_rt": round(avg_rt, 1),
        "min_rt": min_rt,
        "max_rt": max_rt,
        "p90": p90,
        "p95": p95,
        "p99": p99,
        "throughput": round(throughput, 3),
    }

print("=" * 80)
print("ANALISIS HASIL PENGUJIAN JMeter - SISTEM CPL BERBASIS OBE")
print("=" * 80)

all_results = {}

for (cache_type, users) in SCENARIOS:
    fname = f"test_{cache_type}_{users}user.jtl"
    fpath = os.path.join(JTL_DIR, fname)
    
    if not os.path.exists(fpath):
        print(f"[WARNING] File tidak ditemukan: {fname}")
        continue
    
    rows = parse_jtl(fpath)
    
    key = (cache_type, users)
    all_results[key] = {}
    
    print(f"\n{'='*70}")
    print(f"SKENARIO: {cache_type.upper()} CACHE - {users} PENGGUNA SIMULTAN")
    print(f"{'='*70}")
    print(f"{'Endpoint':<12} {'Total':>6} {'Gagal':>6} {'Err%':>6} {'Avg(ms)':>9} {'Min(ms)':>9} {'Max(ms)':>9} {'P90(ms)':>9} {'P95(ms)':>9} {'TPS':>8}")
    print("-" * 95)
    
    for label_key, short_name in ENDPOINT_MAP.items():
        stats = compute_stats(rows, endpoint_filter=label_key)
        if stats:
            all_results[key][short_name] = stats
            print(f"{short_name:<12} {stats['total']:>6} {stats['failed']:>6} {stats['error_rate']:>6.2f} "
                  f"{stats['avg_rt']:>9.1f} {stats['min_rt']:>9} {stats['max_rt']:>9} "
                  f"{stats['p90']:>9} {stats['p95']:>9} {stats['throughput']:>8.3f}")

# Summary table: response time per endpoint across scenarios (Dashboard endpoints only)
print("\n\n" + "=" * 80)
print("RINGKASAN PERBANDINGAN RESPONSE TIME AVG (ms) PER ENDPOINT")
print("=" * 80)

dashboard_endpoints = ["Stats", "Dosen", "Students"]

# COLD CACHE TABLE
print("\n--- COLD CACHE ---")
print(f"{'Users':>6} | {'Stats Avg':>10} | {'Stats Err%':>10} | {'Dosen Avg':>10} | {'Dosen Err%':>10} | {'Students Avg':>12} | {'Stu Err%':>10}")
print("-" * 85)
for users in [1, 10, 20, 50, 100, 200, 500]:
    key = ("cold", users)
    if key in all_results:
        r = all_results[key]
        s_avg = r.get("Stats", {}).get("avg_rt", "-")
        s_err = r.get("Stats", {}).get("error_rate", "-")
        d_avg = r.get("Dosen", {}).get("avg_rt", "-")
        d_err = r.get("Dosen", {}).get("error_rate", "-")
        st_avg = r.get("Students", {}).get("avg_rt", "-")
        st_err = r.get("Students", {}).get("error_rate", "-")
        print(f"{users:>6} | {str(s_avg):>10} | {str(s_err):>10} | {str(d_avg):>10} | {str(d_err):>10} | {str(st_avg):>12} | {str(st_err):>10}")

# WARM CACHE TABLE
print("\n--- WARM CACHE ---")
print(f"{'Users':>6} | {'Stats Avg':>10} | {'Stats Err%':>10} | {'Dosen Avg':>10} | {'Dosen Err%':>10} | {'Students Avg':>12} | {'Stu Err%':>10}")
print("-" * 85)
for users in [1, 10, 20, 50, 100, 200, 500]:
    key = ("warm", users)
    if key in all_results:
        r = all_results[key]
        s_avg = r.get("Stats", {}).get("avg_rt", "-")
        s_err = r.get("Stats", {}).get("error_rate", "-")
        d_avg = r.get("Dosen", {}).get("avg_rt", "-")
        d_err = r.get("Dosen", {}).get("error_rate", "-")
        st_avg = r.get("Students", {}).get("avg_rt", "-")
        st_err = r.get("Students", {}).get("error_rate", "-")
        print(f"{users:>6} | {str(s_avg):>10} | {str(s_err):>10} | {str(d_avg):>10} | {str(d_err):>10} | {str(st_avg):>12} | {str(st_err):>10}")

# Throughput summary
print("\n\n" + "=" * 80)
print("RINGKASAN THROUGHPUT (req/s) PER ENDPOINT")
print("=" * 80)
print("\n--- COLD CACHE ---")
print(f"{'Users':>6} | {'Stats TPS':>10} | {'Dosen TPS':>10} | {'Students TPS':>12}")
print("-" * 45)
for users in [1, 10, 20, 50, 100, 200, 500]:
    key = ("cold", users)
    if key in all_results:
        r = all_results[key]
        s_t = r.get("Stats", {}).get("throughput", "-")
        d_t = r.get("Dosen", {}).get("throughput", "-")
        st_t = r.get("Students", {}).get("throughput", "-")
        print(f"{users:>6} | {str(s_t):>10} | {str(d_t):>10} | {str(st_t):>12}")

print("\n--- WARM CACHE ---")
print(f"{'Users':>6} | {'Stats TPS':>10} | {'Dosen TPS':>10} | {'Students TPS':>12}")
print("-" * 45)
for users in [1, 10, 20, 50, 100, 200, 500]:
    key = ("warm", users)
    if key in all_results:
        r = all_results[key]
        s_t = r.get("Stats", {}).get("throughput", "-")
        d_t = r.get("Dosen", {}).get("throughput", "-")
        st_t = r.get("Students", {}).get("throughput", "-")
        print(f"{users:>6} | {str(s_t):>10} | {str(d_t):>10} | {str(st_t):>12}")

print("\n\nSelesai analisis.")
