const Minio = require('minio'),
  promisify = require('promisify-node'),
  url = require('url'),
  path = require('path'),
  {clone} = require('lodash');

async function ensureBucketConfigued(minio, bucket, region) {
  if(!(await minio.bucketExists(bucket))) {
    console.log(`Creating bucket ${bucket} in ${region}.`);
    await minio.makeBucket(bucket, region);
  }
}

function convertToPublicUrl(originalUrl, publicPath) {
  const parsedUrl = url.parse(originalUrl);
  return path.join(publicPath, parsedUrl.path);
}

function promisifyClient(rawClient, publicPath) {
  const client = clone(rawClient);
  const functionsToPromisify = ['makeBucket', 'getObject', 'presignedGetObject', 'getBucketNotification', 'listBuckets', 'getPartialObject', 'presignedPutObject', 'setBucketNotification', 'bucketExists', 'fGetObject', 'removeAllBucketNotification', 'removeBucket', 'putObject', 'getBucketPolicy', 'listObjects', 'fPutObject', 'setBucketPolicy', 'listObjectsV2', 'copyObject', 'listIncompleteUploads', 'statObject', 'removeObject', 'removeIncompleteUpload'];
  functionsToPromisify.forEach(name => {
    client[name] = promisify(client[name]);
  });
  // Original would be inconvenient to use after promisify
  const originalBucketExists = client.bucketExists.bind(client);
  client.bucketExists = async function(bucket) {
    try {
      await originalBucketExists(bucket);
      return true;
    } catch (err) {
      if(err.code === 'NoSuchBucket')
        return false;
      throw err;
    }
  }
  // HACK communication to minio goes over different urls externally and internally
  const originalPresignedGetObject = client.presignedGetObject.bind(client);
  client.presignedGetObject = async (bucketName, objectName) => 
    convertToPublicUrl(await originalPresignedGetObject(bucketName, objectName),  publicPath);
  const originalPresignedPutObject = client.presignedPutObject.bind(client);
  client.presignedPutObject = async (bucketName, objectName) =>
    convertToPublicUrl(await originalPresignedPutObject(bucketName, objectName), publicPath);
  const originalPresignedPostPolicy = rawClient.presignedPostPolicy.bind(client);
  client.presignedPostPolicy = (policy) => {
    return new Promise((resolve, reject) => {
      originalPresignedPostPolicy(policy, function (err, postURL, formData) {
        if(err)
          reject(err);
        else
          resolve({
            postURL: convertToPublicUrl(postURL, publicPath),
            formData
          });
      });
    });
  }
  return client;
}

module.exports = async function (minioConfig, bucket, region, publicPath) {
  const minio = promisifyClient(new Minio(minioConfig), publicPath);
  await ensureBucketConfigued(minio, bucket, region);
  return minio;
}
