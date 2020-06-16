function makeNoteArray(){
  return [
    {
      id:1,
      name: 'note 1:1',
      content: 'content 1',
      created: new Date(),
      folderid: 1
    },
    {
      id:2,
      name: 'note 2:3',
      content: 'content 2',
      created: new Date(),
      folderid: 3
    },
    {
      id:3,
      name: 'note 3:2',
      content: 'content 3',
      created: new Date(),
      folderid: 2
    },
    {
      id:4,
      name: 'note 4:1',
      content: 'content 4',
      created: new Date(),
      folderid: 1
    },
    {
      id:5,
      name: 'note 5:3',
      content: 'content 5',
      created: new Date(),
      folderid: 3
    }
  ]
}

function makeFolderArray(){
  return [
    {
      id:1,
      name: 'folder 1'
    },
    {
      id:2,
      name: 'folder 2'
    },
    {
      id:3,
      name: 'folder 3'
    }
  ]
}

module.exports = {
  makeNoteArray,
  makeFolderArray,
};