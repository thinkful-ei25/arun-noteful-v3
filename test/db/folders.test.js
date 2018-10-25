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
});
