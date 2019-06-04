const Express = require('express');
const { getFilesInPath } = require('../helper');
const path = require('path');
const fs = require('fs');
const supportedMethods = ['get', 'post', 'put', 'delete'];

function routeParser(conf) {
  return Object.entries(conf).map((confTuple) => {
    let method = 'all';
    const routerPattern = confTuple[0];
    const routerConf = confTuple[1];
    let isSecure = false;
    let methodName;

    supportedMethods.map(methodOptions => {
      if (routerPattern.toLowerCase().startsWith(methodOptions)) {
        method = methodOptions
      }
    });

    // handle router config
    if (typeof routerConf === 'string' || routerConf instanceof String) {
      methodName = routerConf
    } else if (routerConf.fn) {
      methodName = routerConf.fn;
      isSecure = !!routerConf.isPrivate;
    }

    return {
      method,
      path: method === 'all' ? routerPattern : routerPattern.split(' ')[1],
      methodName,
      isSecure
    }
  });
}

function routeBuilder(controller, secureMiddleware) {
  const router = Express.Router();

  const config = routeParser(controller.router);
  config.map(({ method, path, methodName, isSecure }) => {
    const cb = controller[methodName];

    let isPrivate = false;
    if (typeof controller.isPrivate === 'undefined') {
      isPrivate = isSecure;
    } else {
      isPrivate = (typeof isSecure === 'undefined') ? controller.isPrivate : isSecure;
    }

    if (!!controller[methodName]) {
      (method === 'all' ? supportedMethods : [method]).map(m => {
        if (isPrivate) {
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
  getFilesInPath(controllerPath).map(({ fullpath }) => {
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
