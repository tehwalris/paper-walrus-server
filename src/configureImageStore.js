const _ = require('lodash'),
  promisify = require('promisify-node'),
  fs = promisify('fs'),
  path = require('path'),
  mkdirp = require('mkdirp-promise/lib/node6'),
  databaseHelpers = require('./databaseHelpers');

function moveAllFilesExcept(source, destination, exceptions) {
  return fs.readdir(source)
    .then(allFilenames => Promise.all(allFilenames.map(filename => {
      return fs.stat(path.join(source, filename)).then(stats => ({filename, stats}));
    })))
    .then(filesWithStats => _.difference(
      _.chain(filesWithStats).filter(({stats}) => stats.isFile()).map('filename').value(),
      exceptions
    ))
    .then(filesToMove => Promise.all(filesToMove.map(filename => fs.rename(
      path.join(source, filename),
      path.join(destination, filename)
    ))));
}

function getOwnedFilenames(context) {
  return databaseHelpers.sourceFiles.get(context)
    .then(sourceFiles => 
      _.chain(sourceFiles)
        .flatMap(sourceFile => [sourceFile.filename, sourceFile.previewFilename])
        .compact()
        .value()
    );
}

module.exports = function({imagePath, orphanedImagePath}, context) {
  return mkdirp(imagePath)
    .then(() => mkdirp(orphanedImagePath))
    .then(() => getOwnedFilenames(context))
    .then(ownedFilenames => moveAllFilesExcept(imagePath, orphanedImagePath, ownedFilenames))
    .then(movedFiles => {
      if(!_.isEmpty(movedFiles))
        console.log(`Orphaned images moved: ${movedFiles.length}.`);
    });
}
