'use strict';

const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: String,
});

noteSchema.set('timestamps', true);
noteSchema.set('toJSON', {
  virtuals: true,
  transform(doc, ret) {
    delete ret._id; /* eslint-disable-line no-param-reassign, no-underscore-dangle */
    delete ret.__v; /* eslint-disable-line no-param-reassign, no-underscore-dangle */
  },
});

module.exports = mongoose.model('Note', noteSchema);
