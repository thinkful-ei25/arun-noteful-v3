'use strict';

const mongoose = require('mongoose');

const tagSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(doc, ret) {
        /* eslint-disable no-param-reassign */
        delete ret._id;
        delete ret.__v;
        /* eslint-enable no-param-reassign */
      },
    },
  },
);

module.exports = mongoose.model('Tag', tagSchema);
