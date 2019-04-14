const jwt = require('express-jwt');
const jwks = require('jwks-rsa');

module.exports = class Authentication {
  constructor({express, config}) {
    return function Authentication (nofy, cb) {
      const jwtCheck = jwt({
        secret: jwks.expressJwtSecret(config.jwt.secret),
        audience: config.jwt.audience,
        issuer: config.jwt.issuer,
        algorithms: ['RS256'],
      });
      express.use('/api', jwtCheck);
      return cb(true);
    }
  }
};
