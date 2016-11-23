const util = require('../lib/util');

const result = util.convertFun({
  proxy: {
    enable: true,
    router: [
      {
        match: '/api/.+',
        to: 'http://some.domain:8080'
      }, {
        match: '/api2/.+',
        to: 'http://some.domain:9000'
      }, {
        match: (ctx) => {
          if (ctx.method === 'POST') {
            return true;
          }
          return false;
        },
        to: 'http://some.domain:9921'
      }
    ]
  }
});

console.log('result:', JSON.stringify(result));

const result1 = util.restoreFun(result);

console.log('result1', JSON.stringify(result1), typeof result1.proxy.router[2].match);