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
      return folders.fetch()
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
});
