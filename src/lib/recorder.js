const fs = require('fs');
const yaml = require('js-yaml');
const { conf } = require('./conf');

let firstRequest = 0;
let lastRequest = 0;

function fileName({ method, path, error }) {
  const now = Date.now();
  let stepSpan = now - lastRequest;

  if (stepSpan > conf.maxTimeSpan) {
    firstRequest += stepSpan - 1000;
    stepSpan = 1000;
  }

  lastRequest = Date.now();

  return `${process.cwd()}/${conf.options.saved}/${now - firstRequest},${method},${path.substr(1).replace(/\//g, '⁄').replace(/&/g, '໕').replace(/"/g, '”')},${error ? 'error' : 'ok'}.yml`;
}

function noop(err) {
  if (err) {
    console.error(err);
  }
}

module.exports = function recorder({
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
};
