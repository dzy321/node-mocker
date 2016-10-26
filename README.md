# Node-Mocker

mock service and http api with nodejs.

## Features

- js config file,modify and effective
- mock service
- mock http api power by koa2

## Requirements

- Node v6.0+

## config

```javascript
module.exports = (log) => ({
  services: {  // mock service
    key: 4,
    say(word) {
      log('sayaaa');
      return `hello1 ${word}!`;
    },
    promiseTest(n, k) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(n + k);
        }, 10);
      });
    },
    say2(word) {
      throw Error('say2 Error!');
    },
  },
  proxyServers: [ // mock http
    {
      port: 8081,
      routes: {
        '[GET]/api/shops/:shopId': {
          a: 'a',
          b: 'b'
        },
        '[GET]/api/items/:itemId': (ctx) => { // or a function
          ctx.body = ctx.params.itemId;
        },
      },
    },
    {
      port: 8082,
      routes: {
        '[GET]/api/test': {
          c: 'c',
          d: 'd',
          e: 'e'
        },
        '[GET]/api/site': (ctx) => {
          ctx.body = `siteId111:${ctx.query.id}`;
        }
      },
    },
  ]
});
```

## Workflow

- `npm install`
- `npm run test`