'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');

const server = require('../../server');
const User = require('../../models/User');
const utils = require('../utils');

const { expect } = chai;
chai.use(chaiHttp);

describe('/api/users', () => {
  before(() => utils.connectToDatabase());
  after(() => utils.disconnectFromDatabase());
  afterEach(() => utils.clearDatabase());

  describe('POST /', () => {
    const url = '/api/users';
    const fixture = { username: 'aseehra', password: 'thisisapassword' };

    it('should create a new user and return the user less her password', function () {
      return chai
        .request(server)
        .post(url)
        .send(fixture)
        .then((res) => {
          expect(res).to.have.status(201);
          expect(res).to.be.json;

          expect(res.body).to.include.all.keys('username', 'id');
          expect(res.body.username).to.equal(fixture.username);
          expect(res.body).to.not.include.all.keys('password');

          return User.findById(res.body.id);
        })
        .then((result) => {
          expect(result.toObject()).to.include.all.keys('username', 'password');
          expect(result.username).to.equal(fixture.username);
          expect(result.password).to.equal(fixture.password);
        });
    });
  });
});
