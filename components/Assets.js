const Express = require('express');
const expressFileUpload = require('express-fileupload');
const path = require('path');
const fs = require('fs');

module.exports = function Assets(nofy, { express, config }, cb) {
  config.static.map(({prefix, folderPath})=> {
    const staticPath = path.resolve(nofy.rootDir, folderPath);
    if (fs.existsSync(staticPath)) {
      express.use(prefix, Express.static(staticPath));
    }
  });

  const uploadSettings = Object.assign({
    useTempFiles: true,
    tempFileDir: '/tmp',
    createParentPath: true,
    preserveExtension: true
  }, config.uploadSettings || {});


  // create temp folder if not exists
  if (uploadSettings.useTempFiles && !uploadSettings.tempFileDir.startsWith('/')) {
    const dir = path.resolve(nofy.rootDir, uploadSettings.tempFileDir);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  express.use(expressFileUpload(uploadSettings)); // allow upload - parser
  return cb(true);
};
