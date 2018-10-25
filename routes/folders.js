'use strict';

const express = require('express');

const { folders, ItemAlreadyExistsError } = require('../db');

const router = express.Router();

router.get('/', (req, res, next) => {
  folders
    .fetch()
    .then(results => res.json(results))
    .catch(next);
});

router.get('/:id', (req, res, next) => {
  const { id } = req.params;
  folders.find(id).then((result) => {
    if (!result) {
      next();
      return;
    }
    res.json(result);
  });
});

router.post('/', (req, res, next) => {
  const { name } = req.body;

  if (!name) {
    const err = new Error('Missing `name` field in request body');
    err.status = 400;
    next(err);
    return;
  }

  folders
    .create({ name })
    .then((folder) => {
      res
        .status(201)
        .location(`${req.baseUrl}/${folder._id}`)
        .json(folder);
    })
    .catch((err) => {
      if (err instanceof ItemAlreadyExistsError) {
        const returnedError = Object.assign({}, err);
        returnedError.status = 400;
        next(returnedError);
        return Promise.resolve();
      }
      return Promise.reject(err);
    })
    .catch(next);
});

router.put('/:id', (req, res, next) => {
  const { id } = req.params;
  const { name } = req.body;

  if (!name) {
    const err = new Error('Missing `name` field in request body');
    err.status = 400;
    next(err);
    return;
  }

  if (req.body.id && req.body.id !== id) {
    const err = new Error('`id` in request body does not match path');
    err.status = 400;
    next(err);
    return;
  }

  folders
    .update(id, { name })
    .then((folder) => {
      if (!folder) {
        next();
        return;
      }
      res.json(folder);
    })
    .catch((err) => {
      if (err instanceof ItemAlreadyExistsError) {
        const returnedError = Object.assign({}, err);
        returnedError.status = 400;
        next(returnedError);
        return Promise.resolve();
      }
      return Promise.reject(err);
    })
    .catch(next);
});

module.exports = router;
