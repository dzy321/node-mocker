const Promise = require('bluebird');
const httpProxy = require('./http-proxy')

let services, proxyServers, configFile;

const log = (text) => {
  console.log(`[mock service]`, text);
};

const init = (file, callback) => {
  try {
    if (!services) {
      const config = require(file)(log);
      configFile = file;
      services = config.services;
      proxyServers = config.proxyServers;
    }
    callback(null, services);
  } catch (e) {
    callback(e);
  }
};

const startHttpProxys = (restart, callback) => {
  try {
    if (proxyServers && proxyServers.length > 0) {
      proxyServers.forEach((ps) => {
        const port = parseInt(ps.port);
        if (!isNaN(port) && port > 0) {
          httpProxy.create(port, configFile, restart);
        }
      });
    }
    callback(null);
  } catch (e) {
    callback(e);
  }
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
  startHttpProxys
};