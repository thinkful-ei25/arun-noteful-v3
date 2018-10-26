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
            expect(tag).to.have.all.keys(
              'id',
              'name',
              'createdAt',
              'updatedAt',
            );
          });
        });
    });
  });
});
