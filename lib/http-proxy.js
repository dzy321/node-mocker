const httpProxy = require('http-proxy');
const _ = require('lodash');

class Router {
  constructor(matches, to, qsStringify) {
    this.qsStringify = qsStringify;
    if (typeof matches === 'string') {
      matches = [matches];
    }
    this.matchPatterns = typeof matches === 'function' ? matches : matches.map(match => new RegExp(`^${match}$`));
    let target = to;
    if (!to.startsWith('http://') && !to.startsWith('https://')) {
      target = `http://${target}`;
    }
    this.target = target;
    // host header should have port
    this.host = /^https?:\/\/(.+?)$/.exec(target)[1];
  }
  isMatch(ctx) {
    const { matchPatterns } = this;
    return typeof matchPatterns === 'function' ? matchPatterns(ctx) : this.matchPatterns.some(pattern => pattern.test(ctx.path));
  }
}

module.exports = (config, log) => {
  let routers = config.router;
  if (routers == null) {
    routers = [{
      match: config.match,
      to: config.to,
    }];
  }

  routers = routers.map(router => new Router(router.match, router.to, router.qsStringify || config.qsStringify));
  const proxy = httpProxy.createProxyServer({});
  
  proxy.on('error', (err, req, res) => {
    log(`proxy error:${JSON.stringify(err)}`);
    res.end(`proxy error:${JSON.stringify(err)}`);
  });

  return (ctx, next) => {
    const matchRouter = _.find(routers, router => router.isMatch(ctx));
    if (!matchRouter) {
      return next();
    }
    log(`[Mocker] Try to proxy path [${ctx.path}] to [${matchRouter.target}]`);
    ctx.respond = false;
    proxy.web(ctx.req, ctx.res, {
      target: matchRouter.target,
      headers: {
        host: matchRouter.host,
      },
    });
  };
};