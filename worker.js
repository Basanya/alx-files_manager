const Queue = require('bull');
const imageThumbnail = require('image-thumbnail');
const { ObjectID } = require('mongodb');
const fs = require('fs');
const dbClient = require('./utils/db');

const fileQueue = new Queue('file processing');
const userQueue = new Queue('userQueue');

fileQueue.process(async (job) => {
  const { fileId, userId } = job.data;
  if (!fileId) throw new Error('Missing fileId');
  if (!userId) throw new Error('Missing userId');
  const files = dbClient.db.collection('files');
  const file = await files.findOne({ _id: new ObjectID(fileId), userId: new ObjectID(userId) });
  if (!file) throw new Error('File not found');
  const options = { responseType: 'base64', width: 500 };
  const thumbnail500 = await imageThumbnail(file.localPath, options);
  fs.writeFileSync(`${file.localPath}_500`, thumbnail500, 'base64');
  options.width = 250;
  const thumbnail250 = await imageThumbnail(file.localPath, options);
  fs.writeFileSync(`${file.localPath}_250`, thumbnail250, 'base64');
  options.width = 100;
  const thumbnail100 = await imageThumbnail(file.localPath, options);
  fs.writeFileSync(`${file.localPath}_100`, thumbnail100, 'base64');
});

userQueue.process(async (job, done) => {
  const { userId } = job.data;
  if (!userId) done(new Error('Missing userId'));
  const users = dbClient.db.collection('users');
  const idObject = new ObjectID(userId);
  const user = await users.findOne({ _id: idObject });
  if (user) {
    console.log(`Welcome ${user.email}!`);
  } else {
    done(new Error('User not found'));
  }
});
