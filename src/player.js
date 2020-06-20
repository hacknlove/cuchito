#!/usr/bin/env node
const dotenv = require('dotenv');
const fs = require('fs');
const glob = require('glob');
const yaml = require('js-yaml');
const match = require('./lib/match');
const mutatePre = require('./lib/mutatePre');
const { proxy } = require('./lib/proxy');
const multiply = require('./lib/multiply');
const mutatePost = require('./lib/mutatePost');
const log = require('./lib/log');
const { conf } = require('./lib/conf');
const {
  beforeResponse, responseSchema, response, afterResponse,
} = require('./lib/test');

dotenv.config();

const configPath = `${process.cwd()}/${conf.options.saved}/*`;
const files = glob.sync(configPath)
  .map((file) => file.substr(configPath.length - 1))
  .sort((a, b) => parseInt(a, 10) - parseInt(b, 10));

function execute(req) {
  match(req, undefined,
    () => beforeResponse(req, undefined,
      () => mutatePre(req, undefined,
        () => proxy(req, undefined,
          () => responseSchema(req, undefined,
            () => response(req, undefined,
              () => afterResponse(req, undefined,
                () => multiply(req, undefined,
                  () => mutatePost(req, undefined,
                    () => log(req, undefined, () => undefined))))))))));
}

function play(i, last) {
  const file = files[i];
  if (!file) {
    return;
  }
  const step = parseInt(file, 10);
  setTimeout(() => {
    play(i + 1, step);
  }, step - last);

  setTimeout(() => {
    fs.readFile(`${process.cwd()}/${conf.options.saved}/${file}`, (err, data) => {
      if (err) {
        return console.error(err);
      }
      execute(yaml.safeLoad(data));
    });
  }, step - last);
}

play(0, 0);
