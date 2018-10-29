'use strict';

const express = require('express');

const User = require('../models/User');

const router = new express.Router();

router.post('/', (req, res, next) => {
  const { username, password } = req.body;

  User.create({ username, password })
    .then((result) => {
      res
        .status(201)
        .location(`${req.baseUrl}/${result._id}`)
        .json(result);
    })
    .catch(next);
});

module.exports = router;
