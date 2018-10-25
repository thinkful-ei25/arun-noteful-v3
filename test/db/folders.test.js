'use strict';

const { expect } = require('chai');

const Folder = require('../../models/Folder');
const { folders } = require('../../db');
const folderSeedData = require('../../db/seed/folders');
const utils = require('../utils');

describe('Folders interface', () => {
  before(() => utils.connectToDatabase());
  after(() => utils.disconnectFromDatabase());

  beforeEach(() => Folder.insertMany(folderSeedData));
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
});
