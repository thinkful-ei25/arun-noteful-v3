/* eslint-disable no-console */

'use strict';

const mongoose = require('mongoose');

const { MONGODB_URI, MONGODB_OPTIONS } = require('../../config');
const Folder = require('../../models/Folder');
const folders = require('../seed/folders');
const Note = require('../../models/Note');
const { notes } = require('../seed/notes');


mongoose
  .connect(MONGODB_URI, MONGODB_OPTIONS)
  .then(() => mongoose.connection.db.dropDatabase())
  .then(() => Note.insertMany(notes))
  .then(results => console.info(`Inserted ${results.length} Notes`))
  .then(() => Folder.insertMany(folders))
  .then(results => console.log(`Inserted ${results.length} Folders`))
  .then(() => mongoose.disconnect())
  .catch(console.err);
