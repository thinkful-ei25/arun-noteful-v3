'use strict';

const { expect } = require('chai');
const mongoose = require('mongoose');

const { MONGODB_URI } = require('../../config');
const Note = require('../../models/Note');
const notes = require('../../db/notes');
const notesSeed = require('../../db/seed/notes');

describe('Notes interface', () => {
  before(() => mongoose
    .connect(
      MONGODB_URI,
      { useNewUrlParser: true },
    )
    .then(() => mongoose.connection.db.dropDatabase()));

  beforeEach(() => Note.insertMany(notesSeed.notes));

  afterEach(() => mongoose.connection.db.dropDatabase());
  after(() => mongoose.disconnect());

  describe('filter', () => {
    context('without a `searchTerm`', () => {
      it('should return all notes', function () {
        return notes.filter().then((results) => {
          expect(results).to.have.length(8);
        });
      });
    });

    context('with a valid `searchTerm`', () => {
      it('should return notes with `searchTerm` in the title', function () {
        const expectedTitles = [notesSeed.notes[2].title, notesSeed.notes[4].title];
        return notes.filter("you'll").then((results) => {
          expect(results).to.have.length(2);
          expect(results.map(note => note.title)).to.have.members(expectedTitles);
        });
      });

      it('should search using case insensitve matches', function () {
        return notes.filter('lady gaga').then((results) => {
          expect(results).to.have.length(1);
        });
      });
    });

    context('with an invalid `searchTerm`', () => {
      it('should return an empty array', function () {
        return notes.filter('rabbit').then((results) => {
          expect(results).to.be.an('array');
          expect(results).to.be.empty;
        });
      });
    });
  });

  describe('find', () => {
    it('should return null for an invalid id', function () {
      return notes.find('000000000000000000000008').then((result) => {
        expect(result).to.be.null;
      });
    });

    it('should return the correct object for a valid id', function () {
      return notes.find('000000000000000000000000').then((result) => {
        expect(result.title).to.equal('5 life lessons learned from cats');
      });
    });
  });

  describe('create', () => {
    it('should return the newly created object with a valid id', function () {
      const newNote = { title: 'Rabbits > Cats', content: "They're cuter!" };
      return notes.create(newNote).then((result) => {
        expect(result.toObject()).to.include.all.keys([
          '_id',
          'createdAt',
          'updatedAt',
          'title',
          'content',
        ]);
        expect(result.title).to.equal(newNote.title);
      });
    });
  });

  describe('delete', () => {
    it('with a valid id, it should remove the object', function () {
      const fixtureId = '000000000000000000000002';
      return notes
        .delete(fixtureId)
        .then(() => Note.findById(fixtureId))
        .then((result) => {
          expect(result).to.be.null;
        });
    });

    it('with an invalid id, it should return null', function () {
      const fixtureId = '000000000000000000000010';
      return notes.delete(fixtureId).then((result) => {
        expect(result).to.be.null;
      });
    });
  });

  describe('update', () => {
    it('with a valid id it should return the updated object', function () {
      const update = { title: 'rabbits > cats' };
      const fixtureId = '000000000000000000000003';
      return notes.update(fixtureId, update)
        .then((result) => {
          expect(result).to.be.an('object');
          expect(result.title).to.equal(update.title);
          // eslint-disable-next-line no-underscore-dangle
          expect(result._id.toString()).to.equal(fixtureId);
        });
    });
  });
});
