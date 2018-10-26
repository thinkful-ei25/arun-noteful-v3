'use strict';

const express = require('express');
const mongoose = require('mongoose');

const { notes } = require('../db');

const router = express.Router();

function buildNote(req, res, next) {
  req.note = {};
  ['content', 'title', 'folderId', 'tags'].forEach((key) => {
    if (req.body[key]) {
      req.note[key] = req.body[key];
    }
  });

  if (!req.note.title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    next(err);
    return;
  }

  next();
}

function validateIds(req, res, next) {
  const { id, folderId, tags } = req.note;
  const paramId = req.params.id;

  if (folderId && !mongoose.Types.ObjectId.isValid(folderId)) {
    const err = new Error('`folderId` must be a valid ObjectId');
    err.status = 400;
    next(err);
    return;
  }

  if (paramId && id && paramId !== id) {
    const err = new Error('`id` in body does not match requested resource');
    err.status = 400;
    next(err);
    return;
  }

  if (tags && tags.some(tag => !mongoose.Types.ObjectId.isValid(tag))) {
    const err = new Error('All `tags` must be valid ObjectIds');
    err.status = 400;
    next(err);
    return;
  }

  next();
}

/* ========== GET/READ ALL ITEMS ========== */
router.get('/', (req, res, next) => {
  const { searchTerm, folderId, tagId } = req.query;

  notes
    .filter(searchTerm, folderId, tagId)
    .then(results => res.json(results))
    .catch(next);
});

/* ========== GET/READ A SINGLE ITEM ========== */
router.get('/:id', (req, res, next) => {
  const { id } = req.params;

  notes
    .find(id)
    .then((item) => {
      if (!item) {
        next();
        return;
      }

      res.json(item);
    })
    .catch(next);
});

/* ========== POST/CREATE AN ITEM ========== */
router.post('/', buildNote, validateIds, (req, res, next) => {
  notes
    .create(req.note)
    .then((createdNote) => {
      res
        // eslint-disable-next-line no-underscore-dangle
        .location(`${req.baseUrl}/${createdNote._id}`)
        .status(201)
        .json(createdNote);
    })
    .catch(next);
});

/* ========== PUT/UPDATE A SINGLE ITEM ========== */
router.put('/:id', buildNote, validateIds, (req, res, next) => {
  const { id } = req.params;

  notes
    .update(id, req.note)
    .then((result) => {
      if (!result) {
        next();
        return;
      }

      res.json(result);
    })
    .catch(next);
});

/* ========== DELETE/REMOVE A SINGLE ITEM ========== */
router.delete('/:id', (req, res, next) => {
  const { id } = req.params;

  notes
    .delete(id)
    .then(() => res.sendStatus(204))
    .catch(next);
});

module.exports = router;
