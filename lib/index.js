const chokidar = require('chokidar');
const workerFarm = require('worker-farm');
const path = require('path');
const log = require('./log');
const Promise = require('bluebird');

module.exports = class {
  constructor(file) {
    this.file = path.resolve(process.cwd(), file);
    this.watch();
    this.httpProxy = {};
    this.startHttpProxy();
  }
  watch() {
    const watcher = chokidar.watch(this.file);
    watcher.on('change', () => this.restart());
  }
  get worker() {
    if (!this._worker) {
      this._worker = workerFarm(
        { maxConcurrentWorkers: 1 },
        require.resolve('./mock-service'),
        ['init', 'serviceIsExist', 'runService', 'getProxyPorts']
      );
    }
    return this._worker;
  }
  initWorker() {
    return new Promise((resolve, reject) => {
      this.worker.init(this.file, (err) => {
        if (err) {
          reject(`mock service init error:${err}`)
        } else {
          resolve();
        }
      });
    });
  }
  serviceIsExist(key) {
    return this.initWorker().then(() => {
      return new Promise((resolve, reject) => {
        this.worker.serviceIsExist(key, (err, result) => {
          err ? reject(err) : resolve(result);
        });
      });
    });
  }
  runService(key, ...params) {
    return this.initWorker().then(() => {
      return new Promise((resolve, reject) => {
        this.worker.runService(key, params, (err, result) => {
          err ? reject(err) : resolve(result);
        });
      });
    });
  }
  startHttpProxy(restart = false) {
    return this.initWorker().then(() => {
      this.worker.getProxyPorts((err, ports) => {
        if (!err && ports && ports.length > 0) {
          ports.forEach((port) => {
            port = parseInt(port);
            if (!isNaN(port) && port > 0) {
              const proxy = this.httpProxy[port] = workerFarm(
                { maxConcurrentWorkers: 1 },
                require.resolve('./mock-http'),
                ['start']
              );
              proxy.start(port, this.file, restart, (err) => {
                err && log.error(`http mock server(port:${port}) start error:${err}`);
              });
            }
          });
        }
      });
    });
  }
  restart() {
    if (this._worker) {
      workerFarm.end(this._worker);
      this._worker = null;
      Object.keys(this.httpProxy).forEach((key) => {
        workerFarm.end(this.httpProxy[key]);
      });
      this.httpProxy = {};
      log.info('mock server restart...');
      this.startHttpProxy(true);
    }
  }
}