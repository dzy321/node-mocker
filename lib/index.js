const chokidar = require('chokidar');
const workerFarm = require('worker-farm');
const log = require('./log');
const Promise = require('bluebird');

module.exports = class {
  constructor(file) {
    this.file = file;
    this.watch();
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
        ['init', 'serviceIsExist', 'runService', 'startHttpProxys']
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
      this.worker.startHttpProxys(restart, (err) => {
        err && log.err(err);
      });
    });
  }
  restart() {
    if (this._worker) {
      workerFarm.end(this._worker);
      this._worker = null;
      log.info('mock server restart...');
      this.startHttpProxy(true);
    }
  }
}