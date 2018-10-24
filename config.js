'use strict';

module.exports = {
  PORT: process.env.PORT || 8080,
  TEST_DATABASE_URL:
    process.env.TEST_DATABASE_URL || 'mongodb://localhost:27017/noteful-test',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/noteful',
  MONGODB_OPTIONS: { useNewUrlParser: true, useFindAndModify: false },
};
