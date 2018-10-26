'use strict';

const express = require('express');
const mongoose = require('mongoose');

const { tags } = require('../db');

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

module.exports = router;
