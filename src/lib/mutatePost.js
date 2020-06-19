const rfdc = require('rfdc')({ proto: true });

module.exports = async function mutate(req, res, next) {
  if (req.conf.mutatePost) {
    req.originalResponse = req.response;
    req.response = rfdc(req.response);
    await req.conf.mutatePost(req);
  }

  next();
};
