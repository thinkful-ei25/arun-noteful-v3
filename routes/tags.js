'use strict';

const express = require('express');

const { tags } = require('../db');

const router = express.Router();

router.get('/', (req, res, next) => {
  tags
    .fetch()
    .then(results => res.json(results))
    .catch(next);
});

module.exports = router;
