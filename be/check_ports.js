
import http from 'http';

function checkPort(port) {
    const options = {
        hostname: 'localhost',
        port: port,
        path: '/health',
        method: 'GET'
    };

    const req = http.request(options, res => {
        console.log(`Port ${port}: Status ${res.statusCode}`);
        res.on('data', d => process.stdout.write(d));
    });

    req.on('error', error => {
        console.log(`Port ${port}: Error ${error.code}`);
    });

    req.end();
}

console.log("Checking ports 3000 and 8082...");
checkPort(3000);
checkPort(8082);
