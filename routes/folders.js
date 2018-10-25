'use strict';

const express = require('express');

const { folders } = require('../db');

const router = express.Router();

router.get('/', (req, res, next) => {
  folders
    .fetch()
    .then(results => res.json(results))
    .catch(next);
});

router.get('/:id', (req, res, next) => {
  const { id } = req.params;
  folders
    .find(id)
    .then((result) => {
      if (!result) {
        next();
        return;
      }
      res.json(result);
    });
});

module.exports = router;
