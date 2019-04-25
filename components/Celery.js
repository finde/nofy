const NodeCelery = require('node-celery');

/**
 * @return {callback}
 */
module.exports = async function Celery(nofy, { express, config }, cb) {
  if (!config.celery) {
    return cb(false);
  }

  const client = NodeCelery.createClient(config.celery);

  client.on('error', () => cb(false));
  client.on('connect', () => cb(true));

  nofy.celery = client;
};