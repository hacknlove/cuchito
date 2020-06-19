const rfdc = require('rfdc')({ proto: true });
const { callEndpoint } = require('./proxy');

function time(request) {
  setTimeout(launch, request.conf.multiply.interval, request);
}

async function launch(request) {
  if (request.conf.mutate) {
    request.request = rfdc(request.originalRequest);

    await request.conf.mutate(request);
  }
  callEndpoint(request);

  if (request.i++ <= request.count) {
    time(request);
  }
}

module.exports = function multiply({ conf, request, originalRequest }, res, next) {
  if (!conf.multiply) {
    return next();
  }
  if (conf.multiply.skipMethods && conf.multiply.skipMethods[request.method]) {
    return next();
  }
  if (!conf.multiply.count) {
    return next();
  }
  time({
    request,
    originalRequest: originalRequest || request,
    i: 0,
    count: conf.multiply.count,
    conf,
  });

  next();
};
