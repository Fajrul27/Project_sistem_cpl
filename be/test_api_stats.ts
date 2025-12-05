// Native fetch is available in Node 18+

async function main() {
    const API_URL = 'http://localhost:8082/api';
    const EMAIL = 'admin@unugha.ac.id';
    const PASSWORD = 'password123';

    // 1. Login
    console.log('Logging in...');
    const loginRes = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: EMAIL, password: PASSWORD })
    });

    if (!loginRes.ok) {
        console.error('Login failed:', await loginRes.text());
        return;
    }

    const loginData = await loginRes.json();
    const cookie = loginRes.headers.get('set-cookie');
    console.log('Login successful. Cookie:', cookie ? 'Received' : 'Missing');

    // 2. Call Stats
    const TA = '2024/2025 Ganjil';
    console.log(`Fetching stats for TA: '${TA}'...`);

    const statsRes = await fetch(`${API_URL}/kuesioner/stats?tahunAjaran=${encodeURIComponent(TA)}`, {
        headers: {
            'Cookie': cookie || ''
        }
    });

    if (!statsRes.ok) {
        console.error('Stats fetch failed:', await statsRes.text());
        return;
    }

    const statsData = await statsRes.json();
    console.log('Stats Response:', JSON.stringify(statsData, null, 2));
}

main().catch(console.error);
