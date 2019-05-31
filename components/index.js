const config = Object.assign(require('../default_config'), require('config'));
const { promiseWrapper, log } = require('../helper');

module.exports = class Components {
  constructor({ express, nofy, info, opt = { customSequences: [] } }) {
    this.express = express;
    this.nofy = nofy;
    this.info = info;

    this.sequences = Object.assign([
      'Core',
      'Authentication*',
      'Database',
      'Models',
      'Permission',
      'Assets',
      'Pages',
      'Controllers',
      'MessageQueue',
      'Celery',
      'SwaggerUI',
      // 'SSR',
      'ErrorHandling' // always the last one !
    ], opt.customSequences);

    this.fn = {
      Core: require('./Core'),
      Authentication: require('./Authentication'),
      Database: require('./Database'),
      Models: require('./Models').default,
      Permission: require('./Permission'),
      Assets: require('./Assets'),
      Pages: require('./Pages'),
      MessageQueue: require('./MessageQueue'),
      Celery: require('./Celery'),
      Controllers: require('./Controllers'),
      SwaggerUI: require('./SwaggerUI'),
      ErrorHandling: require('./ErrorHandling'),
      // SSR: require('./SSR'),
    };

    return this;
  }

  async init() {
    const params = {
      config,
      express: this.express
    };

    log('-======================================-');
    try {
      for (let i = 0; i < this.sequences.length; i += 1) {
        const componentName = this.sequences[i];
        if (componentName.endsWith('*')) {
          await promiseWrapper(this.nofy, this.fn[componentName.replace('*', '')], params, true)
        } else {
          await promiseWrapper(this.nofy, this.fn[componentName], params)
        }
      }
    } catch (err) {
      throw err;
    }
    log('-======================================-');

    this.express.listen(config.port, () => {
      log(`\n   ${this.info.name} is listening on port http://localhost:${config.port}`);
      this.nofy.emit('ready')
    });
  }
};