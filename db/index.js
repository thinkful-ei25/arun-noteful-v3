'use strict';

const mongoose = require('mongoose');

const Folder = require('../models/Folder');
const Note = require('../models/Note');
const Tag = require('../models/Tag');

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

function handleMongoDuplicationError(err, item) {
  if (err.code === 11000 && err.name === 'MongoError') {
    return Promise.reject(
      new ItemAlreadyExistsError(
        `Cannot create item as \`name\` of ${item.name} already exists`,
        err,
      ),
    );
  }
  return Promise.reject(err);
}

const notes = {
  filter(searchTerm, folderId, tagId) {
    const filter = {};
    if (searchTerm) {
      const compiledSearch = new RegExp(searchTerm, 'i');
      filter.$or = [{ title: compiledSearch }, { content: compiledSearch }];
    }

    if (folderId) {
      filter.folderId = folderId;
    }

    if (tagId) {
      filter.tags = tagId;
    }

    return Note.find(filter)
      .populate('tags')
      .sort({ updatedAt: 'desc' })
      .catch(returnNullOnCastError);
  },

  find(id) {
    return Note.findById(id).populate('tags').catch(returnNullOnCastError);
  },

  create(note) {
    return Note.create(note);
  },

  delete(id) {
    return Note.findByIdAndDelete(id).catch(returnNullOnCastError);
  },

  update(id, newNote) {
    const update = Object.assign(
      {
        title: null,
        content: null,
        folderId: null,
        tags: null,
      },
      newNote,
    );

    const unset = Object.keys(update)
      .filter(key => !update[key])
      .reduce((acc, key) => {
        acc[key] = 1;
        return acc;
      }, {});
    Object.keys(unset).forEach(key => delete update[key]);

    if (Object.keys(unset).length > 0) {
      update.$unset = unset;
    }
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
    return Note.updateMany({ folderId: id }, { $unset: { folderId: 1 } })
      .then(() => Folder.findByIdAndDelete(id))
      .catch(returnNullOnCastError);
  },

  seed(data) {
    return Promise.all([Folder.insertMany(data), Folder.createIndexes()]);
  },
};

const tags = {
  fetch() {
    return Tag.find();
  },

  find(id) {
    return Tag.findById(id).catch(returnNullOnCastError);
  },

  create(tag) {
    return Tag.create(tag).catch(err => handleMongoDuplicationError(err, tag));
  },

  update(id, tag) {
    return Tag.findByIdAndUpdate(id, tag, { new: true })
      .catch(err => handleMongoDuplicationError(err, tag))
      .catch(returnNullOnCastError);
  },

  delete(id) {
    return Note.updateMany({ tags: id }, { $pull: { tags: id } })
      .then(() => Tag.findByIdAndDelete(id))
      .catch(returnNullOnCastError);
  },

  seed(data) {
    return Promise.all([Tag.insertMany(data), Tag.createIndexes()]);
  },
};

module.exports = {
  folders,
  ItemAlreadyExistsError,
  notes,
  tags,
};
