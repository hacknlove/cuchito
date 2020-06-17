import fs from 'fs';
import yaml from 'js-yaml';
import { app } from './express';
import { conf } from './conf';

let firstRequest = 0;
let lastRequest = 0;

function fileName({ method, path }) {
  const now = Date.now();
  let stepSpan = now - lastRequest;

  if (stepSpan > conf.maxTimeSpan) {
    firstRequest += stepSpan - 1000;
    stepSpan = 1000;
  }

  lastRequest = Date.now();

  return `${process.cwd()}/saved/${now - firstRequest}-${method}-${path.substr(1).split(/\W/).map((l) => (l || '') && l[0].toUpperCase() + l.substr(1).toLowerCase()).join('')}-${new Date().toISOString().substring(0, 19)}`;
}

function noop(err) {
  if (err) {
    console.error(err);
  }
}

function recorder({
  conf, request,
}, res, next) {
  if (!conf.record) {
    return next();
  }
  if (conf.record.skipMethods && conf.record.skipMethods[request.method]) {
    return next();
  }

  if (!firstRequest) {
    firstRequest = Date.now();
    lastRequest = firstRequest;
  }

  fs.writeFile(fileName(request), yaml.safeDump(request), noop);
  next();
}

export default function connect() {
  app.use(recorder);
}
