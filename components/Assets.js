const Express = require('express');
const expressFileUpload = require('express-fileupload');
const path = require('path');
const fs = require('fs');

module.exports = function Assets(nofy, { express, config }, cb) {
  const staticPath = path.resolve(nofy.rootDir, config.static);
  express.use('/assets', Express.static(staticPath));

  const uploadSettings = Object.assign({
    useTempFiles: true,
    tempFileDir: '/tmp',
    createParentPath: true,
    preserveExtension: true
  }, config.uploadSetting || {});


  // create temp folder if not exists
  if (uploadSettings.useTempFiles) {
    const dir = path.relative(nofy.rootDir, uploadSettings.tempFileDir);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  express.use(expressFileUpload(uploadSettings)); // allow upload - parser
  return cb(true);
};
