'use strict';

function getDocuments(context) {
  return context.knex.select(
    'documents.id',
    'documents.name',
    'documents.visibility'
  ).from('documents');
}

function getDocumentById(context, id) { // Unchainable
  return getDocuments(context).where('documents.id', id).then(rows => rows[0]);
}

function getSourceFiles(context) {
  return context.knex.select(
    'sourceFiles.id',
    'sourceFiles.filename',
    'sourceFiles.mimeType',
    'sourceFiles.previewFilename'
  ).from('sourceFiles');
}

function getUnassignedSourceFiles(context) {
  return getSourceFiles(context)
    .leftJoin('documentParts', 'sourceFiles.id', 'documentParts.sourceFileId')
    .whereNull('documentParts.id');
}

function getSourceFileById(context, id) { // Unchainable
  return getSourceFiles(context).where('sourceFiles.id', id).then(rows => rows[0]);
}

function getDocumentParts(context) {
  return context.knex.select(
    'documentParts.sourceFileId'
  ).from('documentParts');
}

function getPartsOfDocument(context, documentId) {
  return getDocumentParts(context).where('documentParts.documentId', documentId);
}

function createSourceFile(context, sourceFile) {
  return context.knex.insert(sourceFile).into('sourceFiles');
}

module.exports = {
  getDocuments,
  getDocumentById,
  getSourceFiles,
  getUnassignedSourceFiles,
  getSourceFileById,
  getDocumentParts,
  getPartsOfDocument,
  createSourceFile,
};
