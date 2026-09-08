const express = require('express');
const next = require('next');
const path = require('path');

const dev = process.env.NODE_ENV === 'development';
const hostname = '0.0.0.0';
const port = parseInt(process.env.PORT, 10) || 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

const boxingRoutes = require('./server/routes/boxing');

app.prepare().then(() => {
  const server = express();
  server.use(express.json());

  server.use('/api', boxingRoutes);

  server.all('*', (req, res) => {
    return handle(req, res);
  });

  server.listen(port, hostname, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
