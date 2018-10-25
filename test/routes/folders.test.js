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
      return folders.find(id)
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
});
