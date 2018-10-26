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
});
