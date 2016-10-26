const Promise = require('bluebird');

let services, proxyServers;

const log = (text) => {
  process.stdout.write(`[mock service]${text}\n`);
};

const init = (file, callback) => {
  try {
    if (!services) {
      const config = require(file)(log);
      services = config.services;
      proxyServers = config.proxyServers;
    }
    callback(null, services);
  } catch (e) {
    callback(e);
  }
};

const getProxyPorts = (callback) => {
  return callback(null, proxyServers ? proxyServers.map(ps => ps.port) : null);
};

const _serviceIsExist = (key) => {
  return services && Object.keys(services).indexOf(key) > -1;
};

const serviceIsExist = (key, callback) => {
  callback(null, _serviceIsExist(key));
};

const isPromiseLike = (obj) => {
  return obj.then && obj.catch;
};

const runService = (key, params, callback) => {
  if (_serviceIsExist(key)) {
    const service = services[key];
    try {
      if (typeof service === 'function') {
        const result = service(...params);
        if (isPromiseLike(result)) {
          result.then((r) => {
            callback(null, r);
          }, (err) => {
            callback(err);
          });
          return;
        }
        callback(null, result);
      } else {
        callback(null, service);
      }
    } catch (e) {
      callback(e);
    }
  }
};

module.exports = {
  init,
  serviceIsExist,
  runService,
  getProxyPorts
};