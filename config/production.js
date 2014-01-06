var config;

config = {
  session: {
    secret: process.env.SESSION_SECRET
  }
, db: {
    connectionString: process.env.DATABASE_URL
  }
, redis: {
    host: process.env.REDIS_HOST
  , port: process.env.REDIS_PORT
  , auth: process.env.REDIS_AUTH
  }
};

module.exports = config;
