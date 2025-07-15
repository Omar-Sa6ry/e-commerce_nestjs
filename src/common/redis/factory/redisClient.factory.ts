import { RedisClientType, createClient } from 'redis';
import { Logger } from '@nestjs/common';

export const createRedisClient = async (): Promise<RedisClientType> => {
  const logger = new Logger('RedisFactory');

  // Add connection timeout and better error handling
  const client = createClient({
    socket: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      connectTimeout: 5000, // 5 seconds timeout
      reconnectStrategy: (retries) => {
        logger.warn(`Redis connection attempt ${retries}`);
        if (retries > 3) {
          logger.error('Max Redis connection attempts reached');
          return new Error('Could not connect to Redis');
        }
        return 1000; // Retry every second
      },
    },
  });

  client.on('error', (err) => {
    if (err.code === 'ECONNREFUSED') {
      logger.error('Redis connection refused - is Redis running?');
    } else {
      logger.error(`Redis error: ${err.message}`);
    }
  });

  try {
    await client.connect();
    logger.log('Successfully connected to Redis');
    return client as RedisClientType;
  } catch (err) {
    logger.error('Failed to connect to Redis', err.stack);
    throw err;
  }
};
