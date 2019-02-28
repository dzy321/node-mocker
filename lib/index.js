const chokidar = require('chokidar');
const workerFarm = require('worker-farm');
const log = require('./log');
const Promise = require('bluebird');
const util = require('./util');
const fs = require('fs');
const fclone = require('fclone');

module.exports = class {
  constructor(file, serverConfig) {
    this.file = file;
    this.fileContent = this.getContent();
    this.serverConfig = util.convertFun(serverConfig);
    this.watch();
    this.ports = {};
    process.on('exit', () => {
      this._worker && workerFarm.end(this._worker);
    });
  }
  getContent() {
    return fs.readFileSync(this.file, 'utf-8');
  }
  watch() {
    const watcher = chokidar.watch(this.file);
    watcher.on('change', () => {
      const fileContent = this.getContent();
      if (this.fileContent !== fileContent) {
        this.restart();
        this.fileContent = fileContent;
      }
    });
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
      this.worker.init(this.file, this.serverConfig, (err) => {
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
        this.worker.runService(key, fclone(params), (err, result) => {
          err ? reject(err) : resolve(result);
        });
      });
    });
  }
  startHttpProxy(restart = false) {
    return this.initWorker().then(() => {
      return new Promise((resolve, reject) => {
        this.worker.startHttpProxys(restart, this.ports, (err, ports) => {
          if (err) {
            reject(err);
          } else {
            this.ports = ports;
            resolve();
          }
        });
      });
    });
  }
  get dynamicPort() {
    return this.ports[0];
  }
  start() {
    log.info('mock server start...');
    return this.startHttpProxy();
  }
  restart() {
    if (this._worker) {
      workerFarm.end(this._worker);
      this._worker = null;
      log.info('mock server restart...');
      return this.startHttpProxy(true);
    }
  }
}