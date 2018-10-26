'use strict';

const { expect } = require('chai');

const { tags } = require('../../db');
const tagSeedData = require('../../db/seed/tags');
const utils = require('../utils');

describe('Tags interaface', () => {
  before(() => utils.connectToDatabase());
  after(() => utils.disconnectFromDatabase());

  beforeEach(() => tags.seed(tagSeedData));
  afterEach(() => utils.clearDatabase());

  describe('fetch', () => {
    it('should return all the tags', function () {
      return tags.fetch().then((result) => {
        expect(result).to.have.lengthOf(tagSeedData.length);
      });
    });
  });

  describe('find', () => {
    it('should return only the tag with the given id', function () {
      const fixture = tagSeedData[0];
      return tags.find(fixture._id).then((result) => {
        expect(result.toObject()).to.have.all.keys(
          'name',
          '_id',
          '__v',
          'createdAt',
          'updatedAt',
        );
        expect(result.name).to.equal(fixture.name);
      });
    });

    it('should return null given an invalid id', function () {
      return Promise.all([
        tags.find('222222222222222222222213'),
        tags.find('hahaha'),
      ]).then((results) => {
        results.forEach((result) => {
          expect(result).to.be.null;
        });
      });
    });
  });
});
