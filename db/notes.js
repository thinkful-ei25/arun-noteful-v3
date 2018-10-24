'use strict';

const Note = require('../models/Note');

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
    return Note.findById(id);
  },

  create(note) {
    return Note.create(note);
  },

  delete(id) {
    return Note.findByIdAndDelete(id);
  },

  update(id, newNote) {
    const update = Object.assign({ title: undefined, content: undefined }, newNote);
    return Note.findByIdAndUpdate(id, update, { new: true });
  },
};

module.exports = notes;
