'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');

const app = require('../../server');
const Note = require('../../models/Note');
const notesData = require('../../db/seed/notes').notes;
const utils = require('../utils');

const { expect } = chai;
chai.use(chaiHttp);

describe('/api/notes', () => {
  before(() => utils.connectToDatabase());
  beforeEach(() => Note.insertMany(notesData));
  afterEach(() => utils.clearDatabase());
  after(() => utils.disconnectFromDatabase());

  describe('GET /', () => {
    it('should return all notes', function () {
      let notesCount;
      return Note.find()
        .then((results) => {
          notesCount = results.length;
        })
        .then(() => chai.request(app).get('/api/notes'))
        .then((res) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.an('array');
          expect(res.body).to.have.length(notesCount);
          res.body.forEach((note) => {
            expect(note).to.include.keys('title', 'id', 'createdAt', 'updatedAt');
          });
        });
    });

    it('should return notes that do not have internal properties', function () {
      return chai
        .request(app)
        .get('/api/notes')
        .then((res) => {
          expect(res.body).to.be.an('array');
          res.body.forEach((note) => {
            expect(note).to.not.include.keys('_id', '__v');
          });
        });
    });

    context('with searchTerm', () => {
      // eslint-disable-next-line max-len
      it('should return notes that contain the `searchTerm` in either the title or content fields', function () {
        let expectedResults;

        return Note.find({ title: /you/i })
          .then((results) => {
            expectedResults = results.map(note => JSON.parse(JSON.stringify(note)));
          })
          .then(() => chai.request(app).get('/api/notes?searchTerm=you'))
          .then((res) => {
            expect(res).to.have.status(200);
            expect(res.body).to.have.be.an('array');
            expect(res.body).to.have.lengthOf(expectedResults.length);
            expect(res.body).to.have.deep.members(expectedResults);
          })
          .then(() => Note.find({ content: /lorem/i }))
          .then((results) => {
            expectedResults = results.map(note => JSON.parse(JSON.stringify(note)));
          })
          .then(() => chai.request(app).get('/api/notes?searchTerm=lorem'))
          .then((res) => {
            expect(res).to.have.status(200);
            expect(res.body).to.be.an('array');
            expect(res.body).to.have.lengthOf(expectedResults.length);
            expect(res.body).to.have.deep.members(expectedResults);
          });
      });

      it('should return an empty array if `searchTerm` is not found', function () {
        return chai
          .request(app)
          .get('/api/notes?searchTerm=Rabbit')
          .then((res) => {
            expect(res).to.have.status(200);
            expect(res.body).to.be.an('array');
            expect(res.body).to.be.empty;
          });
      });
    });
  });

  describe('GET /api/:id', () => {
    it('given a valid id it should return the correct note', function () {
      let noteFixture;
      return Note.findOne()
        .then((result) => {
          noteFixture = JSON.parse(JSON.stringify(result));
        })
        .then(() => chai.request(app).get(`/api/notes/${noteFixture.id}`))
        .then((res) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.an('object');
          expect(res.body).to.deep.equal(noteFixture);
        });
    });

    it('given an invalid id it should return status 404', function () {
      return chai
        .request(app)
        .get('/api/notes/hahaha')
        .then((res) => {
          expect(res).to.have.status(404);
        });
    });
  });
});
