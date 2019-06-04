const Auth0Strategy = require('passport-auth0');
const passport = require('passport');
const session = require('express-session');
const Express = require('express');
const router = Express.Router();
const querystring = require('querystring');
const util = require('util');

const defaultConfigAuth0 = {
  domain: 'your-domain.auth0.com',
  clientID: 'your-client-id',
  clientSecret: 'your-client-secret',
  callbackURL: '/api/v1/auth/callback'
};


module.exports = function Authentication(nofy, { express, config }, cb) {
  if (!config.auth) {
    return cb('SKIP')
  }

  // check config strategy
  let strategies = [];

  (Array.isArray(config.auth) ? config.auth : [config.auth]).map(({ service, configuration }) => {
    if (service === 'auth0') {
      const strategy = new Auth0Strategy(configuration,
        (accessToken, refreshToken, extraParams, profile, done) => {
          // accessToken is the token to call Auth0 API (not needed in the most cases)
          // extraParams.id_token has the JSON Web Token
          // profile has all the information from the user
          return done(null, profile);
        });
      passport.use(strategy);
      strategies.push('auth0');
    }
  });

  const prefix = `${config.api.prefix}${config.api.version}/auth`;
  nofy.secured = (req, res, next) => {
    if (req.user) {
      return next();
    }
    req.session.returnTo = req.originalUrl;
    res.redirect(`${prefix}/login`);
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
    passport.authenticate('auth0', (err, user, info) => {
      if (err) {
        console.log('err', err);
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

  router.get(`/login`, passport.authenticate(strategies, {
      scope: 'openid email profile'
    }),
    (req, res) => {
      res.redirect('/');
    });

  router.get(`/logout`, (req, res) => {
    req.logOut();

    /// if login using auth0
    let returnTo = req.protocol + '://' + req.hostname;
    const port = req.connection.localPort;
    if (port !== undefined && port !== 80 && port !== 443) {
      returnTo += ':' + port;
    }
    const logoutURL = new URL(
      util.format('https://%s/logout', config.auth.configuration.domain)
    );
    const searchString = querystring.stringify({
      client_id: config.auth.configuration.clientID,
      returnTo: returnTo
    });
    logoutURL.search = searchString;

    res.redirect(logoutURL);
  });

  express.use(`${prefix}`, router);

  return cb('OK');
};
