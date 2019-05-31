// const path = require('path');

module.exports = {
  port: 3700,
  // swagger: {
  //   port: 4700
  // },
  // static: [
  //   {
  //     prefix: '/vue-assets',
  //     folderPath: '../../sharedPublic/public/dist/vue-assets'
  //   },
  //   {
  //     prefix: '/assets',
  //     folderPath: '../../sharedPublic/public'
  //   },
  //   {
  //     prefix: '/quiz-images',
  //     folderPath: '../../sharedPublic/images'
  //   }
  // ],
  // db: {
  //   hosts: [
  //     { host: 'db', port: 37011 },
  //   ],
  //   database: 'project-3du-lens',
  // },
  // celery: {
  //   CELERY_BROKER_URL: 'redis://redis:6379/1',
  //   CELERY_RESULT_BACKEND: 'redis://redis:6379/1',
  // },
  // uploadSettings: {
  //   useTempFiles: true,
  //   tempFileDir: '../../sharedPublic/tmp',
  //   createParentPath: true,
  //   preserveExtension: true,
  // },
  api: {
    prefix: '/api',
    version: '/v1'
  },
  useModernCompression: true
  // ssr: {
  //   bundleJson: path.resolve(__dirname, '..', '..', 'sharedPublic', 'dist', 'vue-ssr-server-bundle.json'),
  //   template: path.resolve(__dirname, '..', 'src', 'views', 'ssr.html'),
  // }
  // rsmq: {
  //   host: "redis",
  //   port: 6379,
  //   ns: "rsmq",
  //   alwaysRestart: true
  // }
};