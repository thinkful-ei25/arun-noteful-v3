/* eslint-disable no-console */

'use strict';

const mongoose = require('mongoose');

const { MONGODB_URI } = require('../../config');
const Note = require('../../models/Note');
const { notes } = require('../seed/notes');


mongoose
  .connect(MONGODB_URI, { useNewUrlParser: true })
  .then(() => mongoose.connection.db.dropDatabase())
  .then(() => Note.insertMany(notes))
  .then(results => console.info(`Inserted ${results.length} Notes`))
  .then(() => mongoose.disconnect())
  .catch(console.err);
