import glob from 'glob';
import { match, compile } from 'path-to-regexp';
import chokidar from 'chokidar';

const configPath = `${process.cwd()}/cuchito.js`;
const prefix = `${process.cwd()}/endpoints`;
const regexp = new RegExp(`^${prefix}(/.*)/([A-Z]+|all)/(conf|mutate|test)\\.js$`);
const paths = {};

const defecto = {
  host: null,
  ip: '0.0.0.0',
  port: 1989,
  maxTimeSpan: 1000,
};

export const conf = {
  ...defecto,
  ...require(configPath),
  endpoints: [],
};

function addFile(path, update) {
  const parse = path.match(regexp);
  if (!parse) {
    return;
  }
  const key = `${parse[1]}/${parse[2]}`;
  if (!paths[key]) {
    paths[key] = {
      match: match(parse[1].replace(/\[(\w*)\]/g, ':$1'), { decode: decodeURIComponent }),
      path: parse[1],
      compile: compile(parse[1].replace(/\[(\w*)\]/g, ':$1'), { encode: encodeURIComponent }),
      method: parse[2],
    };
    if (update) {
      updateEndpoints();
    }
  }
  paths[key][parse[3]] = require(path);
}

function updateEndpoints() {
  conf.endpoints = Object.values(paths).sort((a, b) => {
    if (a.path === b.path) {
      return b.path < a.path ? -1 : 1;
    }
    const lengthA = a.path.split('/').length;
    const lengthB = b.path.split('/').length;

    if (lengthA !== lengthB) {
      return lengthB - lengthA;
    }

    const lastA = a.path.replace(/\/\[/g, '/￿'); // unicode ffff last character
    const lastB = b.path.replace(/\/\[/g, '/￿');

    return lastA < lastB ? -1 : 1;
  });
}

function reconfig() {
  delete require.cache[configPath];
  const endpoints = conf.endpoints;
  for (const key of Object.keys(conf)) {
    delete conf[key];
  }
  Object.assign(conf, defecto, require(configPath));
  conf.endpoints = endpoints;
}

export default function connect(reconnect) {
  const confWatcher = chokidar.watch(configPath, { ignoreInitial: true, awaitWriteFinish: true });

  confWatcher.on('change', () => {
    const old = conf.ip + conf.port;
    reconfig();
    if (old !== conf.ip + conf.port) {
      reconnect();
    }
  });
}

function main() {
  glob.sync(`${prefix}/**/{conf,mutate,test}.js`).filter((file) => regexp.test(file)).forEach(addFile);
  updateEndpoints();
  const endpointsWatched = chokidar.watch(`${prefix}/**/{conf,mutate,test}.js`, {
    ignoreInitial: true, awaitWriteFinish: true, usePolling: true, interval: 1000,
  });

  endpointsWatched.on('add', (path) => addFile(path, true));

  endpointsWatched.on('change', (path) => {
    const parse = path.match(regexp);
    if (!parse) {
      return;
    }
    const key = `${parse[1]}/${parse[2]}`;
    delete require.cache[path];
    paths[key][parse[3]] = require(path);
  });

  endpointsWatched.on('unlink', (path) => {
    const parse = path.match(regexp);
    if (!parse) {
      return;
    }
    const key = `${parse[1]}/${parse[2]}`;
    paths[key][parse[3]] = null;

    if (!['conf', 'mutate', 'test'].some((file) => paths[key][file])) {
      delete paths[key];
      updateEndpoints();
    }
  });
}

main();
