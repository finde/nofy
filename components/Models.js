const Express = require('express');
const restify = require('express-restify-mongoose');
const mongoose = require('mongoose');
const path = require('path');
const { Types } = mongoose.Schema;
const swagger = require('mongoose2swagger');
const fs = require('fs');

const { getFilesInPath } = require('../helper');

mongoose.set('useFindAndModify', false);

function init({ nofy, router, swaggerDefinition, config }) {
  const models = {};

  // get list of models in the folder
  const modelPath = path.resolve(nofy.rootDir, 'models');

  // if 'models' is not there, skip it
  if (!fs.existsSync(modelPath)) {
    return 'SKIP';
  }

  // read path
  getFilesInPath(modelPath).map(({ fullpath }) => {
    // eslint-disable-next-line
    const Model = require(fullpath);
    if (Model.name) {
      const model = new Model();
      let extraOptions;
      if (model.isWithTimestamp) {
        extraOptions = { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
      }
      const mongooseSchema = new mongoose.Schema(model.schema, extraOptions);

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

    return 'OK';
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
          const statusCode = req.erm.statusCode; // 400 or 404

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

    if (!nofy.models) {
      nofy.models = {}
    }
    return true;
  });

  nofy.models = mongoose.models;
  return 'OK';
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
    swaggerDefinition = swagger.base({
      host: `localhost:${config.port}`,
      basePath: `${config.api.prefix}${config.api.version}`
    });
  }

  const results = init({
    nofy, router, swaggerDefinition, config
  });

  if (results === 'SKIP') {
    return cb('SKIP')
  } else {
    if (config.swagger) {
      swaggerDefinition.schemes = ['http'];
      nofy.swaggerDefinition = swaggerDefinition;
    }

    express.use(router);
    return cb(results);
  }
};
