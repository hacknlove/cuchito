const rfdc = require('rfdc')({ proto: true });

module.exports = async function mutatePre(req, res, next) {
  const { host, ...headers } = req.headers;
  delete headers['If-None-Match'];

  if (req.conf.mutatePre) {
    req.conf.originalRequest = req.request;
    req.request = rfdc(req.request);
    await req.conf.mutatePre(req);
  }

  next();
};
