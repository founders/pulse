var config;

config = {
  session: {
    secret: process.env.SESSION_SECRET
  }
, db: {
    connectionString: process.env.DATABASE_URL
  }
};

module.exports = config;
