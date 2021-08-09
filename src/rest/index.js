const { app, express, connect } = require('../shared/express');

const { conf } = require('./lib/conf');

async function main() {
  app.use(express.json());

  app.use(require('./lib/match'));
  app.use(require('./lib/reqSchema'));
  app.use(require('./lib/pre'));
  app.use(require('./lib/cached'));
  app.use(require('./lib/proxy'));

  app.use(require('./lib/recorder'));
  app.use(require('./lib/post'));
  app.use(require('./lib/resSchema'));
  app.use(require('./lib/send'));

  connect(conf);
}

main();
