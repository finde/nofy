const mongoose = require('mongoose');
const MongodbUriParser = require('mongodb-uri');

module.exports = function Database(nofy, { config }, cb) {
  if (config.db) {
    const databaseUri = MongodbUriParser.format(config.db);

    mongoose.connection.on('error', (err) => {
      console.log('Mongoose Connection Error', err)
      setTimeout(connectWithRetry, 5000);
    });

    mongoose.connection.on('connected', () => cb('OK'));
    mongoose.connection.on('reconnected', () => cb('OK'));

    function connectWithRetry() {
      return mongoose.connect(databaseUri, { useNewUrlParser: true }, (err) => {
        if (err) {
          setTimeout(connectWithRetry, 5000);
        }
      });
    }

    connectWithRetry();
  } else {
    cb('SKIP');
  }
};
