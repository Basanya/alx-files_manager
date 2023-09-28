const { createClient } = require('redis');
const { promisify } = require('util');

class RedisClient {
  constructor() {
    this.client = createClient().on('error', (err) => {
      console.log('Redis client not connected to the server:', err);
    });
  }

  isAlive() {
    return this.client.connected;
  }

  async get(key) {
    const get = promisify(this.client.get).bind(this.client);
    const res = await get(key);
    return res;
  }

  async set(key, value, duration) {
    const set = promisify(this.client.set).bind(this.client);
    const res = await set(key, value, 'EX', duration);
    return res;
  }

  async del(key) {
    const del = promisify(this.client.del).bind(this.client);
    await del(key);
  }
}

const redisClient = new RedisClient();
module.exports = redisClient;
