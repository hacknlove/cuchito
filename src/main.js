import dotenv from 'dotenv';
import { connect, reconnect } from './lib/express';
import match from './lib/match';
import mutatePre from './lib/mutatePre';
import proxy from './lib/proxy';
import multiply from './lib/multiply';
import mutatePost from './lib/mutatePost';
import send from './lib/send';
import recorder from './lib/recorder';
import log from './lib/log';
import config from './lib/conf';

dotenv.config();

async function main() {
  config(reconnect);
  match();
  recorder();
  mutatePre();
  proxy();
  multiply();
  mutatePost();
  log();
  send();
  connect();
}

main();
