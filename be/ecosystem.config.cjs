module.exports = {
  apps: [
    {
      name: 'cpl-backend-cluster',
      script: 'dist/server/index.js',
      instances: 'max', // Uses all available CPU cores (24 Cores on Xeon Campus Server)
      exec_mode: 'cluster',
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: process.env.PORT || 5000,
        REDIS_HOST: process.env.REDIS_HOST || '127.0.0.1',
        REDIS_PORT: process.env.REDIS_PORT || '6379'
      }
    }
  ]
};
