module.exports = {
  apps: [
    {
      name: 'cgpa-agent-tracker',
      script: 'node_modules/.bin/next',
      args: 'start -p 9200',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
