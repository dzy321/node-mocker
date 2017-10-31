# Node-Mocker

[![](https://img.shields.io/npm/v/n-mocker.svg?style=flat)](https://www.npmjs.com/package/n-mocker)

mock service and http api with nodejs.

## Features

- js config file,modify and effective
- mock services
- mock http api power by koa2

## Requirements

- Node v6.0+

## config

```javascript
module.exports = (log) => ({ //log inner mock server
  services: {  // mock service
    key: 4, // return number
    say(word) {
      log('sayaaa');
      return `hello1 ${word}!`;
    },
    promiseTest(n, k) { // return Promise
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
  proxyServers: [ // mock http,each will start a http server
    {
      port: 8081,
      routes: {
        '[GET]/api/shops/:shopId': { // return a object
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

## Use

```console
npm i n-mocker
```

```javascript
 const mocker = new Mock(path.resolve(process.cwd(), 'config-file.js'));  
 await mocker.start();
```

## Workflow

- `npm install`
- `npm run test`
