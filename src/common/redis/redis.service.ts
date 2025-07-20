import { Injectable, Inject, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { RedisClientType } from 'redis';
import { ListConstant, SCORE } from './constant/redis.constant';
import { IRedisInterface } from './interface/redis.interface';

@Injectable()
export class RedisService implements IRedisInterface {
  private readonly logger = new Logger(RedisService.name);

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @Inject('REDIS_CLIENT') private redisClient: RedisClientType,
  ) {}

  // =================== Core Key-Value Operations ===================

  // Set a key with value and TTL (in seconds), value is stringified if not string
  async set(key: string, value: any, ttl: number = 3600): Promise<void> {
    try {
      const stringified =
        typeof value === 'string' ? value : JSON.stringify(value);
      await this.cacheManager.set(key, stringified, ttl * 1000);
    } catch (error) {
      this.logger.error(`Error setting key ${key}`, error.stack);
      throw error;
    }
  }

  async update(key: string, value: any, ttl: number = 3600): Promise<void> {
    await this.del(key);
    this.set(key, value, ttl);
  }

  // Get a key's value and parse it if it's JSON
  async get<T = any>(key: string): Promise<T | null> {
    try {
      const value = await this.cacheManager.get<string>(key);
      if (value === undefined || value === null) return null;
      try {
        return JSON.parse(value);
      } catch {
        return value as unknown as T;
      }
    } catch (error) {
      this.logger.error(`Error getting key ${key}`, error.stack);
      throw error;
    }
  }

  // Delete a key from Redis
  async del(key: string): Promise<void> {
    try {
      await this.cacheManager.del(key);
    } catch (error) {
      this.logger.error(`Error deleting key ${key}`, error.stack);
      throw error;
    }
  }

  // Set multiple key-value pairs at once using a pipeline
  async mSet(data: Record<string, any>): Promise<void> {
    try {
      const pipeline = this.redisClient.multi();
      for (const [key, value] of Object.entries(data)) {
        pipeline.set(key, JSON.stringify(value));
      }
      await pipeline.exec();
    } catch (error) {
      this.logger.error(`Error in mSet operation`, error.stack);
      throw error;
    }
  }

  // =================== String Operations ===================

  // Atomically set a key to a new value and return its old value
  async getSet(key: string, value: any): Promise<string | null> {
    try {
      const stringValue =
        typeof value === 'string' ? value : JSON.stringify(value);
      const oldValue = await this.redisClient.getSet(key, stringValue);
      return oldValue;
    } catch (error) {
      this.logger.error(`Error in getSet for key ${key}`, error.stack);
      throw error;
    }
  }

  // Get the length of the string value stored at key
  async strlen(key: string): Promise<number> {
    try {
      return await this.redisClient.strLen(key);
    } catch (error) {
      this.logger.error(
        `Error getting string length for key ${key}`,
        error.stack,
      );
      throw error;
    }
  }

  // Append a string to an existing key's value and return new length
  async append(key: string, value: string): Promise<number> {
    try {
      return await this.redisClient.append(key, value);
    } catch (error) {
      this.logger.error(`Error appending to key ${key}`, error.stack);
      throw error;
    }
  }

  // Get a substring from value of a key (start to end indices)
  async getRange(key: string, start: number, end: number): Promise<string> {
    try {
      return await this.redisClient.getRange(key, start, end);
    } catch (error) {
      this.logger.error(`Error getting range for key ${key}`, error.stack);
      throw error;
    }
  }

  // Overwrite part of the value of a key starting at offset
  async setRange(key: string, offset: number, value: string): Promise<number> {
    try {
      return await this.redisClient.setRange(key, offset, value);
    } catch (error) {
      this.logger.error(`Error setting range for key ${key}`, error.stack);
      throw error;
    }
  }

  // Get multiple values by array of keys
  async mGet(keys: string[]): Promise<(string | null)[]> {
    try {
      return await this.redisClient.mGet(keys);
    } catch (error) {
      this.logger.error(
        `Error in mGet for keys ${keys.join(',')}`,
        error.stack,
      );
      throw error;
    }
  }

  // =================== Number Operations ===================

  // Increment value of key by 1
  async incr(key: string): Promise<number> {
    try {
      return await this.redisClient.incr(key);
    } catch (error) {
      this.logger.error(`Error incrementing key ${key}`, error.stack);
      throw error;
    }
  }

  // Increment value of key by a specific integer
  async incrBy(key: string, increment: number): Promise<number> {
    try {
      return await this.redisClient.incrBy(key, increment);
    } catch (error) {
      this.logger.error(
        `Error incrementing key ${key} by ${increment}`,
        error.stack,
      );
      throw error;
    }
  }

  // Increment value of key by a float
  async incrByFloat(key: string, increment: number): Promise<string> {
    try {
      return await this.redisClient.incrByFloat(key, increment);
    } catch (error) {
      this.logger.error(
        `Error incrementing float key ${key} by ${increment}`,
        error.stack,
      );
      throw error;
    }
  }

  // Decrement value of key by 1
  async decr(key: string): Promise<number> {
    try {
      return await this.redisClient.decr(key);
    } catch (error) {
      this.logger.error(`Error decrementing key ${key}`, error.stack);
      throw error;
    }
  }

  // Decrement value of key by a specific integer
  async decrBy(key: string, decrement: number): Promise<number> {
    try {
      return await this.redisClient.decrBy(key, decrement);
    } catch (error) {
      this.logger.error(
        `Error decrementing key ${key} by ${decrement}`,
        error.stack,
      );
      throw error;
    }
  }

  // =================== Utility Methods ===================

  // Check if a key exists in Redis
  async exists(key: string): Promise<boolean> {
    try {
      const count = await this.redisClient.exists(key);
      return count === 1;
    } catch (error) {
      this.logger.error(`Error checking existence of key ${key}`, error.stack);
      throw error;
    }
  }

  // Set expiration time (TTL) for a key in seconds
  async expire(key: string, seconds: number): Promise<boolean> {
    try {
      return await this.redisClient.expire(key, seconds);
    } catch (error) {
      this.logger.error(`Error setting expire for key ${key}`, error.stack);
      throw error;
    }
  }

  // Get remaining time to live (TTL) of a key in seconds
  async ttl(key: string): Promise<number> {
    try {
      return await this.redisClient.ttl(key);
    } catch (error) {
      this.logger.error(`Error getting TTL for key ${key}`, error.stack);
      throw error;
    }
  }

  // ===== Hash Operations =====

  async hSet(key: string, field: string, value: any): Promise<number> {
    // Sets field in hash with automatic JSON stringification
    return this.redisClient.hSet(key, field, JSON.stringify(value));
  }

  async hGet<T = any>(key: string, field: string): Promise<T | null> {
    // Gets field value from hash with JSON parsing
    const value = await this.redisClient.hGet(key, field);
    return value ? JSON.parse(value) : null;
  }

  async hGetAll(key: string): Promise<Record<string, any>> {
    // Gets all fields/values from hash with automatic JSON parsing
    const result = await this.redisClient.hGetAll(key);
    return Object.fromEntries(
      Object.entries(result).map(([k, v]) => [k, v ? JSON.parse(v) : null]),
    );
  }

  async hDel(key: string, field: string): Promise<number> {
    // Deletes field from hash
    return this.redisClient.hDel(key, field);
  }

  async hExists(key: string, field: string): Promise<boolean> {
    // Checks if field exists in hash
    return this.redisClient.hExists(key, field);
  }

  async hKeys(key: string): Promise<string[]> {
    // Gets all field names in hash
    return this.redisClient.hKeys(key);
  }

  async hVals(key: string): Promise<any[]> {
    // Gets all values in hash with JSON parsing
    const values = await this.redisClient.hVals(key);
    return values.map((v) => (v ? JSON.parse(v) : null));
  }

  async hLen(key: string): Promise<number> {
    // Gets number of fields in hash
    return this.redisClient.hLen(key);
  }

  async hIncrBy(
    key: string,
    field: string,
    increment: number,
  ): Promise<number> {
    // Increments integer field value
    return this.redisClient.hIncrBy(key, field, increment);
  }

  async hIncrByFloat(
    key: string,
    field: string,
    increment: number,
  ): Promise<number> {
    // Increments float field value
    return this.redisClient.hIncrByFloat(key, field, increment);
  }

  async hSetNX(key: string, field: string, value: any): Promise<boolean> {
    // Sets field only if it doesn't exist
    return this.redisClient.hSetNX(key, field, JSON.stringify(value));
  }

  // ===== Set Operations =====

  async sAdd(key: string, ...members: string[]): Promise<number> {
    // Adds one or more members to a set
    return this.redisClient.sAdd(key, members);
  }

  async sRem(key: string, ...members: string[]): Promise<number> {
    // Removes one or more members from a set
    return this.redisClient.sRem(key, members);
  }

  async sMembers(key: string): Promise<string[]> {
    // Gets all members of a set
    return this.redisClient.sMembers(key);
  }

  async sIsMember(key: string, member: string): Promise<boolean> {
    // Checks if member exists in set
    return this.redisClient.sIsMember(key, member);
  }

  async sCard(key: string): Promise<number> {
    // Gets the number of members in a set
    return this.redisClient.sCard(key);
  }

  async sPop(key: string, count?: number): Promise<string[]> {
    // Removes and returns random members
    return this.redisClient.sPop(key, count);
  }

  async sMove(
    source: string,
    destination: string,
    member: string,
  ): Promise<boolean> {
    // Moves member between sets
    return this.redisClient.sMove(source, destination, member);
  }

  async sDiff(...keys: string[]): Promise<string[]> {
    // Returns difference between sets
    return this.redisClient.sDiff(keys);
  }

  async sDiffStore(destination: string, ...keys: string[]): Promise<number> {
    // Stores difference of sets
    return this.redisClient.sDiffStore(destination, keys);
  }

  async sInter(...keys: string[]): Promise<string[]> {
    // Returns intersection of sets
    return this.redisClient.sInter(keys);
  }

  async sInterStore(destination: string, ...keys: string[]): Promise<string[]> {
    // Stores intersection of sets
    return this.redisClient.sInterStore(destination, keys);
  }

  async sUnion(...keys: string[]): Promise<string[]> {
    // Returns union of sets
    return this.redisClient.sUnion(keys);
  }

  async sUnionStore(destination: string, ...keys: string[]): Promise<number> {
    // Stores union of sets
    return this.redisClient.sUnionStore(destination, keys);
  }

  // ===== Sorted Set Operations =====

  async zAdd(key: string, score: number, member: string): Promise<number> {
    // Add member with score to sorted set (automatically sorted by score)
    return this.redisClient.zAdd(key, { score, value: member });
  }

  async zRange(
    key: string,
    start: number,
    stop: number,
    withScores = false,
  ): Promise<string[]> {
    // Gets range of members from sorted set
    return this.redisClient.zRange(key, start, stop, {
      BY: SCORE,
      REV: true,
      ...(withScores && { WITHSCORES: true }),
    });
  }

  async zRangeByScore(
    key: string,
    min: number,
    max: number,
    withScores = false,
  ): Promise<string[]> {
    // Get range of members by score with optional scores
    return this.redisClient.zRange(key, min, max, {
      BY: SCORE,
      ...(withScores && { WITHSCORES: true }),
    });
  }

  async zRevRange(
    key: string,
    start: number,
    stop: number,
    withScores = false,
  ): Promise<string[]> {
    // Get range in reverse order (highest scores first)
    return this.redisClient.zRange(key, start, stop, {
      REV: true,
      ...(withScores && { WITHSCORES: true }),
    });
  }

  async zCard(key: string): Promise<number> {
    // Get count of members in sorted set
    return this.redisClient.zCard(key);
  }

  async zScore(key: string, member: string): Promise<number> {
    // Get score of specific member
    return this.redisClient.zScore(key, member);
  }

  async zRank(key: string, member: string): Promise<number> {
    // Get rank (index) of member (ascending order)
    return this.redisClient.zRank(key, member);
  }

  async zRevRank(key: string, member: string): Promise<number> {
    // Get rank in reverse order (descending)
    return this.redisClient.zRevRank(key, member);
  }

  async zIncrBy(
    key: string,
    increment: number,
    member: string,
  ): Promise<number> {
    // Increment member's score by specified value
    return this.redisClient.zIncrBy(key, increment, member);
  }

  async zRem(key: string, member: string): Promise<number> {
    // Remove member from sorted set
    return this.redisClient.zRem(key, member);
  }

  async zRemRangeByRank(
    key: string,
    start: number,
    stop: number,
  ): Promise<number> {
    // Remove members by rank range
    return this.redisClient.zRemRangeByRank(key, start, stop);
  }

  async zRemRangeByScore(
    key: string,
    min: number,
    max: number,
  ): Promise<number> {
    // Remove members by score range
    return this.redisClient.zRemRangeByScore(key, min, max);
  }

  async zCount(key: string, min: number, max: number): Promise<number> {
    // Count members with scores between min and max
    return this.redisClient.zCount(key, min, max);
  }

  async zUnionStore(destKey: string, sourceKeys: string[]): Promise<number> {
    // Store union of multiple sorted sets in new key
    return this.redisClient.zUnionStore(destKey, sourceKeys);
  }

  async zInterStore(destKey: string, sourceKeys: string[]): Promise<number> {
    // Store intersection of multiple sorted sets in new key
    return this.redisClient.zInterStore(destKey, sourceKeys);
  }

  // ===== List Operations =====

  async lPush(key: string, ...values: any[]): Promise<number> {
    // Insert elements at the head of the list (left side)
    const stringValues = values.map((v) => JSON.stringify(v));
    return this.redisClient.lPush(key, stringValues);
  }

  async rPush(key: string, ...values: any[]): Promise<number> {
    // Append elements at the tail of the list (right side)
    const stringValues = values.map((v) => JSON.stringify(v));
    return this.redisClient.rPush(key, stringValues);
  }

  async lPop(key: string): Promise<number> {
    // Remove and get the first element (leftmost)
    const result = await this.redisClient.lPop(key);
    return result ? JSON.parse(result) : null;
  }

  async rPop(key: string): Promise<number> {
    // Remove and get the last element (rightmost)
    const result = await this.redisClient.rPop(key);
    return result ? JSON.parse(result) : null;
  }

  async lRange(key: string, start: number, stop: number): Promise<any[]> {
    // Get a range of elements (start to stop inclusive)
    const result = await this.redisClient.lRange(key, start, stop);
    return result.map((item) => {
      try {
        return JSON.parse(item);
      } catch {
        return item;
      }
    });
  }

  async lLen(key: string): Promise<number> {
    // Get the length of the list
    return this.redisClient.lLen(key);
  }

  async lIndex(key: string, index: number): Promise<number> {
    // Get an element by its index position
    const result = await this.redisClient.lIndex(key, index);
    return result ? JSON.parse(result) : null;
  }

  async lInsert(
    key: string,
    pivot: any,
    value: any,
    position: ListConstant,
  ): Promise<number> {
    // Insert element before or after a pivot value
    const stringPivot = JSON.stringify(pivot);
    const stringValue = JSON.stringify(value);
    return this.redisClient.lInsert(key, position, stringPivot, stringValue);
  }

  async lRem(key: string, count: number, value: any): Promise<number> {
    // Remove elements matching value (count determines how many)
    const stringValue = JSON.stringify(value);
    return this.redisClient.lRem(key, count, stringValue);
  }

  async lTrim(key: string, start: number, stop: number): Promise<string> {
    // Trim the list to only contain specified range
    return this.redisClient.lTrim(key, start, stop);
  }

  async rPopLPush(source: string, destination: string): Promise<number> {
    // Atomically move element from end of source to start of destination
    const result = await this.redisClient.rPopLPush(source, destination);
    return result ? JSON.parse(result) : null;
  }

  async lSet(key: string, index: number, value: any): Promise<string> {
    // Set the value of an element by its index
    const stringValue = JSON.stringify(value);
    return this.redisClient.lSet(key, index, stringValue);
  }

  async lPos(
    key: string,
    value: any,
    options?: { RANK?: number; COUNT?: number; MAXLEN?: number },
  ): Promise<number> {
    // Return the position of an element in the list
    const stringValue = JSON.stringify(value);
    return this.redisClient.lPos(key, stringValue, options);
  }

  // ===== HyperLogLog Operations =====

  async pfAdd(key: string, ...elements: string[]): Promise<boolean> {
    // Add elements to HyperLogLog (probabilistic counting structure)
    return this.redisClient.pfAdd(key, elements);
  }

  async pfCount(...keys: string[]): Promise<number> {
    // Estimate unique count across one or multiple HyperLogLogs
    return this.redisClient.pfCount(keys);
  }

  async pfMerge(destKey: string, ...sourceKeys: string[]): Promise<string> {
    // Merge multiple HyperLogLogs into one (union operation)
    return this.redisClient.pfMerge(destKey, sourceKeys);
  }

  async pfDebug(key: string): Promise<number> {
    // Get internal debugging information (implementation-specific)
    return this.redisClient.sendCommand(['PFDEBUG', 'ENCODING', key]);
  }

  async pfClear(key: string): Promise<number> {
    // Reset/clear HyperLogLog structure (non-standard but useful)
    return this.redisClient.del(key);
  }

  // ===== Geospatial Operations =====

  async geoAdd(
    key: string,
    longitude: number,
    latitude: number,
    member: string,
  ): Promise<number> {
    // Add geospatial item (longitude, latitude) with member name to sorted set
    return this.redisClient.geoAdd(key, { longitude, latitude, member });
  }

  async geoPos(
    key: string,
    member: string,
  ): Promise<{ longitude: string; latitude: string }[]> {
    // Get longitude/latitude coordinates of a member
    return this.redisClient.geoPos(key, member);
  }

  async geoDist(
    key: string,
    member1: string,
    member2: string,
    unit: 'm' | 'km' | 'mi' | 'ft' = 'km',
  ): Promise<number> {
    // Calculate distance between two members in specified units (meters/kilometers/miles/feet)
    return this.redisClient.geoDist(key, member1, member2, unit);
  }

  async geoHash(key: string, member: string): Promise<string[]> {
    // Get Geohash string representation of member's position
    return this.redisClient.geoHash(key, member);
  }

  async geoRemove(key: string, member: string): Promise<number> {
    // Remove geospatial member (uses standard ZREM since geodata is stored in sorted set)
    return this.redisClient.zRem(key, member);
  }

  // ===== Transaction Operations =====

  async multiExecute(commands: Array<[string, ...any[]]>): Promise<any[]> {
    // Executes multiple commands as an atomic transaction (all succeed or all fail)
    const multi = this.redisClient.multi();
    commands.forEach(([cmd, ...args]) => {
      multi[cmd.toLowerCase()](...args);
    });

    return multi.exec();
  }

  async watch(keys: string[]): Promise<string> {
    // Watch keys for conditional transaction (transaction fails if watched keys change)
    return this.redisClient.watch(keys);
  }

  async unwatch(): Promise<string> {
    // Unwatch all previously watched keys
    return this.redisClient.unwatch();
  }

  async withTransaction(
    keysToWatch: string[],
    transactionFn: (multi: ReturnType<RedisClientType['multi']>) => void,
    maxRetries = 3,
  ): Promise<any[]> {
    // Higher-level transaction helper with automatic retry on conflict
    let attempts = 0;
    while (attempts < maxRetries) {
      try {
        await this.watch(keysToWatch);

        const multi = this.redisClient.multi();
        transactionFn(multi);

        const results = await multi.exec();
        if (results === null) {
          throw new Error('Transaction conflict');
        }

        return results;
      } catch (error) {
        attempts++;
        if (attempts >= maxRetries) throw error;
      }
    }
  }

  async discard(): Promise<string> {
    // Discard all commands in a transaction
    return this.redisClient.sendCommand(['DISCARD']);
  }

  async transactionGetSet(key: string, value: any): Promise<any[]> {
    // Atomic get-and-set operation using transaction
    return this.withTransaction([key], (multi) => {
      multi.get(key);
      multi.set(key, JSON.stringify(value));
    });
  }

  // ===== Pub/Sub Operations =====

  async publish(channel: string, message: any): Promise<number> {
    // Publish message to a channel with automatic JSON serialization
    return this.redisClient.publish(channel, JSON.stringify(message));
  }

  async subscribe(
    channel: string,
    callback: (message: string, channel: string) => void,
  ): Promise<void> {
    // Subscribe to channel and handle incoming messages
    return this.redisClient.subscribe(channel, (message, channel) => {
      try {
        callback(JSON.parse(message), channel);
      } catch {
        callback(message, channel);
      }
    });
  }

  async pSubscribe(
    pattern: string,
    callback: (message: string, channel: string) => void,
  ): Promise<void> {
    // Subscribe to channels matching pattern with message handler
    return this.redisClient.pSubscribe(pattern, (message, channel) => {
      try {
        callback(JSON.parse(message), channel);
      } catch {
        callback(message, channel);
      }
    });
  }

  async unsubscribe(channel: string): Promise<void> {
    // Unsubscribe from specific channel
    return this.redisClient.unsubscribe(channel);
  }

  async pUnsubscribe(pattern: string): Promise<void> {
    // Unsubscribe from pattern-based subscription
    return this.redisClient.pUnsubscribe(pattern);
  }

  async getSubscriptions(): Promise<void> {
    // Get current subscription count and patterns
    return this.redisClient.sendCommand(['PUBSUB', 'NUMSUB']);
  }

  async getChannels(pattern?: string): Promise<void> {
    // List all active channels (optionally matching pattern)
    return pattern
      ? this.redisClient.sendCommand(['PUBSUB', 'CHANNELS', pattern])
      : this.redisClient.sendCommand(['PUBSUB', 'CHANNELS']);
  }

  async getSubCount(...channels: string[]): Promise<void> {
    // Get subscriber count for specific channels
    return this.redisClient.sendCommand(['PUBSUB', 'NUMSUB', ...channels]);
  }

  async createMessageHandler(
    handler: (parsed: any, raw: string, channel: string) => void,
  ): Promise<(rawMessage: string, channel: string) => void> {
    // Create reusable message handler with parsing logic
    return (rawMessage: string, channel: string) => {
      try {
        handler(JSON.parse(rawMessage), rawMessage, channel);
      } catch {
        handler(rawMessage, rawMessage, channel);
      }
    };
  }

  // ===== Distributed Locking =====

  async acquireLock(
    lockKey: string,
    value: string = Date.now().toString(),
    ttlMs: number = 10000,
  ): Promise<string> {
    // Acquire lock if not exists (NX) with expiration (PX) - returns 'OK' if successful
    return this.redisClient.set(lockKey, value, { NX: true, PX: ttlMs });
  }

  async releaseLock(lockKey: string, expectedValue: string): Promise<any> {
    // Release lock only if current value matches expected value (atomic operation)
    const script = `
    if redis.call("GET", KEYS[1]) == ARGV[1] then
      return redis.call("DEL", KEYS[1])
    else
      return 0
    end
  `;
    return this.redisClient.eval(script, {
      keys: [lockKey],
      arguments: [expectedValue],
    });
  }

  async extendLock(
    lockKey: string,
    value: string,
    additionalTtlMs: number,
  ): Promise<any> {
    // Extend lock duration if still owned by requester (atomic operation)
    const script = `
    if redis.call("GET", KEYS[1]) == ARGV[1] then
      return redis.call("PEXPIRE", KEYS[1], ARGV[2])
    else
      return 0
    end
  `;
    return this.redisClient.eval(script, {
      keys: [lockKey],
      arguments: [value, additionalTtlMs.toString()],
    });
  }

  async isLocked(lockKey: string): Promise<boolean> {
    // Check if lock currently exists (without acquiring it)
    return (await this.redisClient.exists(lockKey)) === 1;
  }

  async getLockValue(lockKey: string): Promise<string> {
    // Get current lock value (typically the owner identifier)
    return this.redisClient.get(lockKey);
  }

  async waitForLock(
    lockKey: string,
    value: string = Date.now().toString(),
    ttlMs: number = 10000,
    retryIntervalMs: number = 100,
    timeoutMs: number = 5000,
  ): Promise<boolean> {
    // Wait until lock becomes available (with timeout)
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      if (await this.acquireLock(lockKey, value, ttlMs)) {
        return true;
      }
      await new Promise((resolve) => setTimeout(resolve, retryIntervalMs));
    }

    return false;
  }
}
