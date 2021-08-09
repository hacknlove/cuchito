const mongoProxy = require('./mongoProxy');

module.exports = async function recorder({
  conf, request, response,
}, res, next) {
  if (!conf.record) {
    return next();
  }
  if (conf.record.skipMethods && conf.record.skipMethods[request.method]) {
    return next();
  }

  await mongoProxy.waitFor;

  await mongoProxy.rest.insert({
    request,
    response,
  });

  next();
};
