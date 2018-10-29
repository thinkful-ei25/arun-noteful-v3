/* eslint-disable no-console */

'use strict';

const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const passport = require('passport');

const { MONGODB_URI, MONGODB_OPTIONS, PORT } = require('./config');
const authRouter = require('./routes/auth');
const foldersRouter = require('./routes/folders');
const localStrategy = require('./auth/localStrategy');
const notesRouter = require('./routes/notes');
const tagsRouter = require('./routes/tags');
const usersRouter = require('./routes/users');

// Create an Express application
const app = express();

// Log all requests. Skip logging during
app.use(
  morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'common', {
    skip: () => process.env.NODE_ENV === 'test',
  }),
);

// Configure passport
passport.use(localStrategy);

// Create a static webserver
app.use(express.static('public'));

// Parse request body
app.use(express.json());

// Mount routers
app.use('/api/notes', notesRouter);
app.use('/api/folders', foldersRouter);
app.use('/api/tags', tagsRouter);
app.use('/api/users', usersRouter);
app.use('/api', authRouter);

// Custom 404 Not Found route handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// Custom Error Handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err.status) {
    const errBody = Object.assign({}, err, { message: err.message });
    res.status(err.status).json(errBody);
  } else {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Listen for incoming connections
if (process.env.NODE_ENV !== 'test') {
  mongoose
    .connect(
      MONGODB_URI,
      MONGODB_OPTIONS,
    )
    .catch((err) => {
      console.error(`Error: ${err.message}`);
      console.error(err);
    });

  app
    .listen(PORT, function serverListen() {
      console.info(`Server listening on ${this.address().port}`);
    })
    .on('error', (err) => {
      console.error(err);
    });
}

module.exports = app; // Export for testing
