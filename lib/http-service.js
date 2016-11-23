const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const morgan = require('koa-morgan');
const router = require('koa-router')();
const stream = require('stream');

const create = (config, originServerConfig, restart) => {
  let realPort;
  const log = (text) => {
    console.log(`[mock http at port ${realPort}]`, text);
  };
  try {
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
    if (config.routes) {
      Object.keys(config.routes).forEach((route) => {
        const group = /^\[(get|delete|put|post)\](.*?)$/i.exec(route);
        if (group) {
          const method = group[1].toLowerCase();
          const path = group[2];
          const body = config.routes[route];
          router[method](path, typeof body === 'function' ? body : (ctx) => { ctx.body = body; });
        }
      });
    }
    app.use(router.routes());
    if (originServerConfig) {
      app.use(require("./http-proxy")(originServerConfig, log));
    }
    app.use((ctx) => {
      ctx.status = 404;
    });
    realPort = app.listen(config.port).address().port;
    log(`http server ${restart ? 'restart' : 'start'}...`);
    return realPort;
  } catch (e) {
    log(e);
  }
};

module.exports = {
  create
};