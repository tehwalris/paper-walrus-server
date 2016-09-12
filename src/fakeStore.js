module.exports = {
  sourceFiles: {
    '1': {
      id: '1',
      filename: 'fakeFilename1',
      mimeType: 'fakeMimetype1',
    },
    '2': {
      id: '2',
      filename: 'fakeFilename2',
      mimeType: 'fakeMimetype2',
    },
  },
  documents: {
    '1': {
      id: '1',
      name: 'fakeDocument1',
      parts: [
        {sourceFileId: '1'},
        {sourceFileId: '2', location: {description: 'somewhere'}},
      ],
      visibility: 'standalone',
    },
    '2': {
      id: '2',
      name: 'fakeDocument2',
      parts: [],
      visibility: 'anonymous',
    },
  },
  workSets: {
    '1': {
      id: '1',
      coreDocumentIds: ['1'],
      references: [
        {
          pointA: {documentId: '1', location: {description: 'first page'}},
          pointB: {documentId: '2'},
        },
      ],
    },
  },
};
