const Express = require('express');
const expressFileUpload = require('express-fileupload');
const path = require('path');

module.exports = function Assets(nofy, { express, config }, cb) {
  const staticPath = path.resolve(nofy.rootDir, config.static);
  express.use('/assets', Express.static(staticPath));
  express.use(expressFileUpload()); // allow upload - parser
  return cb(true);
};
