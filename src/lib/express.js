import bodyParser from 'body-parser';
import http from 'http';
import express from 'express';
import { conf } from './conf';

export const app = express();

app.enable('trust proxy');
app.use(require('compression')());

app.use(bodyParser.json({ strict: false }));
app.use(bodyParser.raw());
app.use(bodyParser.text());

export function connect() {
  const {
    ip = '0.0.0.0',
    port = '8181',
    host,
  } = conf;

  express.server = http.createServer(app);
  express.server.listen(port, ip);
  console.log(`${ip}:${port} -> ${host}`);
}

export function reconnect() {
  express.server.close(() => {
    connect();
  });
}
