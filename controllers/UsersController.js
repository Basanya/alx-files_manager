import sha1 from 'sha1';
import { ObjectID } from 'mongodb';
import Queue from 'bull';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

const userQueue = new Queue('userQueue');

class UsersController {
  static async postNew(req, res) {
    const { email, password } = req.body;
    console.log(email);
    if (!email) return res.status(400).json({ error: 'Missing email' });
    if (!password) return res.status(400).json({ error: 'Missing password' });
    const users = dbClient.db.collection('users');
    return users.findOne({ email }, (err, user) => {
      if (user) {
        res.status(400).json({ error: 'Already exist' });
      } else {
        const hashedPassword = sha1(password);
        users.insertOne(
          {
            email,
            password: hashedPassword,
          },
        ).then((result) => {
          res.status(201).json({ id: result.insertedId, email });
          userQueue.add({ userId: result.insertedId });
        }).catch((error) => console.log(error));
      }
    });
  }

  static async getMe(req, res) {
    const token = req.header('X-token');
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const users = dbClient.db.collection('users');
    const objID = new ObjectID(userId);
    return users.findOne({ _id: objID }, (err, user) => {
      if (user) {
        res.status(200).json({ id: userId, email: user.email });
      } else {
        res.status(401).json({ error: 'Unauthorized' });
      }
    });
  }
}

module.exports = UsersController;
