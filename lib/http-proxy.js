const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const morgan = require('koa-morgan');
const router = require('koa-router')();
const stream = require('stream');

const logfun = (port) => (text) => {
  console.log(`[mock http at port ${port}]`, text);
};

const create = (port, file, restart) => {
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
    app.use(bodyParser({ formLimit: '1mb' }));
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
    app.use((ctx) => {
      ctx.set('Node-Mocker-UnMacthed', '1');
      ctx.status = 404;
    });
    app.listen(port, () => {
      log(`http server ${restart ? 'restart' : 'start'}...`);
    });
  } catch (e) {
    log(e);
  }
};

module.exports = {
  create
};