
import http from 'http';

const options = {
    hostname: 'localhost',
    port: 8082,
    path: '/api/auth/me',
    method: 'GET',
    headers: {
        'Cookie': 'token=malformed_token_value_for_debugging',
        'Content-Type': 'application/json'
    }
};

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
        console.log(`BODY: ${chunk}`);
    });
    res.on('end', () => {
        console.log('No more data in response.');
    });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

req.end();
