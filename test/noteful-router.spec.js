const { expect } = require('chai');
const knex = require('knex');
const app = require('../src/app');
const { makeNoteArray, makeFolderArray } = require('./noteful-fixtures');
const supertest = require('supertest');

/*
XSS
delete notes
-deletes the correct note
-display error if the note doesn't exist
*/

describe('Noteful Endpoints', function () {
  let db;
  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL,
    });
    app.set('db', db);
  });
  after('diconnect from db', () => db.destroy());
  before('clean the table', () => db.raw('TRUNCATE folders, notes RESTART IDENTITY CASCADE'));
  afterEach('cleanup', () => db.raw('TRUNCATE folders, notes RESTART IDENTITY CASCADE'));

  describe('GET /folders', () => {
    context('Given no folders', () => {
      it('responds with 200 and an empty array', () => {
        return supertest(app)
          .get('/folders')
          .expect(200, []);
      });
    });
    context('Given folders exist', () => {
      const testNotes = makeNoteArray();
      const testFolders = makeFolderArray();
      beforeEach('insert folders and notes', () => {
        return db
          .into('folders')
          .insert(testFolders)
          .then(() => {
            return db
              .into('notes')
              .insert(testNotes);
          });
      });
      it('GET /folders responds with 200 and all of the folders', () => {
        return supertest(app)
          .get('/folders')
          .expect(200, testFolders);
      });
    });
  });
  describe('GET /notes', () => {
    context('Given no notes', () => {
      it('responds with 200 and an empty array', () => {
        return supertest(app)
          .get('/notes')
          .expect(200, []);
      });
    });
    context('Given notes exist', () => {
      const testNotes = makeNoteArray();
      const testFolders = makeFolderArray();
      beforeEach('insert folders and notes', () => {
        return db
          .into('folders')
          .insert(testFolders)
          .then(() => {
            return db
              .into('notes')
              .insert(testNotes);
          });
      });
      it('GET /notes responds with 200 and all of the notes', () => {
        return supertest(app)
          .get('/notes')
          .expect(200, JSON.stringify(testNotes));
      });
    });
  });

  describe('POST /folders', () => {
    it('returns an error if a required field is missing', () => {
      return supertest(app)
        .post('/folders')
        .send({})
        .expect(400, 'Value for name was not provided');
    });
    context('creates a new folder and adds it to the database', () => {
      const newFolder = { name: 'new folder' };
      it('POST /folders responds with 201 and the created folder', () => {
        return supertest(app)
          .post('/folders')
          .send(newFolder)
          .expect(201)
          .expect(res => {
            expect(res.body).to.have.property('id');
            expect(res.body.name).to.eql(newFolder.name);
          })
          .then(res => {
            supertest(app)
              .get(`/folders/${res.body.id}`)
              .expect(res.body);
          });
      });
    });
  });

  describe('POST /notes', () => {
    const newNote = { name: 'new note', content: 'new content', folderid: 3 };
    const keys = Object.keys(newNote);
    keys.forEach(key => {
      it(`returns an error if the ${key} field is missing`, () => {
        let brokenNote = {name: 'new note', content: 'new content', folderid:3};
        delete brokenNote[key];
        return supertest(app)
          .post('/notes')
          .send(brokenNote)
          .expect(400)
          .expect(`Value for ${key} was not provided`);
      });
    });
    context.only('creates a new note and adds it to the database', () => {
      const testFolders = makeFolderArray();
      beforeEach('insert folders', () => {
        return db
          .into('folders')
          .insert(testFolders);
      });
      it('POST /notes responds with 201 and the created note', () => {
        return supertest(app)
          .post('/notes')
          .send(newNote)
          .expect(201)
          .expect(res => {
            expect(res.body).to.have.property('id');
            expect(res.body.name).to.eql(newNote.name);
            expect(res.body.content).to.eql(newNote.content);
            expect(res.body.folderid).to.eql(newNote.folderid);
            const expected = new Intl.DateTimeFormat('en-US').format(new Date());
            const actual = new Intl.DateTimeFormat('en-US').format(new Date(res.body.created));
            expect(actual).to.eql(expected);
          })
          .then(res =>
            supertest(app)
              .get(`/notes/${res.body.id}`)
              .then(response=>
                expect(JSON.parse(response)).to.eql(res.body))
          );
      });
    });
  });

  


});