'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');

const { folders } = require('../../db');
const folderSeedData = require('../../db/seed/folders');
const server = require('../../server');
const utils = require('../utils');

const { expect } = chai;
chai.use(chaiHttp);

describe('/api/folders', () => {
  before(() => utils.connectToDatabase());
  after(() => utils.disconnectFromDatabase());

  beforeEach(() => folders.seed(folderSeedData));
  afterEach(() => utils.clearDatabase());

  describe('GET /', () => {
    it('should return all folders', function () {
      let expected;
      return folders
        .fetch()
        .then((results) => {
          expected = results.map(utils.jsonify);
        })
        .then(() => chai.request(server).get('/api/folders'))
        .then((res) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.deep.equal(expected);
        });
    });
  });

  describe('GET /:id', () => {
    it('should return a 404 when provided an invalid id', function () {
      return Promise.all([
        chai.request(server).get('/api/folders/111111111111111111111111'),
        chai.request(server).get('/api/folders/test'),
      ]).then((results) => {
        results.forEach((res) => {
          expect(res).to.have.status(404);
        });
      });
    });

    it('should return a folder without extraneous information', function () {
      const id = folderSeedData[0]._id;
      let fixture;
      return folders
        .find(id)
        .then((result) => {
          fixture = utils.jsonify(result);
        })
        .then(() => chai.request(server).get(`/api/folders/${id}`))
        .then((res) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.not.include.keys('_id', '__v');
          expect(res.body).to.deep.equal(fixture);
        });
    });
  });

  describe('POST /', () => {
    const fixture = { name: 'test' };

    it('should return a new folder with appropriate location header', function () {
      let created;
      return chai
        .request(server)
        .post('/api/folders')
        .send(fixture)
        .then((res) => {
          created = res.body;
          expect(res).to.have.status(201);
          expect(res.headers.location).to.equal(`/api/folders/${created.id}`);
          expect(res.body).to.have.all.keys('id', 'name', 'createdAt', 'updatedAt');
          expect(res.body.name).to.equal(fixture.name);
        })
        .then(() => folders.find(created.id))
        .then((dbResult) => {
          expect(created).to.deep.equal(utils.jsonify(dbResult));
        });
    });

    it('should return a 400 error when missing fields', function () {
      return chai
        .request(server)
        .post('/api/folders')
        .send({})
        .then((res) => {
          expect(res).to.have.status(400);
          expect(res.body.message).to.equal('Missing `name` field in request body');
        });
    });

    it('should return 400 code when given an already existing name', function () {
      const existingName = folderSeedData[0].name;
      return chai
        .request(server)
        .post('/api/folders')
        .send({ name: existingName })
        .then((res) => {
          expect(res).to.have.status(400);
          expect(res.body.message).to.equal(
            `Cannot create item as \`name\` of ${existingName} already exists`,
          );
        });
    });
  });

  describe('PUT /api/folders/:id', () => {
    it('should update and return the new folder given a valid request', function () {
      const fixture = { id: folderSeedData[0]._id, name: 'test' };
      return chai
        .request(server)
        .put(`/api/folders/${fixture.id}`)
        .send(fixture)
        .then((res) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.have.all.keys('id', 'createdAt', 'updatedAt', 'name');
          expect(res.body.name).to.equal(fixture.name);

          return chai.request(server).get(`/api/folders/${res.body.id}`);
        })
        .then((res) => {
          expect(res).to.have.status(200);
          expect(res.body.name).to.equal(fixture.name);
        });
    });

    it('should return 400 code when given an already existing name', function () {
      const fixture = { id: folderSeedData[0]._id, name: folderSeedData[1].name };
      return chai
        .request(server)
        .put(`/api/folders/${fixture.id}`)
        .send(fixture)
        .then((res) => {
          expect(res).to.have.status(400);
          expect(res.body.message).to.equal(
            `Cannot create item as \`name\` of ${fixture.name} already exists`,
          );
        });
    });

    it('should return 404 for an invalid id', function () {
      return chai
        .request(server)
        .put('/api/folders/test')
        .send({ name: 'haha' })
        .then((res) => {
          expect(res).to.have.status(404);
        });
    });

    it('should return 400 if `name` is missing', function () {
      const fixture = { id: folderSeedData[0]._id };
      return chai
        .request(server)
        .put(`/api/folders/${fixture.id}`)
        .send(fixture)
        .then((res) => {
          expect(res).to.have.status(400);
          expect(res.body.message).to.equal('Missing `name` field in request body');
        });
    });

    it('should return 400 if `id` in body doesnt match route', function () {
      const fixture = { id: folderSeedData[0]._id, name: 'test' };
      const pathId = folderSeedData[1]._id;
      return chai
        .request(server)
        .put(`/api/folders/${pathId}`)
        .send(fixture)
        .then((res) => {
          expect(res).to.have.status(400);
          expect(res.body.message).to.equal('`id` in request body does not match path');
        });
    });
  });

  describe('DELETE /api/folders', () => {
    const fixtureUrl = `/api/folders/${folderSeedData[0]._id}`;

    it('should delete a folder with a valid id', function () {
      return chai
        .request(server)
        .delete(fixtureUrl)
        .then(() => chai.request(server).get(fixtureUrl))
        .then((res) => {
          expect(res).to.have.status(404);
        });
    });

    it('should return 204 and be idempotent', function () {
      return chai
        .request(server)
        .delete(fixtureUrl)
        .then((res) => {
          expect(res).to.have.status(204);
        })
        .then(() => chai.request(server).delete(fixtureUrl))
        .then((res) => {
          expect(res).to.have.status(204);
        });
    });
  });
});
