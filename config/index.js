var config;

switch(process.env.NODE_ENV) {
  case 'production':
    config = require('./production');
    break;
  default:
    config = require('./development');
}

module.exports = config;
