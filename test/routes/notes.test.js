'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');

const { tags } = require('../../db');
const app = require('../../server');
const Note = require('../../models/Note');
const notesData = require('../../db/seed/notes');
const tagsData = require('../../db/seed/tags');
const utils = require('../utils');

const { expect } = chai;
chai.use(chaiHttp);

describe('/api/notes', () => {
  before(() => utils.connectToDatabase());
  beforeEach(() => Note.insertMany(notesData).then(() => tags.seed(tagsData)));
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
            expect(note).to.include.keys(
              'title',
              'id',
              'createdAt',
              'updatedAt',
              'folderId',
              'tags',
            );
            expect(note.tags).to.not.be.empty;
            note.tags.forEach((tag) => {
              expect(tag).to.have.all.keys('id', 'name', 'createdAt', 'updatedAt');
            });
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
            // prettier-ignore
            const simplifiedResults = res.body.map(note => Object.assign(
              {},
              note,
              { tags: note.tags.map(tag => tag.id) },
            ));
            expect(simplifiedResults).to.deep.equal(expectedResults);
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

    context('with folderId', () => {
      it('should return only notes with that folderId', function () {
        const folderIdFixture = notesData[0].folderId;
        const expectedNotes = notesData.filter(
          note => note.folderId === folderIdFixture,
        );

        return chai
          .request(app)
          .get(`/api/notes?folderId=${folderIdFixture}`)
          .then((res) => {
            expect(res).to.have.status(200);
            expect(res.body).to.have.length(expectedNotes.length);
          });
      });
    });

    it('should only return appropriate notes given a tagId', function () {
      const tagId = notesData[0].tags[0];
      const expectedNotes = notesData.filter(note => note.tags.includes(tagId));

      return chai
        .request(app)
        .get(`/api/notes?tagId=${tagId}`)
        .then((res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.length(expectedNotes.length);
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
          // prettier-ignore
          const simplifiedResponse = Object.assign(
            {},
            res.body,
            { tags: res.body.tags.map(tag => tag.id) },
          );
          expect(simplifiedResponse).to.deep.equal(noteFixture);
          res.body.tags.forEach((tag) => {
            expect(tag).to.have.all.keys('id', 'name', 'createdAt', 'updatedAt');
          });
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

  describe('DELETE /api/notes/:id', () => {
    it('should only remove the correct note', function () {
      let originalNotes;
      return Note.find()
        .then((results) => {
          originalNotes = results;
        })
        .then(() => chai.request(app).delete(`/api/notes/${originalNotes[0].id}`))
        .then(() => Note.find())
        .then((results) => {
          expect(results).to.have.lengthOf(originalNotes.length - 1);
          expect(results).to.not.deep.include(originalNotes[0]);
        });
    });

    it('should return 204 on successful removal, and be idempotent', function () {
      let noteIdFixture;
      return Note.findOne()
        .then((result) => {
          noteIdFixture = result.id;
        })
        .then(() => chai.request(app).delete(`/api/notes/${noteIdFixture}`))
        .then((res) => {
          expect(res).to.have.status(204);
        })
        .then(() => chai.request(app).delete(`/api/notes/${noteIdFixture}`))
        .then((res) => {
          expect(res).to.have.status(204);
        });
    });
  });

  describe('POST /api/notes', () => {
    const fixture = {
      title: 'My title',
      content: 'My content has content',
      folderId: '000000000000000000000003',
      tags: ['222222222222222222222201'],
    };

    it('should return the new note with a location reference', function () {
      return chai
        .request(app)
        .post('/api/notes')
        .send(fixture)
        .then((res) => {
          expect(res).to.have.status(201);
          expect(res).to.be.json;
          expect(res.header.location).to.equal(`/api/notes/${res.body.id}`);
          expect(res.body).to.be.an('object');
          expect(res.body.title).to.equal(fixture.title);
          expect(res.body.content).to.equal(fixture.content);
          expect(res.body.folderId).to.equal(fixture.folderId);
          expect(res.body.tags).to.have.all.members(fixture.tags);
        });
    });

    it('should create a note available on subsequent reads', function () {
      let returnedUri;
      return chai
        .request(app)
        .post('/api/notes')
        .send(fixture)
        .then((res) => {
          returnedUri = res.headers.location;
        })
        .then(() => chai.request(app).get(returnedUri))
        .then((res) => {
          expect(res).to.have.status(200);
          expect(res.body.title).to.equal(fixture.title);
          expect(res.body.content).to.equal(fixture.content);
        });
    });

    it('should return a 400 error if folderId is an invalid ObjectId', function () {
      const invalidFixture = Object.assign({}, fixture, { folderId: 'test' });
      return chai
        .request(app)
        .post('/api/notes')
        .send(invalidFixture)
        .then((res) => {
          expect(res).to.have.status(400);
          expect(res.body.message).to.equal('`folderId` must be a valid ObjectId');
        });
    });
  });

  describe('PUT /api/notes', () => {
    const fixture = {
      title: 'Rabbit > Cats',
      content: 'Lorem ipsum dolor',
    };

    it('should return 404 if `id` is invalid', function () {
      return chai
        .request(app)
        .put('/api/notes/test')
        .send(fixture)
        .then((res) => {
          expect(res).to.have.status(404);
        });
    });

    it('should return 400 if required fields are missing', function () {
      return Note.findOne()
        .then((result) => {
          const updateObj = {
            content: fixture.content,
            id: result.id,
          };
          return chai
            .request(app)
            .put(`/api/notes/${result.id}`)
            .send(updateObj);
        })
        .then((res) => {
          expect(res).to.have.status(400);
          expect(res).to.be.json;
          expect(res.body.message).to.equal('Missing `title` in request body');
        });
    });

    it('should update and return the updated note if provided valid data', function () {
      return Note.findOne()
        .then((testSubject) => {
          const updateObj = Object.assign({}, fixture, { id: testSubject.id });
          return chai
            .request(app)
            .put(`/api/notes/${updateObj.id}`)
            .send(updateObj);
        })
        .then((res) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body.title).to.equal(fixture.title);
          expect(res.body.content).to.equal(fixture.content);
          expect(res.body.folderId).to.be.null;
        });
    });

    it('should return 400 if the folderId is not a valid ObjectId', function () {
      const updateObj = Object.assign({}, fixture, { folderId: 'happy' });
      return Note.findOne()
        .then((result) => {
          updateObj.id = result.id;
          return chai
            .request(app)
            .put(`/api/notes/${updateObj.id}`)
            .send(updateObj);
        })
        .then((res) => {
          expect(res).to.have.status(400);
          expect(res.body.message).to.equal('`folderId` must be a valid ObjectId');
        });
    });
  });
});
