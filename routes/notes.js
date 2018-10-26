'use strict';

const express = require('express');
const mongoose = require('mongoose');

const { notes } = require('../db');

const router = express.Router();

/* ========== GET/READ ALL ITEMS ========== */
router.get('/', (req, res, next) => {
  const { searchTerm, folderId } = req.query;

  notes
    .filter(searchTerm, folderId)
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
router.post('/', (req, res, next) => {
  const newNote = {};
  ['content', 'title', 'folderId'].forEach((key) => {
    if (req.body[key]) {
      newNote[key] = req.body[key];
    }
  });

  if (!newNote.title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    next(err);
    return;
  }

  if (newNote.folderId) {
    try {
      // eslint-disable-next-line no-unused-vars
      const folderId = new mongoose.Types.ObjectId(newNote.folderId);
    } catch (err) {
      const returnedError = new Error('`folderId` must be a valid ObjectId');
      returnedError.status = 400;
      next(returnedError);
      return;
    }
  }

  notes
    .create(newNote)
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
router.put('/:id', (req, res, next) => {
  const { id } = req.params;

  if (req.body.id && id !== req.body.id) {
    const err = new Error('`id` in body does not match requested resource');
    err.status = 400;
    next(err);
    return;
  }

  const updateObj = {};
  ['title', 'content', 'folderId'].forEach((key) => {
    if (req.body[key]) {
      updateObj[key] = req.body[key];
    }
  });

  if (!updateObj.title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    next(err);
    return;
  }

  if (updateObj.folderId) {
    try {
      // eslint-disable-next-line no-unused-vars
      const oid = new mongoose.Types.ObjectId(updateObj.folderId);
    } catch (err) {
      const returnedError = new Error('`folderId` must be a valid ObjectId');
      returnedError.status = 400;
      next(returnedError);
      return;
    }
  }

  notes
    .update(id, updateObj)
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
