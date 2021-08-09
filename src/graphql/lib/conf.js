const configPath = `${process.cwd()}/${process.argv[2]}`;

const conf = require(configPath);

exports.conf = conf;
