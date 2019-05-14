const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const methodOverride = require('method-override');

module.exports = function Core(nofy, { express }, cb) {
  express.use(cors());
  express.use(bodyParser.urlencoded({ extended: true }));
  express.use(bodyParser.json());
  express.use(cookieParser());
  express.use(methodOverride());
  return cb(true);
};
