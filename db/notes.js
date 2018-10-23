'use strict';

const Note = require('../models/Note');

const notes = {
  filter(searchTerm) {
    const filter = {};
    if (searchTerm) {
      filter.title = new RegExp(searchTerm, 'i');
    }

    return Note.find(filter).sort({ updatedAt: 'desc' });
  },

  find(id) {
    return Note.findById(id);
  },
};

module.exports = notes;
