const fs = require('fs');
const yaml = require('js-yaml');
const { conf } = require('./conf');

function fileName({ method, path }) {
  return `${process.cwd()}/${conf.options.logs}/${Date.now()}-${method}-${path.substr(1).split(/\W/).map((l) => (l || '') && l[0].toUpperCase() + l.substr(1).toLowerCase()).join('')}-${new Date().toISOString().substring(0, 19)}`;
}

function noop(err) {
  if (err) {
    console.error(err);
  }
}

module.exports = function log({
  conf, request, originalRequest, response, originalResponse, logs,
}, res, next) {
  if (!conf.log) {
    return next();
  }
  if (conf.log.skipMethods && conf.log.skipMethods[request.method]) {
    return next();
  }

  const file = {
    request,
    response,
  };

  if (originalRequest) {
    file.originalRequest = originalRequest;
  }
  if (originalResponse) {
    file.originalResponse = originalResponse;
  }
  if (logs.length) {
    file.logs = logs;
  }

  fs.writeFile(fileName(originalRequest || request), yaml.safeDump(file), noop);
  next();
};
