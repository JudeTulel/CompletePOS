const express = require('express');
const next = require('next');
const https = require('https');
const fs = require('fs');
const os = require('os');

// Setup Next.js
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

// HTTPS options
const httpsOptions = {
  key: fs.readFileSync('./cert/key.pem'),
  cert: fs.readFileSync('./cert/cert.pem'),
};

app.prepare().then(() => {
  const server = express();

  // Let Next.js handle all requests (fixes pathToRegexpError)
  server.use((req, res) => handle(req, res));

  // Get local IP for LAN access
  const interfaces = os.networkInterfaces();
  const localIp = Object.values(interfaces)
    .flat()
    .find((iface) => iface.family === 'IPv4' && !iface.internal)?.address || 'localhost';

  const PORT = 3000;

  https.createServer(httpsOptions, server).listen(PORT, localIp, () => {
    console.log(`> HTTPS server ready at https://${localIp}:${PORT}`);
  });
});
