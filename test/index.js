const Mock = require('../lib');
const log = require('../lib/log');

const mocker = new Mock('./test/config-file.js');

// setInterval(() => {
  console.log(new Date());
  mocker.runService('key').then((result) => {
    log.info('invoke result:', result);
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
