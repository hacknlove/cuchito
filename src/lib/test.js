exports.beforeRequest = async function beforeRequest(req, res, next) {
  if (!req.conf.test || !req.conf.test.beforeRequest) {
    return next();
  }

  await req.conf.test.beforeRequest({ request: req.request }).catch((error) => {
    console.error(error);
    process.exit(1);
  });

  next();
};

exports.requestSchema = async function requestSchema(req, res, next) {
  if (!req.conf.test || !req.conf.test.requestSchema) {
    return next();
  }
  const validation = req.conf.test.requestSchema.validate({
    headers: req.request.headers,
    body: req.request.body,
    params: req.request.params,
    query: req.request.query,
  });
  if (validation.error) {
    if (req.conf.test.requestSchema.exitOnError) {
      console.error(validation.error);
      process.exit(1);
    }
    req.request.error = validation.error;
  }
};
exports.request = async function request(req, res, next) {
  if (!req.conf.test || !req.conf.test.request) {
    return next();
  }

  await req.conf.test.request({ request: req.request }).catch((error) => {
    console.error(error);
    process.exit(1);
  });
  next();
};
exports.afterRequest = async function afterRequest(req, res, next) {
  if (!req.conf.test || !req.conf.test.afterRequest) {
    return next();
  }

  await req.conf.test.afterRequest({ request: req.request }).catch((error) => {
    console.error(error);
    process.exit(1);
  });
  next();
};

exports.beforeResponse = async function beforeResponse(req, res, next) {
  if (!req.conf.test || !req.conf.test.beforeResponse) {
    return next();
  }

  await req.conf.test.beforeResponse({ request: req.originalRequest || req.request, response: req.response }).catch((error) => {
    console.error(error);
    process.exit(1);
  });
  next();
};
exports.responseSchema = function responseSchema(req, res, next) {
  console.log(req.conf.test);

  if (!req.conf.test || !req.conf.test.responseSchema) {
    return next();
  }
  console.log('here');

  const validation = req.conf.test.responseSchema.validate({
    headers: req.request.headers,
    body: req.request.body,
    params: req.request.params,
    query: req.request.query,
  });
  if (validation.error) {
    if (req.conf.test.responseSchema.exitOnError) {
      console.error(validation.error);
      process.exit(1);
    }
    req.response.error = validation.error;
  }};
exports.response = async function response(req, res, next) {
  if (!req.conf.test || !req.conf.test.response) {
    return next();
  }

  await req.conf.test.response({ request: req.originalRequest || req.request, response: req.response }).catch((error) => {
    console.error(error);
    process.exit(1);
  });
  next();
};
exports.afterResponse = async function afterResponse(req, res, next) {
  if (!req.conf.test || !req.conf.test.afterResponse) {
    return next();
  }

  await req.conf.test.afterResponse({ request: req.originalRequest || req.request, response: req.response }).catch((error) => {
    console.error(error);
    process.exit(1);
  });
  next();
};
