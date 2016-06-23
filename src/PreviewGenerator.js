const lwip = require('lwip'),
  path = require('path'),
  uuid = require('uuid').v4,
  mkdirp = require('mkdirp');

module.exports = class PreviewGenerator {
  constructor(destination, extension, previewSize) {
    mkdirp(destination, err => {if(err) throw err});
    this._destination = destination;
    this._extension = extension;
    this._previewSize = previewSize;
  }

  generate(originalPath, originalType) {
    if (originalType.split('/')[0].toLowerCase() === 'image')
      return this._generateImagePreview(original);
    return Promise.resolve(null);
  }

  _generateImagePreview(originalPath) {
    const previewFilename = `${uuid()}.${this._extension}`;
    const previewPath = path.join(this._destination, previewFilename);
    return new Promise((resolve, reject) => {
      lwip.open(originalPath, (err, image) => {
        image.batch()
          .cover(this._previewSize.width, this._previewSize.height)
          .writeFile(previewPath, (err) => {
            if(err) reject(err);
            else resolve(previewFilename);
          })
      });
    });
  }
}
