module.exports = {
  services: {
    key: 4,
    date: new Date,
    bool: false,
    say(word) {
      console.log('sayaaa1');
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
  routes: {
      '[GET]/api/shops/:shopId': {
        a: 'a',
        b: 'b'
      },
      '[GET]/api/items/:itemId': (ctx) => { // or a function
        ctx.body = ctx.params.itemId;
      },
    },
};