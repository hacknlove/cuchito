const timeoutSignal = require('timeout-signal');
const fetch = require('node-fetch');
const querystring = require('querystring');

const { conf } = require('./conf');

const withoutBody = {
  GET: true,
  OPTIONS: true,
  TRACE: true,
};

function addBody({ body, headers, method }) {
  if (withoutBody[method]) {
    return;
  }
  if (!body) {
    return;
  }
  if (!headers['content-type']) {
    return body + '';
  }

  if (headers['content-type'].startsWith('application/json')) {
    return JSON.stringify(body);
  }

  if (headers['content-type'].startsWith('application/x-www-form-urlencoded')) {
    return querystring.stringify(body);
  }

  return body + '';
}

async function callEndpoint({
  request: {
    method, headers, body, path, query,
  }, conf: { host, timeout = 0 },
}) {
  if (!host) {
    return {
      status: 400,
      headers: {
        'content-type': 'text/plain',
      },
      body: 'cuchito has not a host to proxy this request, nor a pre-mutator to generate one',
    };
  }

  const options = {
    method,
    headers,
    body: addBody({ body, headers, method }),
  };

  let url = `${host}${path}`;

  if (Object.keys(query)) {
    url += '?' + querystring.stringify(query);
  }

  const response = {
    headers: {},
  };

  if (timeout) {
    options.signal = timeoutSignal(timeout);
  }
  const r = await fetch(url, options).catch((error) => ({
    status: 599,
    headers: {
      entries: () => [],
    },
    text: () => Promise.resolve(error.toString()),
  }));
  response.status = r.status;
  for (const [key, value] of r.headers.entries()) {
    if (key === 'content-encoding') {
      continue;
    }
    response.headers[key.toLowerCase()] = value;
  }

  if (response.headers['content-type'] && response.headers['content-type'].startsWith('application/json')) {
    response.body = await r.json().catch(() => {});
  } else {
    response.body = await r.text().catch(() => '');
  }

  return response;
}

exports.proxy = async function proxy(req, res, next) {
  if (conf.remote && req.conf.proxy && !req.response) {
    req.response = await callEndpoint(req);
  }
  next();
};
exports.callEndpoint = callEndpoint;
