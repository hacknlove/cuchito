const { MongoClient } = require('mongodb');

let res;
const mongo = {};

const mongoHandler = {
  get(target, name) {
    if (target[name]) {
      return target[name];
    }
    if (!target.db) {
      return null;
    }
    if (target.db[name]) {
      return target.db[name];
    }
    return target.db.collection(name);
  },
};

let maxTries;

const mongoProxy = new Proxy(mongo, mongoHandler);

async function mongoConnect() {
  const client = await MongoClient.connect(process.env.CUCHITO_MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }).catch((err) => ({ err }));

  if (client.err) {
    if (maxTries--) {
      mongoConnect();
      return;
    }
    process.exit(1);
  }

  mongo.client = client;

  mongo.db = client.db();
  mongo.client = client;
  mongo.connect = () => undefined;
  res(mongo.db);
}

function reconnect() {
  maxTries = 10;
  mongo.waitFor = new Promise((resolve) => {
    res = resolve;
  });
  mongo.db = null;
  mongoConnect();
}

reconnect();
mongoProxy.connect = reconnect;

export default mongoProxy;
