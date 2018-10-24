'use strict';

const mongoose = require('mongoose');

const { TEST_DATABASE_URL, MONGODB_OPTIONS } = require('../config');

module.exports = {
  connectToDatabase() {
    return mongoose
      .connect(TEST_DATABASE_URL, MONGODB_OPTIONS)
      .then(() => this.clearDatabase());
  },

  clearDatabase() {
    return mongoose.connection.db.dropDatabase();
  },

  disconnectFromDatabase() {
    return mongoose.disconnect();
  },
};
