### Data Server Lokal (Core 2 Duo)
| Skenario | Endpoint | Avg Response Time | TPS (Throughput) | Error Rate |
|---|---|---|---|---|
| 1 User | 2. Stats (/api/dashboard/stats) | 13.0 ms | 0.14 req/s | 0.00% |
| 1 User | Total | 63.2 ms | 0.50 req/s | 0.00% |
| 1 User | 4. Students (/api/dashboard/students) | 11.1 ms | 0.15 req/s | 0.00% |
| 1 User | 1. Auth (/api/auth/login) | 203.8 ms | 0.14 req/s | 0.00% |
| 1 User | 3. Dosen (/api/dashboard/dosen) | 4.7 ms | 0.14 req/s | 0.00% |
| 10 User | 2. Stats (/api/dashboard/stats) | 35.4 ms | 1.23 req/s | 0.00% |
| 10 User | Total | 88.5 ms | 4.63 req/s | 0.00% |
| 10 User | 4. Students (/api/dashboard/students) | 37.2 ms | 1.20 req/s | 0.00% |
| 10 User | 1. Auth (/api/auth/login) | 243.2 ms | 1.22 req/s | 0.00% |
| 10 User | 3. Dosen (/api/dashboard/dosen) | 29.0 ms | 1.23 req/s | 0.00% |
| 20 User | 2. Stats (/api/dashboard/stats) | 69.0 ms | 2.37 req/s | 0.00% |
| 20 User | Total | 119.0 ms | 8.95 req/s | 0.00% |
| 20 User | 4. Students (/api/dashboard/students) | 52.0 ms | 2.39 req/s | 0.00% |
| 20 User | 1. Auth (/api/auth/login) | 297.1 ms | 2.37 req/s | 0.00% |
| 20 User | 3. Dosen (/api/dashboard/dosen) | 43.4 ms | 2.39 req/s | 0.00% |
| 50 User | 2. Stats (/api/dashboard/stats) | 613.2 ms | 4.16 req/s | 0.00% |
| 50 User | Total | 690.2 ms | 15.90 req/s | 0.00% |
| 50 User | 4. Students (/api/dashboard/students) | 539.9 ms | 4.00 req/s | 0.00% |
| 50 User | 1. Auth (/api/auth/login) | 1054.6 ms | 4.21 req/s | 0.00% |
| 50 User | 3. Dosen (/api/dashboard/dosen) | 521.4 ms | 4.12 req/s | 0.00% |
| 100 User | 2. Stats (/api/dashboard/stats) | 2484.1 ms | 4.41 req/s | 0.00% |
| 100 User | Total | 2595.3 ms | 16.82 req/s | 0.00% |
| 100 User | 4. Students (/api/dashboard/students) | 2514.7 ms | 4.15 req/s | 0.00% |
| 100 User | 1. Auth (/api/auth/login) | 2870.0 ms | 4.56 req/s | 0.00% |
| 100 User | 3. Dosen (/api/dashboard/dosen) | 2482.0 ms | 4.24 req/s | 0.00% |
| 200 User | 2. Stats (/api/dashboard/stats) | 5987.6 ms | 4.41 req/s | 0.00% |
| 200 User | Total | 6104.1 ms | 16.77 req/s | 0.00% |
| 200 User | 4. Students (/api/dashboard/students) | 6170.7 ms | 3.86 req/s | 0.00% |
| 200 User | 1. Auth (/api/auth/login) | 6233.7 ms | 4.64 req/s | 0.00% |
| 200 User | 3. Dosen (/api/dashboard/dosen) | 6019.6 ms | 4.17 req/s | 0.00% |
| 500 User | 2. Stats (/api/dashboard/stats) | 15548.8 ms | 4.40 req/s | 0.00% |
| 500 User | Total | 15693.3 ms | 16.75 req/s | 0.00% |
| 500 User | 4. Students (/api/dashboard/students) | 15894.4 ms | 3.69 req/s | 0.00% |
| 500 User | 1. Auth (/api/auth/login) | 15600.6 ms | 4.73 req/s | 0.00% |
| 500 User | 3. Dosen (/api/dashboard/dosen) | 15777.8 ms | 4.10 req/s | 0.00% |

### Data Server Kampus (Xeon 24 Core)
| Skenario | Endpoint | Avg Response Time | TPS (Throughput) | Error Rate |
|---|---|---|---|---|
| 1 User | 3. Profil (/api/auth/me) | 361.8 ms | 0.18 req/s | 0.00% |
| 1 User | Total | 940.4 ms | 0.52 req/s | 0.00% |
| 1 User | 2. Dashboard (/api/dashboard/stats) | 1962.1 ms | 0.17 req/s | 0.00% |
| 1 User | 1. Auth (/api/auth/login) | 486.2 ms | 0.18 req/s | 0.00% |
| 10 User | 3. Profil (/api/auth/me) | 3080.5 ms | 0.39 req/s | 0.00% |
| 10 User | Total | 7801.8 ms | 1.12 req/s | 0.29% |
| 10 User | 2. Dashboard (/api/dashboard/stats) | 14358.9 ms | 0.38 req/s | 0.86% |
| 10 User | 1. Auth (/api/auth/login) | 5734.5 ms | 0.39 req/s | 0.00% |
| 20 User | 3. Profil (/api/auth/me) | 2282.8 ms | 0.57 req/s | 20.47% |
| 20 User | Total | 9929.9 ms | 1.75 req/s | 30.57% |
| 20 User | 2. Dashboard (/api/dashboard/stats) | 20141.6 ms | 0.60 req/s | 53.51% |
| 20 User | 1. Auth (/api/auth/login) | 6820.3 ms | 0.62 req/s | 17.11% |
| 50 User | 3. Profil (/api/auth/me) | 4722.7 ms | 1.27 req/s | 47.41% |
| 50 User | Total | 11563.7 ms | 3.66 req/s | 54.03% |
| 50 User | 2. Dashboard (/api/dashboard/stats) | 17504.7 ms | 1.25 req/s | 83.25% |
| 50 User | 1. Auth (/api/auth/login) | 11889.5 ms | 1.30 req/s | 31.55% |
| 100 User | 3. Profil (/api/auth/me) | 6773.4 ms | 2.01 req/s | 30.58% |
| 100 User | Total | 14540.0 ms | 5.51 req/s | 46.85% |
| 100 User | 2. Dashboard (/api/dashboard/stats) | 22574.1 ms | 1.85 req/s | 88.35% |
| 100 User | 1. Auth (/api/auth/login) | 13862.8 ms | 1.98 req/s | 22.22% |
| 200 User | 3. Profil (/api/auth/me) | 8840.1 ms | 3.59 req/s | 55.76% |
| 200 User | Total | 16890.2 ms | 9.66 req/s | 57.80% |
| 200 User | 2. Dashboard (/api/dashboard/stats) | 22561.5 ms | 3.52 req/s | 95.83% |
| 200 User | 1. Auth (/api/auth/login) | 18543.1 ms | 3.59 req/s | 25.61% |
| 500 User | 3. Profil (/api/auth/me) | 13934.8 ms | 4.69 req/s | 44.26% |
| 500 User | Total | 25468.7 ms | 14.17 req/s | 55.51% |
| 500 User | 2. Dashboard (/api/dashboard/stats) | 32773.2 ms | 4.75 req/s | 98.77% |
| 500 User | 1. Auth (/api/auth/login) | 27891.6 ms | 5.37 req/s | 26.24% |
