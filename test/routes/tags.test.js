'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');

const { tags } = require('../../db');
const server = require('../../server');
const tagSeedData = require('../../db/seed/tags');
const utils = require('../utils');

const { expect } = chai;
chai.use(chaiHttp);

describe('/api/tags', () => {
  before(() => utils.connectToDatabase());
  after(() => utils.disconnectFromDatabase());
  beforeEach(() => tags.seed(tagSeedData));
  afterEach(() => utils.clearDatabase());

  describe('GET /', () => {
    it('should return all tags', function () {
      return chai
        .request(server)
        .get('/api/tags')
        .then((res) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.an('array');
          expect(res.body).to.have.lengthOf(tagSeedData.length);
          res.body.forEach((tag) => {
            expect(tag).to.have.all.keys('id', 'name', 'createdAt', 'updatedAt');
          });
        });
    });
  });

  describe('GET /:id', () => {
    it('should return only the tag provided', function () {
      const fixture = tagSeedData[0];
      const url = `/api/tags/${fixture._id}`;

      return chai
        .request(server)
        .get(url)
        .then((res) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.an('object');
          expect(res.body).to.have.all.keys('id', 'name', 'createdAt', 'updatedAt');
          expect(res.body.name).to.equal(fixture.name);
        });
    });

    it('should return 404 if a tag is not found', function () {
      return chai
        .request(server)
        .get('/api/tags/222222222222222222222213')
        .then((res) => {
          expect(res).to.have.status(404);
        });
    });

    it('should return 400 if an invalid ObjectId is provided', function () {
      return chai
        .request(server)
        .get('/api/tags/haha')
        .then((res) => {
          expect(res).to.have.status(400);
          expect(res.body.message).to.equal('`id` must be a valid ObjectId');
        });
    });
  });
});
