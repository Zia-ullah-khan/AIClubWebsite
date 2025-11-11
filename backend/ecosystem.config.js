module.exports = {
  apps: [
    {
      name: 'AIClubWebsiteBackend',
      script: './server.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      env_file: '.env'
    }
  ]
};
