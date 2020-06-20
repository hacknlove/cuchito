const rfdc = require('rfdc')({ proto: true });

module.exports = async function mutatePost(req, res, next) {
  if (!req.conf.mutate || !req.conf.mutate.mutatePost) {
    return next();
  }
  req.originalResponse = req.response;
  req.response = rfdc(req.response);
  await req.conf.mutate.mutatePost(req);

  next();
};
