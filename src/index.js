#!/usr/bin/env node
const dotenv = require('dotenv');
const { app, connect, reconnect } = require('./lib/express');
const match = require('./lib/match');
const mutatePre = require('./lib/mutatePre');
const { proxy } = require('./lib/proxy');
const multiply = require('./lib/multiply');
const mutatePost = require('./lib/mutatePost');
const send = require('./lib/send');
const recorder = require('./lib/recorder');
const log = require('./lib/log');
const { live } = require('./lib/conf');

dotenv.config();

async function main() {
  live(reconnect);

  app.use(match);
  app.use(recorder);
  app.use(mutatePre);
  app.use(proxy);
  app.use(multiply);
  app.use(mutatePost);
  app.use(log);
  app.use(send);

  connect();
}

main();
