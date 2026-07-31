module.exports = {
  apps: [
    {
      name: 'cpl-backend-cluster',
      script: 'be/dist/server/index.js',
      instances: 'max',
      exec_mode: 'cluster',
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 5000,
        REDIS_HOST: process.env.REDIS_HOST || 'redis',
        REDIS_PORT: process.env.REDIS_PORT || '6379'
      }
    }
  ]
};
