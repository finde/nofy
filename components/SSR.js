const { createBundleRenderer } = require('vue-server-renderer');
const fs = require('fs');

module.exports = function SSR(nofy, { express, config }, cb) {
  if (!config.ssr) {
    return cb(false)
  }

  const bundleRenderer = createBundleRenderer(
    require(config.ssr.bundleJson),
    {
      template: fs.readFileSync(config.ssr.template, 'utf-8')
    }
  );

  express.get('*', (req, res) => {
    bundleRenderer
      .renderToStream({ url: req.path })
      .pipe(res);
  });

  cb(true)
};
