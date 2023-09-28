import dbClient from '../utils/db';
import redisClient from '../utils/redis';

class AppController {
  static getStatus(req, res) {
    const status = {
      db: dbClient.isAlive(),
      redis: redisClient.isAlive(),
    };
    return res.status(200).json(status);
  }

  static async getStats(req, res) {
    res.status(200).json({
      users: await dbClient.nbUsers(),
      files: await dbClient.nbFiles(),
    });
  }
}

module.exports = AppController;
