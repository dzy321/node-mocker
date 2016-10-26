const Log = require('log');

module.exports = process.log || new Log('debug');