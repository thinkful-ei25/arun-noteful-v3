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

  describe('POST /', () => {
    const url = '/api/tags/';

    // eslint-disable-next-line max-len
    it('should return a new tag with appropriate location header given a valid name', function () {
      const fixture = { name: 'my favorite tag' };
      return chai
        .request(server)
        .post(url)
        .send(fixture)
        .then((res) => {
          expect(res).to.have.status(201);
          expect(res).to.be.json;
          expect(res.headers).to.include.all.keys('location');
          expect(res.body).to.be.an('object');
          expect(res.body).to.have.all.keys('id', 'name', 'updatedAt', 'createdAt');
          expect(res.body.name).to.equal(fixture.name);

          return chai.request(server).get(res.headers.location);
        })
        .then((res) => {
          expect(res).to.have.status(200);
          expect(res.body.name).to.equal(fixture.name);
        });
    });

    it('should return error 400 if the name field is missing', function () {
      return chai
        .request(server)
        .post(url)
        .send({})
        .then((res) => {
          expect(res).to.have.status(400);
          expect(res.body.message).to.equal('`name` field is required in request body');
        });
    });

    it('should return error 400 if the name is a duplicate', function () {
      const fixture = tagSeedData[0];
      return chai
        .request(server)
        .post(url)
        .send({ name: fixture.name })
        .then((res) => {
          expect(res).to.have.status(400);
          expect(res.body.message).to.equal(
            `Cannot create item as \`name\` of ${fixture.name} already exists`,
          );
        });
    });
  });
});
