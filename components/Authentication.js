const Auth0Strategy = require('passport-auth0');
const passport = require('passport');
const session = require('express-session');
const Express = require('express');
const router = Express.Router();
const querystring = require('querystring');
const util = require('util');

const jwt = require('express-jwt');
const jwksRsa = require('jwks-rsa');

// const defaultConfigAuth0 = {
//   domain: 'your-domain.auth0.com',
//   clientID: 'your-client-id',
//   clientSecret: 'your-client-secret',
//   callbackURL: '/api/v1/auth/callback'
// };

module.exports = function Authentication(nofy, { express, config }, cb) {
  if (!config.auth) {
    return cb('SKIP')
  }

  // check config strategy
  let strategies = {};
  const authConfigurationArray = (Array.isArray(config.auth) ? config.auth : [config.auth]);
  authConfigurationArray.map(({ service, configuration }) => {
    if (service === 'auth0') {
      const strategy = new Auth0Strategy(configuration,
        (accessToken, refreshToken, extraParams, profile, done) => {
          // accessToken is the token to call Auth0 API (not needed in the most cases)
          // extraParams.id_token has the JSON Web Token
          // profile has all the information from the user
          return done(null, profile);
        });
      passport.use(strategy);
      strategies[service] = configuration;

      // Authentication middleware. When used, the
      // Access Token must exist and be verified against
      // the Auth0 JSON Web Key Set
      strategies[service].checkJwt = jwt({
        // Dynamically provide a signing key
        // based on the kid in the header and
        // the signing keys provided by the JWKS endpoint.
        secret: jwksRsa.expressJwtSecret({
          cache: true,
          rateLimit: true,
          jwksRequestsPerMinute: 5,
          jwksUri: `https://${configuration.domain}/.well-known/jwks.json`
        }),

        // Validate the audience and the issuer.
        audience: configuration.audience,
        issuer: `https://${configuration.domain}/`,
        algorithms: ['RS256']
      });
    }
  });

  const prefix = `${config.api.prefix}${config.api.version}/auth`;
  nofy.secured = (req, res, next) => {
    // token is exists when login via client
    const token = req.headers["x-access-token"] || req.headers["authorization"];
    if (token) {
      return strategies['auth0'].checkJwt(req, res, next)
    } else {
      // req.user is exists when login through API
      if (req.user) {
        return next();
      }
      req.session.returnTo = req.originalUrl;
      res.redirect(`${prefix}/login`);
    }
  };

  passport.serializeUser(function (user, done) {
    done(null, user);
  });

  passport.deserializeUser(function (user, done) {
    done(null, user);
  });

  express.use(session({ secret: config.sessionSecret || '$lowDust70' }));
  express.use(passport.initialize());
  express.use(passport.session());

  // create router for 'login', 'callback', and 'logout'
  router.get(`/callback`, (req, res, next) => {
    passport.authenticate(Object.keys(strategies), (err, user, info) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.redirect(`${prefix}/login`);
      }
      req.logIn(user, function (err) {
        if (err) {
          return next(err);
        }
        const returnTo = req.session.returnTo;
        delete req.session.returnTo;
        res.redirect(returnTo || '/welcome');
      });
    })(req, res, next);
  });

  router.get(`/login`, passport.authenticate(Object.keys(strategies), {
      scope: 'openid email profile'
    }),
    (req, res) => {
      res.redirect('/');
    });

  router.get(`/logout`, (req, res) => {
    let logoutURL = '/';
    if (req.user && req.user.id.startsWith('auth0')) {
      let returnTo = strategies['auth0'].logoutURL;
      if (!returnTo) {
        returnTo = req.protocol + '://' + req.hostname;
        const port = req.connection.localPort;
        if (port !== undefined && port !== 80 && port !== 443) {
          returnTo += ':' + port;
        }
      }

      logoutURL = new URL(
        util.format('https://%s/logout', config.auth.configuration.domain)
      );
      logoutURL.search = querystring.stringify({
        client_id: config.auth.configuration.clientID,
        returnTo: returnTo
      });
    }

    req.logOut();
    res.redirect(logoutURL);
  });

  express.use(`${prefix}`, router);

  return cb('OK');
};
