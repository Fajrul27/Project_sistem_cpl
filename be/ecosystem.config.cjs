module.exports = {
  apps: [
    {
      name: 'cpl-backend-cluster',
      script: 'dist/server/index.js',
      instances: 12, // Optimal for 12 physical cores on Xeon E5-2650 v4 (prevents RAM thrashing)
      exec_mode: 'cluster',
      watch: false,
      max_memory_restart: '450M',
      node_args: '--max-old-space-size=400',
      env: {
        NODE_ENV: 'production',
        PORT: process.env.PORT || 5000,
        REDIS_HOST: process.env.REDIS_HOST || 'redis',
        REDIS_PORT: process.env.REDIS_PORT || '6379'
      }
    }
  ]
};
