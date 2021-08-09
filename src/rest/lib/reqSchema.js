const Ajv = require('ajv');

const ajv = new Ajv();

module.exports = async function pre(req, res, next) {
  if (!req.conf.reqSchema) {
    return next();
  }

  const valid = ajv.validate(req.conf.reqSchema, req.request);

  if (!valid) {
    console.error(ajv.errors);
  }

  next();
};
