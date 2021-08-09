const glob = require('glob');
const { match, compile } = require('path-to-regexp');
const chokidar = require('chokidar');

const defecto = {
  remote: null,
  local: {
    ip: '0.0.0.0',
    port: 1989,
    host: null,
    maxTimeSpan: 1000,
    timeout: 5000,
    maxBodySize: '50mb',
  },
};

const configPath = `${process.cwd()}/${process.argv[2]}`;
const prefix = `${configPath.replace(/config.js$/, '')}/endpoints`;

const conf = {
  ...defecto,
  ...require(configPath),
  endpoints: [],
};

const regexp = new RegExp(`^${prefix}(/.*)\\.([A-Z]+|all)\\.js$`);

const paths = {};

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

function addFile(path, update) {
  const parse = path.match(regexp);
  if (!parse) {
    return;
  }
  const key = `${parse[1]}/${parse[2]}`;

  paths[key] = {
    match: match(parse[1].replace(/\[(\w*)\]/g, ':$1'), { decode: decodeURIComponent }),
    path: parse[1],
    compile: compile(parse[1].replace(/\[(\w*)\]/g, ':$1'), { encode: encodeURIComponent }),
    method: parse[2],
    conf: require(path),
  };

  if (update) {
    updateEndpoints();
  }
}

function removeFile(path, update) {
  const parse = path.match(regexp);
  if (!parse) {
    return;
  }
  const key = `${parse[1]}/${parse[2]}`;
  delete paths[key];
  delete require.cache[require.resolve(path)];
  if (update) {
    updateEndpoints();
  }
}

function changeFile(path) {
  removeFile(path);
  addFile(path, true);
}

glob.sync(`${prefix}/**/{conf,mutate,test}.js`).filter((file) => regexp.test(file)).forEach((path) => addFile(path, false));
updateEndpoints();

function live() {
  const endpointsWatched = chokidar.watch(`${prefix}/**/{conf,mutate,test}.js`, {
    ignoreInitial: true, awaitWriteFinish: true, usePolling: true, interval: 1000,
  });

  endpointsWatched.on('add', (path) => addFile(path, true));

  endpointsWatched.on('change', changeFile);

  endpointsWatched.on('unlink', (path) => removeFile(path, true));
}

live();

exports.conf = conf;
