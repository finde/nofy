const fs = require('fs');

module.exports = function Permission(nofy, { express }, cb) {
  const permissionPath = `${nofy.rootDir}/permissions`;

  if (!fs.existsSync(permissionPath)) {
    return cb('SKIP')
  }

  const Permissions = require(permissionPath);
  express.use(Permissions());
  return cb('OK');
};
