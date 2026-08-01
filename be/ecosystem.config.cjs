module.exports = {
  apps: [
    {
      name: 'cpl-backend-cluster',
      script: 'dist/server/index.js',
      instances: 6, // Dikurangi dari 12 ke 6 agar sisa RAM cukup untuk DB & OS saat stress test 1000 user
      exec_mode: 'cluster',
      watch: false,
      max_memory_restart: '800M', // Ditingkatkan agar proses tidak terus-menerus restart saat spike
      node_args: '--max-old-space-size=700', // Dibatasi agar tiap Node tidak makan RAM berlebih
      env: {
        NODE_ENV: 'production',
        PORT: process.env.PORT || 5000,
        REDIS_HOST: process.env.REDIS_HOST || 'redis',
        REDIS_PORT: process.env.REDIS_PORT || '6379'
      }
    }
  ]
};
