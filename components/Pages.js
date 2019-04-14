module.exports = function Pages(nofy, { express }, cb) {
  express.get('/', (req, res) => {
    res.send('it works!')
  });
  return cb(true);
};
