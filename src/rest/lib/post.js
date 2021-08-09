const rfdc = require('rfdc')({ proto: true });

module.exports = async function mutatePost(req, res, next) {
  if (!req.conf.post || !req.response) {
    return next();
  }
  req.originalResponse = req.response;
  req.response = rfdc(req.response);
  await req.conf.post(req);

  next();
};
