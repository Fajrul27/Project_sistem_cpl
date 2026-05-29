import json
import glob

print(f"{'Test Name':<30} | {'Resp Time (ms)':<15} | {'Throughput':<15} | {'Error Rate'}")
print("-" * 80)

paths = glob.glob("hasil_pengujian_skripsi/reports/*/statistics.json")
def sort_key(p):
    name = p.split("/")[-2]
    parts = name.split("_")
    cache = parts[1]
    users = int(parts[2].replace("user", ""))
    return (cache, users)

paths = sorted(paths, key=sort_key)

for path in paths:
    folder_name = path.split("/")[-2]
    with open(path, "r") as f:
        data = json.load(f)
        total = data.get("Total", {})
        resp = total.get("meanResTime", 0)
        tps = total.get("throughput", 0)
        err = total.get("errorPct", 0)
        print(f"{folder_name:<30} | {resp:<15.2f} | {tps:<15.2f} | {err:.2f}%")
