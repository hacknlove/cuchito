import { app } from './express';

const rfdc = require('rfdc')({ proto: true });

async function mutate(req, res, next) {
  if (req.conf.mutatePost) {
    req.originalResponse = req.response;
    req.response = rfdc(req.response);
    await req.conf.mutatePost(req);
  }

  next();
}

export default function connect() {
  app.use(mutate);
}
