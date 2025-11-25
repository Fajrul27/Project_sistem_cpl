


const API_URL = 'http://localhost:3000/api';

async function main() {
    try {
        // 1. Login
        console.log('Logging in...');
        const loginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@sistem-cpl.ac.id', password: 'admin123' })
        });
        const loginData = await loginRes.json();

        if (!loginRes.ok) {
            console.error('Login failed:', loginData);
            return;
        }

        const token = loginData.token;
        console.log('Login successful. Token obtained.');

        // 2. Fetch CPL List
        console.log('\nFetching CPL List...');
        const cplListRes = await fetch(`${API_URL}/cpl`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const cplListData = await cplListRes.json();

        if (!cplListRes.ok) {
            console.error('Fetch CPL List failed:', cplListData);
            return;
        }

        console.log(`Found ${cplListData.data.length} CPLs.`);

        if (cplListData.data.length === 0) {
            console.log('No CPLs found to test detail.');
            return;
        }

        const firstCplId = cplListData.data[0].id;
        console.log(`Testing Detail for CPL ID: ${firstCplId}`);

        // 3. Fetch CPL Detail
        console.log('\nFetching CPL Detail...');
        const cplDetailRes = await fetch(`${API_URL}/cpl/${firstCplId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const cplDetailData = await cplDetailRes.json();

        console.log('CPL Detail Response:', JSON.stringify(cplDetailData, null, 2));

        // 4. Fetch Nilai CPL (Simulating frontend call)
        // Frontend calls: supabase.from("nilai_cpl").select(...).eq("cpl_id", id)
        // API Client translates to: GET /api/nilai-cpl (ignoring filter!)
        console.log(`\nFetching Nilai CPL for CPL ID: ${firstCplId} (Simulating frontend)...`);
        const nilaiCplRes = await fetch(`${API_URL}/nilai-cpl?cplId=${firstCplId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const nilaiCplData = await nilaiCplRes.json();

        console.log(`Nilai CPL Count: ${nilaiCplData.data ? nilaiCplData.data.length : 'undefined'}`);
        if (nilaiCplData.data && nilaiCplData.data.length > 0) {
            console.log('First Nilai CPL:', JSON.stringify(nilaiCplData.data[0], null, 2));
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

main();
