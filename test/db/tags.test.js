'use strict';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

const { ItemAlreadyExistsError, tags } = require('../../db');
const Tag = require('../../models/Tag');
const tagSeedData = require('../../db/seed/tags');
const utils = require('../utils');

const { expect } = chai;
chai.use(chaiAsPromised);

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

  describe('create', () => {
    const fixture = { name: 'Rabbits > Cats' };

    it('should persist a new tag to the database', function () {
      return tags
        .create(fixture)
        .then(tag => Tag.findById(tag._id))
        .then((result) => {
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

    it('should return the tag', function () {
      return tags.create(fixture).then((tag) => {
        expect(tag.toObject()).to.have.all.keys(
          'name',
          '_id',
          '__v',
          'createdAt',
          'updatedAt',
        );
        expect(tag.name).to.equal(fixture.name);
        expect(tag.toJSON()).to.have.all.keys('name', 'id', 'createdAt', 'updatedAt');
      });
    });

    // eslint-disable-next-line max-len
    it('should throw an `ItemAlreadyExists` error given an existing tag name', function () {
      const duplicateFixture = tagSeedData[0];
      const promise = tags.create({ name: duplicateFixture.name });
      return expect(promise).to.be.rejectedWith(ItemAlreadyExistsError);
    });
  });
});
