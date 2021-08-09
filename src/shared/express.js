const http = require('http');
const express = require('express');

const app = express();

app.enable('trust proxy');
app.use(require('compression')());

function connect(conf) {
  const {
    local: {
      ip = '0.0.0.0',
      port = '8181',
    },
    remote,
  } = conf;

  express.server = http.createServer(app);
  express.server.listen(port, ip, e => {
    console.log(e)
  });
  console.log(`${ip}:${port} -> ${remote}`);
}

exports.connect = connect;
exports.app = app;
exports.express = express;

