'use strict';

const express = require('express');
const mongoose = require('mongoose');

const { ItemAlreadyExistsError, tags } = require('../db');

const router = express.Router();

function rejectInvalidIds(req, res, next) {
  const idParam = req.params.id;

  if (idParam && !mongoose.Types.ObjectId.isValid(idParam)) {
    const err = new Error('`id` must be a valid ObjectId');
    err.status = 400;
    next(err);
    return;
  }

  next();
}

function buildTagFromBody(req, res, next) {
  const { name } = req.body;

  if (!name) {
    const err = new Error('`name` field is required in request body');
    err.status = 400;
    next(err);
    return;
  }

  req.tag = { name };
  next();
}

function handleItemExistsError(err, req, res, next) {
  if (err instanceof ItemAlreadyExistsError) {
    // eslint-disable-next-line no-param-reassign
    err.status = 400;
  }
  next(err);
}

router.get('/', (req, res, next) => {
  tags
    .fetch()
    .then(results => res.json(results))
    .catch(next);
});

router.get('/:id', rejectInvalidIds, (req, res, next) => {
  const { id } = req.params;

  tags
    .find(id)
    .then((result) => {
      if (!result) {
        next();
        return;
      }

      res.json(result);
    })
    .catch(next);
});

router.post('/', buildTagFromBody, (req, res, next) => {
  const { tag } = req;

  tags
    .create(tag)
    .then((result) => {
      res
        .status(201)
        .location(`${req.baseUrl}/${result._id}`)
        .json(result);
    })
    .catch(next);
}, handleItemExistsError);

module.exports = router;
