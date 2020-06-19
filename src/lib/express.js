const bodyParser = require('body-parser');
const http = require('http');
const express = require('express');
const { conf } = require('./conf');

const app = express();

app.enable('trust proxy');
app.use(require('compression')());

app.use(bodyParser.json({ strict: false }));
app.use(bodyParser.raw());
app.use(bodyParser.text());

function connect() {
  const {
    ip = '0.0.0.0',
    port = '8181',
    host,
  } = conf;

  express.server = http.createServer(app);
  express.server.listen(port, ip);
  console.log(`${ip}:${port} -> ${host}`);
}

function reconnect() {
  express.server.close(() => {
    connect();
  });
}

exports.connect = connect;
exports.app = app;
exports.reconnect = reconnect;
