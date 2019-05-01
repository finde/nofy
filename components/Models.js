const Express = require('express');
const restify = require('express-restify-mongoose');
const mongoose = require('mongoose');
const path = require('path');
const { Types } = mongoose.Schema;
const swagger = require('mongoose2swagger');

const { getFilesInPath } = require('../helper');

function init({ nofy, router, swaggerDefinition, config }) {
  const models = {};

  // get list of models in the folder
  const modelPath = path.resolve(nofy.rootDir, 'models');
  getFilesInPath(modelPath).map(({ file, fullpath }) => {
    // eslint-disable-next-line
    const Model = require(fullpath);
    if (Model.name) {
      const model = new Model();
      const mongooseSchema = new mongoose.Schema(model.schema);

      models[Model.name] = { model, mongooseSchema };
    }

    return true;
  });

  // hooking
  Object.keys(models).map((modelName) => {
    const modelObj = models[modelName];

    // logComponent({componentName: modelName, level: 2})
    if (typeof modelObj.model.hook === 'function') {
      modelObj.model.hook(models);
      // logComponent({componentName: modelName, level: 2, status:'SUCCESS'})
    } else {
      // logComponent({componentName: modelName, level: 2, status:'FAIL'})
    }

    return true;
  });

  // serving with restify
  Object.keys(models).map((modelName) => {
    // logComponent({componentName: modelName, level: 3})

    const modelObj = models[modelName];
    modelObj.mongooseModel = mongoose.model(modelName,
      modelObj.mongooseSchema);

    restify.serve(router, modelObj.mongooseModel,
      Object.assign(config.api || {}, {
        postRead: modelObj.model.postRead,
        onError: (err, req, res, next) => {
          const statusCode = req.erm.statusCode // 400 or 404

          res.status(statusCode).json({
            message: err.message
          })
        }
      })
    );

    if (swagger) {
      swagger.addSchema(swaggerDefinition, modelName, modelObj.mongooseSchema);
    }
    // logComponent({componentName: modelName, level: 3, status:'SUCCESS'})
    return true;
  });

  return models;
}

exports.BasicSchema = class BasicSchema {
  constructor(extension) {
    // overrideable
    Object.assign(this, extension);

    // non-overrideable
    this.isDeleted = { type: Boolean, default: false };

    return this;
  }
};

exports.Types = Types;
exports.default = function Models(nofy, { express, config }, cb) {
  const router = Express.Router();

  let swaggerDefinition = {};

  if (config.swagger) {
    swaggerDefinition = swagger.base({ host: 'localhost:3000', basePath: '/api/v1' });
  }

  const results = init({
    nofy, router, swaggerDefinition, config
  });

  if (config.swagger) {
    swaggerDefinition.schemes = ['http'];
    nofy.swaggerDefinition = swaggerDefinition;
  }

  express.use(router);
  return cb(results);
};
