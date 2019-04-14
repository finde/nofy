// default > ENV (production / staging) > local
module.exports = {
  port: 3737,
  swagger: {
    port: 4747
  },
  static: 'public', // => assets
  db: {
    hosts: [
      { host: 'localhost', port: 27017 },
      // { host: 'localhost', port: 27012 },
      // { host: 'localhost', port: 27013 },
    ],
    database: 'project-nofy',
    // options: {
    //   replicaSet: 'project-lens-3du',
    // },
  },
  rsmq: {
    host: "localhost",
    port: 6379,
    ns: "rsmq",
    alwaysRestart: true
  }
};