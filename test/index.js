const Mock = require('../lib');
const log = require('../lib/log');
const path = require('path');

const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const router = require('koa-router')();


const mocker = new Mock(path.resolve(process.cwd(), './test/config-file.js'),{
    router: [
      {
        match: '/api/.+',
        to: 'http://localhost:8083'
      },
      {
        match: (ctx) => {
          console.log(ctx);
          return ctx.path.indexOf('/api1/') === 0;
        },
        to: 'http://localhost:8083'
      }
    ]
  });


const app = new Koa();
app.use(bodyParser({ formLimit: '1mb' }));
router.get('/api/mocker/:id', (ctx) => {
  ctx.body = {
    id: ctx.params.id,
    uu: ctx.query.uu
  };
});
router.get('/api1/xxx', (ctx) => {
  ctx.body  = ctx.path;
});

app.use(router.routes());

app.listen(8083, () => {
  console.log('server listen in 8083');
});

mocker.start().then(() => {
  console.log('dynamic port:' + mocker.dynamicPort)
  // setInterval(() => {
  console.log(new Date());
  mocker.runService('key').then((result) => {
    log.info('invoke result:', result);
  }, (err) => {
    log.error(err);
  });

  mocker.runService('date').then((result) => {
    log.info('invoke date:', result, typeof result);
  }, (err) => {
    log.error(err);
  });

  mocker.runService('bool').then((result) => {
    log.info('invoke bool:', result === false);
  }, (err) => {
    log.error(err);
  });

  mocker.runService('say', 'next').then((result) => {
    log.info('invoke function:', result);
  }, (err) => {
    log.error(err);
  });

  mocker.runService('promiseTest', 3, 9).then((result) => {
    log.info('invoke promise:', result);
  }, (err) => {
    log.error(err);
  });
  // }, 1000);
});

