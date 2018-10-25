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
});
