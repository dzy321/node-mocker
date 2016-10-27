const Mock = require('../lib');
const log = require('../lib/log');
const path = require('path');


const mocker = new Mock(path.resolve(process.cwd(), './test/config-file.js'));

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
