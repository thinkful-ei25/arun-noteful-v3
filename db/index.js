'use strict';

const mongoose = require('mongoose');

const Folder = require('../models/Folder');
const Note = require('../models/Note');

const { CastError } = mongoose;

function ItemAlreadyExistsError(message, err) {
  this.name = 'ItemAlreadyExistsError';
  this.message = message;
  this.stack = Error.captureStackTrace(this, ItemAlreadyExistsError);

  if (err) {
    this.mongoError = err.message;
  }
}
ItemAlreadyExistsError.prototype = Object.create(Error.prototype);

function returnNullOnCastError(err) {
  if (Object.prototype.isPrototypeOf.call(CastError.prototype, err)) {
    return Promise.resolve(null);
  }
  return Promise.reject(err);
}

function handleMongoDuplicationError(err, folder) {
  if (err.code === 11000 && err.name === 'MongoError') {
    return Promise.reject(
      new ItemAlreadyExistsError(
        `Cannot create new folder as \`name\` of ${folder.name} already exists`,
        err,
      ),
    );
  }
  return Promise.reject(err);
}

const notes = {
  filter(searchTerm, folderId) {
    const filter = {};
    if (searchTerm) {
      const compiledSearch = new RegExp(searchTerm, 'i');
      filter.$or = [{ title: compiledSearch }, { content: compiledSearch }];
    }

    if (folderId) {
      filter.folderId = folderId;
    }

    return Note.find(filter).sort({ updatedAt: 'desc' });
  },

  find(id) {
    return Note.findById(id).catch(returnNullOnCastError);
  },

  create(note) {
    return Note.create(note);
  },

  delete(id) {
    return Note.findByIdAndDelete(id).catch(returnNullOnCastError);
  },

  update(id, newNote) {
    const update = Object.assign(
      { title: undefined, content: undefined, folderId: undefined },
      newNote,
    );
    return Note.findByIdAndUpdate(id, update, { new: true }).catch(
      returnNullOnCastError,
    );
  },

  seed(data) {
    return Note.insertMany(data);
  },
};

const folders = {
  fetch() {
    return Folder.find();
  },

  find(id) {
    return Folder.findById(id).catch(returnNullOnCastError);
  },

  create(folder) {
    return Folder.create(folder).catch(err => handleMongoDuplicationError(err, folder));
  },

  update(id, newFolder) {
    // prettier-ignore
    return Folder
      .findByIdAndUpdate(id, newFolder, { new: true })
      .catch(err => handleMongoDuplicationError(err, newFolder))
      .catch(returnNullOnCastError);
  },

  delete(id) {
    return notes
      .filter(null, id)
      .then((notesToBeProcessed) => {
        // prettier-ignore
        const notePromises = notesToBeProcessed.map(
          note => note.updateOne({ $unset: { folderId: '' } }),
        );
        return Promise.all(notePromises);
      })
      .then(() => Folder.findByIdAndDelete(id))
      .catch(returnNullOnCastError);
  },

  seed(data) {
    return Promise.all([Folder.insertMany(data), Folder.createIndexes()]);
  },
};

module.exports = { folders, ItemAlreadyExistsError, notes };
