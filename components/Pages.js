const path = require('path');

module.exports = function Pages(nofy, { express }, cb) {
  express.get('/welcome', (req, res) => {
    const welcomeHTML = path.join(__dirname, '../static/welcome.html');

    res.sendFile(welcomeHTML);
  });
  return cb('OK');
};
