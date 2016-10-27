module.exports = (log) => ({
  services: {
    key: 4,
    date: new Date,
    bool: false,
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
  proxyServers: [
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
          c: 'cdd',
          d: 'de',
          e: 'ef'
        },
        '[GET]/api/site': (ctx) => {
          ctx.body = `siteId111:${ctx.query.id}`;
        }
      },
    },
  ]
});