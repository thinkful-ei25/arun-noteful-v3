'use strict';

const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    fullname: String,
  },
  {
    toJSON: {
      virtuals: true,
      transform(doc, result) {
        /* eslint-disable no-param-reassign */
        delete result._id;
        delete result.__v;
        delete result.password;
        /* eslint-enable no-param-reassign */
      },
    },
  },
);

userSchema.statics.hashPassword = function userHashPassword(password) {
  return bcrypt.hash(password, 10);
};

userSchema.methods.validatePassword = function userValidPassword(password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);
