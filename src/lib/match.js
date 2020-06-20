const { conf } = require('./conf');

module.exports = function match(req, res, next) {
  const {
    endpoints,
    ip,
    port,
    ...globalConf
  } = conf;

  if (!conf.endpoints.some((e) => {
    if (!e.match) {
      return false;
    }
    if (e.method !== req.method && e.method !== 'all') {
      return false;
    }

    const matched = e.match(req.path);
    if (matched) {
      req.conf = { ...globalConf, ...e.conf, mutate: e.mutate, test: e.test };
      req.params = matched.params;
      return true;
    }
  })) {
    req.conf = { ...globalConf };
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
