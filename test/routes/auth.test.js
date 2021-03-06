'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');

const server = require('../../server');
const User = require('../../models/User');
const utils = require('../utils');

const { expect } = chai;
chai.use(chaiHttp);

describe('Authentication endpoints', () => {
  before(() => utils.connectToDatabase());
  after(() => utils.disconnectFromDatabase());
  afterEach(() => utils.clearDatabase());

  describe('POST /api/login', () => {
    const url = '/api/login';
    const user = {
      username: 'aseehra',
      password: 'thisismypasswordtherearemanylikeitbutthisoneismind',
      fullname: 'Arun Seehra',
    };

    // prettier-ignore
    beforeEach(() => User
      .hashPassword(user.password)
      .then(digest => User.create(Object.assign({}, user, { password: digest }))));

    context('with valid credentials', () => {
      it('should return the user object as JSON', function () {
        return chai
          .request(server)
          .post(url)
          .send(user)
          .then((res) => {
            expect(res).to.have.status(200);
            expect(res).to.be.json;
            expect(res.body).to.include.all.keys('username', 'id', 'fullname');
            expect(res.body).to.not.include.all.keys('password');

            expect(res.body.username).to.equal(user.username);
          });
      });
    });

    context('with invalid creditials', () => {
      it('should return 401 if (username, password) are not found ', function () {
        return Promise.all([
          chai
            .request(server)
            .post(url)
            .send({ username: 'aseehra', password: 'haha' }),
          chai
            .request(server)
            .post(url)
            .send({ username: 'brendan', password: 'haha' }),
        ]).then((results) => {
          results.forEach((res) => {
            expect(res).to.have.status(401);
          });
        });
      });

      it('should reutrn 400 if username or password fields are missing', function () {
        return Promise.all([
          chai
            .request(server)
            .post(url)
            .send({ password: 'haha' }),
          chai
            .request(server)
            .post(url)
            .send({ username: 'aseehra' }),
        ]).then((results) => {
          results.forEach((res) => {
            expect(res).to.have.status(400);
          });
        });
      });
    });
  });
});
