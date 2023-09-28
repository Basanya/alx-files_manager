import { v4 as uuidv4 } from 'uuid';

import redisClient from '../utils/redis';
import dbClient from '../utils/db';

const sha1 = require('sha1');

class AuthController {
  static async getConnect(req, res) {
    const authHeader = req.header('Authorization');
    if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });
    const [email, password] = Buffer.from(authHeader.split(' ')[1], 'base64')
      .toString()
      .split(':');
    if (!email || !password) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const users = dbClient.db.collection('users');
    return users.findOne({ email, password: sha1(password) }, async (err, user) => {
      if (!user) return res.status(401).json({ error: 'Unauthorized' });
      const token = uuidv4();
      const key = `auth_${token}`;
      await redisClient.set(key, user._id, 86400);
      return res.status(200).json({ token });
    });
  }

  static async getDisconnect(req, res) {
    const token = req.header('X-Token');
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    await redisClient.del(`auth_${token}`);
    return res.status(204).end();
  }
}

module.exports = AuthController;
