import os, json

campus_dir = "/mnt/data170/Project PKL Akademik 2025/Project_sistem_cpl/hasil_pengujian_skripsi/reports"
scenarios = ["1", "10", "20", "50", "100", "200", "500"]

print("### Data Server Kampus (Xeon 24 Core) - Extracted from statistics.json")
print("| Skenario | Endpoint | Avg Response Time | TPS (Throughput) | Error Rate |")
print("|---|---|---|---|---|")

for s in scenarios:
    p = os.path.join(campus_dir, "report_warm_" + s + "user", "statistics.json")
    if os.path.exists(p):
        with open(p) as f:
            data = json.load(f)
            for key, val in data.items():
                print(f"| {s} User | {key} | {val.get('meanResTime',0):.1f} ms | {val.get('throughput',0):.2f} req/s | {val.get('errorPct',0):.2f}% |")
