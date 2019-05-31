const path = require('path');

module.exports = function ErrorHandling(nofy, { express }, cb) {
  express.use((req, res, next) => {
    if (req.url === '/') {
      res.redirect('/welcome');
      return true;
    }

    res.status(404);
    if (req.accepts('html')) {
      // res.render('404', { url: req.url});
      const page404 = path.join(__dirname, '../static/404.html');
      res.sendFile(page404);
      return false;
    }

    if (req.accepts('json')) {
      req.send({ error: 'Not Found' });
      return false;
    }

    res.type('txt').send('Not Found');
  });

  return cb('OK');
};
