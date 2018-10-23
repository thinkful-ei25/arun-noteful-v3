'use strict';

const localUri = process.env.NODE_ENV !== 'test'
  ? 'mongodb://localhost:27017/noteful'
  : 'mongodb://localhost:27017/noteful-test';

module.exports = {
  PORT: process.env.PORT || 8080,
  MONGODB_URI: process.env.MONGODB_URI || localUri,
};
