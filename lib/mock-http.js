const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const morgan = require('koa-morgan');
const router = require('koa-router')();
const stream = require('stream');

const logfun = (port) => (text) => {
  process.stdout.write(`[mock http at port ${port}]${text}\n`);
};

const start = (port, file, restart, callback) => {
  try {
    const log = logfun(port);
    const config = require(file)(log);
    const server = config.proxyServers.find(ps => ps.port === port);
    const app = new Koa();
    const logStream = new stream.Writable({
      decodeStrings: false,
      write(chunk, encoding, callback) {
        log(chunk.endsWith('\n') ? chunk.substring(0, chunk.length - 1) : chunk);
        callback();
      },
    });
    app.use(morgan('dev', { stream: logStream }));
    app.use(bodyParser());
    if (server.routes) {
      Object.keys(server.routes).forEach((route) => {
        const group = /^\[(get|delete|put|post)\](.*?)$/i.exec(route);
        if (group) {
          const method = group[1].toLowerCase();
          const path = group[2];
          const body = server.routes[route];
          router[method](path, typeof body === 'function' ? body : (ctx) => { ctx.body = body; });
        }
      });
    }
    app.use(router.routes());
    app.listen(port, () => {
      log(`http server ${restart ? 'restart' : 'start'}...`);
      callback(null);
    });
  } catch (e) {
    callback(e);
  }
};

module.exports = {
  start
};