/* eslint-disable no-console */

'use strict';

const mongoose = require('mongoose');

const { MONGODB_URI, MONGODB_OPTIONS } = require('../../config');
const { folders, notes, tags } = require('../');
const folderData = require('../seed/folders');
const notesData = require('../seed/notes');
const tagsData = require('../seed/tags');


mongoose
  .connect(MONGODB_URI, MONGODB_OPTIONS)
  .then(() => mongoose.connection.db.dropDatabase())
  .then(() => notes.seed(notesData))
  .then(results => console.info(`Inserted ${results.length} Notes`))
  .then(() => folders.seed(folderData))
  .then(results => console.log(`Inserted ${results[0].length} Folders`))
  .then(() => tags.seed(tagsData))
  .then(results => console.log(`Inserted ${results[0].length} Tags`))
  .then(() => mongoose.disconnect())
  .catch(console.err);
