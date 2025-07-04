import { UserFactory } from './factory/user.factory';
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { I18nService } from 'nestjs-i18n';
import { User } from './entity/user.entity';
import { UpdateUserDto } from './inputs/UpdateUser.dto';
import { RedisService } from 'src/common/redis/redis.service';
import { UploadService } from '../../common/upload/upload.service';
import { Role } from 'src/common/constant/enum.constant';
import { UserResponse } from './dto/UserResponse.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly i18n: I18nService,
    private readonly uploadService: UploadService,
    private readonly redisService: RedisService,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private readonly dataSource: DataSource,
  ) {}

  async findById(id: string): Promise<UserResponse> {
    const cachedUser = await this.redisService.get(`user:${id}`);
    if (cachedUser instanceof User) return { data: cachedUser };

    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException(await this.i18n.t('user.NOT_FOUND'));

    const userCacheKey = `user:${user.id}`;
    this.redisService.set(userCacheKey, user);

    return { data: user };
  }

  async findByEmail(email: string): Promise<UserResponse> {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) throw new NotFoundException(await this.i18n.t('user.NOT_FOUND'));

    this.redisService.set(`user:${user.id}`, user);

    return { data: user };
  }

  async update(
    updateUserDto: UpdateUserDto,
    id: string,
  ): Promise<UserResponse> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await queryRunner.manager.findOne(User, { where: { id } });
      if (!user)
        throw new NotFoundException(await this.i18n.t('user.NOT_FOUND'));

      if (updateUserDto.email && updateUserDto.email !== user.email) {
        const existingUser = await this.userRepo.findOne({
          where: { email: updateUserDto.email },
        });
        if (existingUser)
          throw new BadRequestException(await this.i18n.t('user.EMAIL_USED'));
      }

      if (updateUserDto.avatar) {
        const oldPath = user.avatar;
        const filename = await this.uploadService.uploadImage(
          updateUserDto.avatar,
        );
        if (typeof filename === 'string') {
          await this.uploadService.deleteImage(oldPath);
          UserFactory.update(user, updateUserDto, filename);
        } else {
          UserFactory.update(user, updateUserDto);
        }
      } else {
        UserFactory.update(user, updateUserDto);
      }

      await queryRunner.manager.save(user);
      this.redisService.set(`user:${user.id}`, user);

      await queryRunner.commitTransaction();

      return { data: user };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async deleteUser(id: string): Promise<UserResponse> {
    const result = await this.userRepo.findOne({ where: { id } });
    if (!result)
      throw new BadRequestException(await this.i18n.t('user.EMAIL_WRONG'));

    await this.uploadService.deleteImage(result.avatar);
    await this.userRepo.remove(result);
    this.redisService.del(`user:${id}`);

    return { message: await this.i18n.t('user.DELETED'), data: null };
  }

  async editUserRole(email: string): Promise<UserResponse> {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user)
      throw new BadRequestException(await this.i18n.t('user.EMAIL_WRONG'));

    user.role = Role.ADMIN;
    await this.userRepo.save(user);

    this.redisService.set(`user:${user.id}`, user);

    return { data: user, message: await this.i18n.t('user.UPDATED') };
  }
}
