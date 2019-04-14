module.exports = function Permission(nofy, { express }, cb) {
  const Permissions = require(`${nofy.rootDir}/permissions`);

  express.use(Permissions());
  return cb(true);
};
