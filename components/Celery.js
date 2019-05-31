const NodeCelery = require('node-celery');

/**
 * @return {callback}
 */
module.exports = async function Celery(nofy, { express, config }, cb) {
  if (!config.celery) {
    return cb('SKIP');
  }

  const client = NodeCelery.createClient(config.celery);

  client.on('error', (err) => cb('FAILED', err));
  client.on('connect', () => cb('OK'));

  nofy.celery = client;
};