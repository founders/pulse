var config;

config = {
  session: {
    secret: 'founders-illinois-entrepreneurs'
  }
, db: {
    connectionString: 'mongodb://localhost/pulse'
  }
, redis: {
    host: '127.0.0.1'
  , port: 6379
  }
};

module.exports = config;
