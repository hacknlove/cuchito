module.exports = async function proxy(req, res, next) {
  res.status(req.response.status);

  for (const [key, value] of Object.entries(req.response.headers)) {
    res.set(key, value);
  }
  res.send(req.response.body);

  next();
};
