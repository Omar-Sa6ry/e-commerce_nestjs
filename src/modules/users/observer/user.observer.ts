import { RedisService } from "src/common/redis/redis.service";
import { User } from "../entity/user.entity";
import { IUserObserver } from "../interfaces/IUserObserver.interface";


export class CacheObserver implements IUserObserver {
  constructor(private redisService: RedisService) {}

  async onUserUpdate(user: User): Promise<void> {
    await this.redisService.set(`user:${user.id}`, user);
    await this.redisService.set(`user:email:${user.email}`, user);
  }

  async onUserDelete(userId: string, email: string): Promise<void> {
    await this.redisService.del(`user:${userId}`);
    await this.redisService.del(`user:email:${email}`);
  }
}
