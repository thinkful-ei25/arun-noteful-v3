'use strict';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const mongoose = require('mongoose');

const { ItemAlreadyExistsError, notes, tags } = require('../../db');
const Note = require('../../models/Note');
const noteSeedData = require('../../db/seed/notes');
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

  describe('update', () => {
    it('should persist the update to the database and return the new tag', function () {
      const fixture = tagSeedData[0];
      const update = { name: 'Rabbits > cats' };
      let original;

      return Tag.findById(fixture._id)
        .then((result) => {
          original = result;
        })
        .then(() => tags.update(fixture._id, update))
        .then((result) => {
          expect(result.toObject()).to.have.all.keys(
            '_id',
            '__v',
            'createdAt',
            'updatedAt',
            'name',
          );
          expect(result.name).to.equal(update.name);

          return Tag.findById(fixture._id);
        })
        .then((result) => {
          expect(result).to.exist;
          expect(result.name).to.equal(update.name);
          expect(result.createdAt.getTime()).to.equal(original.createdAt.getTime());
          expect(result.updatedAt).to.be.greaterThan(original.updatedAt);
        });
    });

    it('should return null if the original tag is not found', function () {
      return tags.update('haha', { name: 'haha' }).then((result) => {
        expect(result).to.be.null;
      });
    });

    // eslint-disable-next-line max-len
    it('should throw an `ItemAlreadyExistsError` if the name is already in use', function () {
      const fixture = { id: tagSeedData[0]._id, name: tagSeedData[1].name };
      const promise = tags.update(fixture.id, { name: fixture.name });
      return expect(promise).to.be.rejectedWith(ItemAlreadyExistsError);
    });
  });

  describe('delete', () => {
    it('should delete the tag from the database', function () {
      const fixtureId = tagSeedData[0]._id;
      return tags
        .delete(fixtureId)
        .then(() => Tag.findById(fixtureId))
        .then((result) => {
          expect(result).to.not.exist;
        });
    });

    it('should not throw when given a tag that is invalid', function () {
      return tags.delete('haha').then((result) => {
        expect(result).to.not.exist;
      });
    });

    context('with associated notes', () => {
      beforeEach(() => notes.seed(noteSeedData));

      it('should remove the tag from previously associated notes', function () {
        const fixtureId = tagSeedData[1]._id;
        let taggedNotes;
        return Note.find({ tags: fixtureId })
          .then((results) => {
            taggedNotes = results;
          })
          .then(() => tags.delete(fixtureId))
          .then(() => {
            const $in = taggedNotes.map(note => note._id);
            return Note.find({ _id: { $in } });
          })
          .then((results) => {
            results.forEach((note) => {
              expect(note.toObject().tags).to.not.deep.include(
                new mongoose.Types.ObjectId(fixtureId),
              );
            });
          });
      });
    });
  });
});
