const mongoose = require('mongoose');
const MongodbUriParser = require('mongodb-uri');

module.exports = function Database(nofy, { config }, cb) {
  const databaseUri = MongodbUriParser.format(config.db);

  mongoose.connection.on('error', (err) => {
    console.log('Mongoose Connection Error', err)
  });
  mongoose.connection.on('connected', () =>  cb(true));
  mongoose.connection.on('reconnected', () => cb(true));

  function connectWithRetry() {
    return mongoose.connect(databaseUri, { useNewUrlParser: true }, (err) => {
      if (err) {
        setTimeout(connectWithRetry, 5000);
      }
    });
  }

  connectWithRetry();
};
