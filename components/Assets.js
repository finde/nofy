const Express = require('express');
const expressFileUpload = require('express-fileupload');

module.exports = function Assets(nofy, { express, config }, cb) {
  express.use('/assets', Express.static(config.static));
  express.use(expressFileUpload()); // allow upload - parser
  return cb(true);
};
