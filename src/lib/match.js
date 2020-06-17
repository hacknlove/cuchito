import { app } from './express';
import { conf } from './conf';

function match(req, res, next) {
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
      req.conf = { ...globalConf, ...e.conf };
      req.params = matched.params;
      return true;
    }
  })) {
    req.conf = { ...globalConf };
  }

  const { host, ...headers } = req.headers;
  delete headers['If-None-Match'];

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
}

export default function connect() {
  app.use(match);
}
