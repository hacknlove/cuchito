const fs = require('fs');
const yaml = require('js-yaml');
const { conf } = require('./conf');

function fileName({ method, path, error }, response = { error: true }) {
  return `${process.cwd()}/${conf.options.logs}/${Date.now()},${method},${path.substr(1).replace(/\//g, '⁄').replace(/&/g, '໕').replace(/"/g, '”')},${error || response.error ? 'error' : 'ok'}.yml`;
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

  fs.writeFile(
    fileName(originalRequest || request, originalResponse || response), yaml.safeDump(file),
    noop,
  );
  next();
};
