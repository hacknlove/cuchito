const { app, express, connect } = require('../shared/express');

const { conf } = require('./lib/conf');

async function main() {
  app.use(express.json());

  app.use(require('./lib/graphql'));

  connect(conf);
}

main();
