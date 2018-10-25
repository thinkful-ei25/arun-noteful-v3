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

module.exports = router;
