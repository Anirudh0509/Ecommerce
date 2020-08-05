import Redis from 'ioredis';

/** CACHING WITH REDIS */
export const redis = new Redis(6379, '127.0.0.1');
redis.on('error', (e) => console.log(e));
