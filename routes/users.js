'use strict';

const express = require('express');

const User = require('../models/User');

const router = new express.Router();

router.post('/', (req, res, next) => {
  const { username, password, fullname } = req.body;

  User.hashPassword(password)
    .then(digest => User.create({ username, fullname, password: digest }))
    .then((result) => {
      res
        .status(201)
        .location(`${req.baseUrl}/${result._id}`)
        .json(result);
    })
    .catch(next);
});

module.exports = router;
