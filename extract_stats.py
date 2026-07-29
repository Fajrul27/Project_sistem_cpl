import os, json

local_dir = "/mnt/data170/Project PKL Akademik 2025/Project_sistem_cpl/hasil_pengujian_skripsi(fix)/reports"
campus_dir = "/mnt/data170/Project PKL Akademik 2025/Project_sistem_cpl/pengetesan new"

scenarios_local = ["1", "10", "20", "50", "100", "200", "500"]
scenarios_campus = ["A_Baseline_1_user", "A_Load_10_user", "A_Load_20_user", "A_Load_50_user", "A_Load_100_user", "B_Stress_200_user", "B_Stress_500_user"]

print("### Data Server Lokal (Core 2 Duo)")
print("| Skenario | Endpoint | Avg Response Time | TPS (Throughput) | Error Rate |")
print("|---|---|---|---|---|")

for s in scenarios_local:
    p = os.path.join(local_dir, "report_warm_" + s + "user", "statistics.json")
    if os.path.exists(p):
        with open(p) as f:
            data = json.load(f)
            for key, val in data.items():
                print(f"| {s} User | {key} | {val.get('meanResTime',0):.1f} ms | {val.get('throughput',0):.2f} req/s | {val.get('errorPct',0):.2f}% |")

print("\n### Data Server Kampus (Xeon 24 Core)")
print("| Skenario | Endpoint | Avg Response Time | TPS (Throughput) | Error Rate |")
print("|---|---|---|---|---|")

for i, s in enumerate(scenarios_campus):
    u = scenarios_local[i]
    p = os.path.join(campus_dir, s, "report", "statistics.json")
    if os.path.exists(p):
        with open(p) as f:
            data = json.load(f)
            for key, val in data.items():
                print(f"| {u} User | {key} | {val.get('meanResTime',0):.1f} ms | {val.get('throughput',0):.2f} req/s | {val.get('errorPct',0):.2f}% |")
