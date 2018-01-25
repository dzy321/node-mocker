const httpService = require('./http-service')
const util = require('./util');

let services, httpServices, configFile, originServerConfig;

const init = (file, serverConfig, callback) => {
  try {
    if (!services) {
      const config = require(file);
      configFile = file;
      services = config.services;
      if (config.routes) {
        httpServices = [{
          routes: config.routes,
          port: 0
        }];
      } else {
        httpServices = config.httpServices;
        if (!Array.isArray(httpServices)) {
          const {routes, port} = httpServices;
          if (routes) {
            httpServices = [{
              routes,
              port: port || 0
            }];
          }
        }
      }
      originServerConfig = util.restoreFun(serverConfig);
    }
    callback(null, services);
  } catch (e) {
    callback(e);
  }
};

const startHttpProxys = (restart, ports, callback) => {
  try {
    if (httpServices && httpServices.length > 0) {
      httpServices.forEach((ps) => {
        const port = parseInt(ps.port);
        if (!isNaN(port) && port >= 0) {
          ps.port = ports[port] || port;
          const p = httpService.create(ps, originServerConfig, restart);
          if (p) ports[port] = p;
        }
      });
    }
    callback(null, ports);
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