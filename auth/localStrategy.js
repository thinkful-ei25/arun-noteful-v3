'use strict';

const { Strategy: LocalStrategy } = require('passport-local');

const { LoginError } = require('./errors');
const User = require('../models/User');

const localStrategy = new LocalStrategy((username, password, done) => {
  User.findOne({ username })
    .then((result) => {
      if (!result) {
        throw new LoginError('Incorrect username', 'username');
      }

      if (!result.validatePassword(password)) {
        throw new LoginError('Incorrect password', 'password');
      }

      done(null, result);
    })
    .catch((err) => {
      if (err instanceof LoginError) {
        done(null, false);
        return;
      }

      done(err);
    });
});

module.exports = localStrategy;
