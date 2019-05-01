const { createBundleRenderer } = require('vue-server-renderer');
const fs = require('fs');

module.exports = function SSR(nofy, { express, config }, cb) {
  if (!config.ssr) {
    return cb(false)
  }

  const bundleRenderer = createBundleRenderer(
    // Load the SSR bundle with require.
    require(config.ssr.bundleJson),
    {
      // Yes, I know, readFileSync is bad practice. It's just shorter to read here.
      template: fs.readFileSync(config.ssr.template, 'utf-8')
    }
  );

  express.get('*', (req, res) => {
    bundleRenderer
    // Renders directly to the response stream.
    // The argument is passed as "context" to main.server.js in the SSR bundle.
      .renderToStream({ url: req.path })
      .pipe(res);
  });

  cb(true)
};
