/* eslint-disable no-nested-ternary */
/* eslint-disable no-await-in-loop */
const mongoProxy = require('./mongoProxy');

const defaultArrayQuery = [
  ({
    path, params, method, body, query,
  }) => ({
    path, params, method, body, query,
  }),
  ({
    path, params, method, body,
  }) => ({
    path, params, method, body,
  }),
  ({
    path, params, method,
  }) => ({
    path, params, method,
  }),
  ({
    path, method,
  }) => ({
    path, method,
  }),
];

module.exports = async function pre(req, res, next) {
  if (!req.conf.cached || req.response) {
    return next();
  }

  await mongoProxy.waitFor;

  const queryArray = typeof req.conf.cached === 'function'
    ? [req.conf.cached]
    : Array.isArray(req.conf.cached)
      ? req.conf.cached
      : defaultArrayQuery;

  for (const query of queryArray) {
    req.response = await mongoProxy.rest.findOne(query(req));
    if (req.response) {
      return next();
    }
  }

  next();
};
