'use strict';

const mongoose = require('mongoose');

const Folder = require('../models/Folder');
const Note = require('../models/Note');

const { CastError } = mongoose;

function returnNullOnCastError(err) {
  if (Object.prototype.isPrototypeOf.call(CastError.prototype, err)) {
    return Promise.resolve(null);
  }
  return Promise.reject(err);
}

const notes = {
  filter(searchTerm) {
    const filter = {};
    if (searchTerm) {
      const compiledSearch = new RegExp(searchTerm, 'i');
      filter.$or = [{ title: compiledSearch }, { content: compiledSearch }];
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
    const update = Object.assign({ title: undefined, content: undefined }, newNote);
    return Note.findByIdAndUpdate(id, update, { new: true }).catch(
      returnNullOnCastError,
    );
  },
};

const folders = {
  fetch() {
    return Folder.find();
  },

  seed(data) {
    return Folder.insertMany(data);
  },
};

module.exports = { notes, folders };
