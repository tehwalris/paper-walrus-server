const sharp = require('sharp'),
  uuid = require('uuid').v4,
  databaseHelpers = require('./databaseHelpers');

module.exports = class PreviewGenerator {
  constructor({knex, minio}, minioBucket, previewConfig) {
    this._knex = knex;
    this._minio = minio;
    this._minioBucket = minioBucket;
    this._previewConfig = previewConfig;
  }

  isSupportedInputType(type) {
    return this._previewConfig.supportedInputTypes.includes(type);
  }

  async generate(sourceFileId, originalKey) {
    const originalStream = await this._minio.getObject(this._minioBucket, originalKey);
    const {width, height} = this._previewConfig.minSize;
    const transformer = sharp().resize(width, height).min().jpeg();
    originalStream.pipe(transformer);
    const previewBuffer = await transformer.toBuffer();
    const previewKey = `${uuid()}.jpeg`;
    await this._minio.putObject(
      this._minioBucket, previewKey, previewBuffer, 'image/jpeg',
    );
    await databaseHelpers.sourceFiles.updateById(
      {knex: this._knex}, sourceFileId, {previewFilename: previewKey}
    );
  }
}
 /*
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
      return this._generateImagePreview(originalPath);
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
*/
