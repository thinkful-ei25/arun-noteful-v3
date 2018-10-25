'use strict';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

const Folder = require('../../models/Folder');
const folderSeedData = require('../../db/seed/folders');
const utils = require('../utils');
const { folders, ItemAlreadyExistsError } = require('../../db');

chai.use(chaiAsPromised);
const { expect } = chai;

describe('Folders interface', () => {
  before(() => utils.connectToDatabase());
  after(() => utils.disconnectFromDatabase());

  // prettier-ignore
  beforeEach(() => folders.seed(folderSeedData));
  afterEach(() => utils.clearDatabase());

  describe('fetch', () => {
    it('should return all folders', function () {
      return folders.fetch().then((result) => {
        expect(result).to.have.lengthOf(folderSeedData.length);
      });
    });
  });

  describe('find', () => {
    it('should return a folder when called with a valid `id`', function () {
      let fixture;
      return Folder.findOne()
        .then((result) => {
          fixture = result;
        })
        .then(() => folders.find(fixture._id))
        .then((result) => {
          expect(result).to.deep.equal(fixture);
        });
    });

    it('should return null when called with an invalid `id`', function () {
      return Promise.all([
        folders.find('111111111111111111111111'),
        folders.find('test'),
      ]).then((results) => {
        results.forEach(result => expect(result).to.be.null);
      });
    });
  });

  describe('create', () => {
    const fixture = { name: 'My name' };

    // eslint-disable-next-line max-len
    it('should persist and return a newly created note when given a new name', function () {
      let createdId;
      return folders
        .create(fixture)
        .then((result) => {
          expect(result).to.exist;
          expect(result.toObject()).to.include.all.keys(
            '_id',
            'createdAt',
            'updatedAt',
            'name',
          );
          expect(result.name).to.equal(fixture.name);
          createdId = result._id;
        })
        .then(() => Folder.findById(createdId))
        .then((result) => {
          expect(result.name).to.equal(fixture.name);
        });
    });

    it('should throw a `ItemAlreadyExistsError` if name is not unique', function () {
      const { name } = folderSeedData[0];
      const createPromise = folders.create({ name });

      // return createPromise;
      return expect(createPromise).to.be.rejectedWith(ItemAlreadyExistsError);
    });
  });

  describe('update', () => {
    it('should persist and return the newly updated note', function () {
      const fixture = { name: 'test test' };
      let original;
      return Folder.findOne()
        .then((folder) => {
          original = folder;
        })
        .then(() => folders.update(original._id, fixture))
        .then((result) => {
          expect(result.toObject()).to.include.keys(
            '_id',
            'createdAt',
            'updatedAt',
            'name',
          );
          expect(result.name).to.equal(fixture.name);
        })
        .then(() => Folder.findById(original._id))
        .then((result) => {
          expect(result.name).to.equal(fixture.name);
          expect(result.updatedAt).to.be.greaterThan(original.updatedAt);
          expect(result.createdAt.getTime()).to.equal(original.createdAt.getTime());
        });
    });

    // eslint-disable-next-line max-len
    it('should throw an `ItemAlreadyExistsError` if the name already exists', function () {
      const updatePromise = Folder.findOne().then((folder) => {
        let fixture = folderSeedData[2];
        if (folder._id === fixture.id) {
          fixture = folderSeedData[0]; // eslint-disable-line prefer-destructuring
        }

        return folders.update(folder._id, { name: fixture.name });
      });
      return expect(updatePromise).to.be.rejectedWith(ItemAlreadyExistsError);
    });

    it('should return null if the `id` is not found', function () {
      return folders.update('test', { name: 'test' })
        .then((result) => {
          expect(result).to.be.null;
        });
    });
  });

  describe('delete', () => {
    it('with a valid id, it should remove the folder', function () {
      const fixtureId = folderSeedData[0]._id;
      return folders.delete(fixtureId)
        .then(() => Folder.findById(fixtureId))
        .then((result) => {
          expect(result).to.be.null;
        });
    });

    it('should return null if given an invalid id', function () {
      return folders.delete('haha')
        .then((result) => {
          expect(result).to.be.null;
        });
    });
  });
});
