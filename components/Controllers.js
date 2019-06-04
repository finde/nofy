const Express = require('express');
const { getFilesInPath } = require('../helper');
const path = require('path');
const fs = require('fs');
const supportedMethods = ['get', 'post', 'put', 'delete'];

function routeParser(conf) {
  return Object.entries(conf).map((confTuple) => {
    let method = 'all';

    supportedMethods.map(methodOptions => {
      if (confTuple[0].toLowerCase().startsWith(methodOptions)) {
        method = methodOptions
      }
    });

    return {
      method,
      path: method === 'all' ? confTuple[0] : confTuple[0].split(' ')[1],
      methodName: confTuple[1]
    }
  });
}

function routeBuilder(controller, secureMiddleware) {
  const router = Express.Router();

  const config = routeParser(controller.router);
  config.map(({ method, path, methodName }) => {
    const cb = controller[methodName];

    if (!!controller[methodName]) {
      (method === 'all' ? supportedMethods : [method]).map(m => {
        if (controller.isPrivate) {
          router[m](path, secureMiddleware, cb)
        } else {
          router[m](path, cb)
        }
      })
    }
  });

  return router;
}

module.exports = function Controllers(nofy, { express, config }, cb) {
  const controllerPath = path.resolve(nofy.rootDir, 'controllers');
  if (!fs.existsSync(controllerPath)) {
    return cb('SKIP')
  }
  getFilesInPath(controllerPath).map(({ file, fullpath }) => {
    if (!nofy.controllers) {
      nofy.controllers = {}
    }

    const Controller = require(fullpath);
    if (Controller.name) {
      const c = new Controller(nofy);
      nofy.controllers[Controller.name] = c;
      // express.use(`/${Controller.name}`, routeBuilder(c));
      const routes = routeBuilder(c, nofy.secured);
      const urlPattern = `${config.api.prefix}${config.api.version}/${Controller.name}`;
      express.use(urlPattern, routes);
    }
  });
  return cb('OK')
};
