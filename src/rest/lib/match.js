const { conf } = require('./conf');

module.exports = function match(req, res, next) {
  if (!conf.endpoints.some((e) => {
    if (!e.match) {
      return false;
    }
    if (e.method !== req.method && e.method !== 'all') {
      return false;
    }

    const matched = e.match(req.path);

    if (matched) {
      req.conf = { ...e.conf };
      req.params = matched.params;
      return true;
    }
  })) {
    req.conf = {};
  }

  const { host, ...headers } = req.headers;
  delete headers['if-none-match'];

  req.request = {
    path: req.path,
    params: req.params,
    headers,
    method: req.method,
    body: req.body,
    query: req.query,
  };

  req.logs = [];

  next();
};
