const http = require('http');
const https = require('https');

const PROTOCOL = process.env.API_PROTOCOL || 'http';
const HOST = process.env.API_HOST || '192.168.11.181';
const PORT = process.env.API_PORT || (PROTOCOL === 'https' ? '443' : '8081');
const BASE_URL = `${PROTOCOL}://${HOST}${PORT ? `:${PORT}` : ''}`;

async function request(path, method = 'GET', data = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const transport = url.protocol === 'https:' ? https : http;

    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = transport.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk.toString());
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(body));
          } catch (e) {
            resolve(body);
          }
        } else {
          reject(new Error(`Request failed with status ${res.statusCode}: ${body}`));
        }
      });
    });

    req.on('error', (e) => reject(e));

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function login() {
  console.log(`[Helper] Authenticating...`);
  try {
    const response = await request('/api/auth/login', 'POST', {
      email: 'admin@sistem-cpl.ac.id',
      password: 'admin123'
    });
    console.log(`[Helper] Auth success!`);
    return response.token;
  } catch (error) {
    console.error(`[Helper] Login Error:`, error.message);
    process.exit(1);
  }
}

async function clearCache(token) {
  console.log(`[Helper] Invalidate cache...`);
  try {
    const response = await request('/api/dashboard/invalidate-cache', 'POST', null, token);
    console.log(`[Helper] Cache cleared successfully!`);
    console.log(`[Helper] Stats:`, response);
  } catch (error) {
    console.error(`[Helper] Clear Cache Error:`, error.message);
    process.exit(1);
  }
}

async function warmCache(token) {
  console.log(`[Helper] Warming up cache for all dashboard endpoints...`);
  try {
    await request('/api/dashboard/stats', 'GET', null, token);
    await request('/api/dashboard/dosen', 'GET', null, token);
    await request('/api/dashboard/students', 'GET', null, token);
    console.log(`[Helper] All dashboard endpoints cached successfully!`);
  } catch (error) {
    console.error(`[Helper] Warm Cache Error:`, error.message);
    process.exit(1);
  }
}

async function main() {
  const action = process.argv[2];
  
  if (!['clear', 'warm'].includes(action)) {
    console.error('Usage: node helper_cache.js [clear|warm]');
    process.exit(1);
  }

  const token = await login();

  if (action === 'clear') {
    await clearCache(token);
  } else if (action === 'warm') {
    await warmCache(token);
  }
}

main();
