const Ajv = require('ajv');

const ajv = new Ajv();

module.exports = async function pre(req, res, next) {
  if (!req.conf.resSchema) {
    return next();
  }

  const valid = ajv.validate(req.conf.resSchema, res.response);

  if (!valid) {
    console.error(ajv.errors);
  }

  next();
};
