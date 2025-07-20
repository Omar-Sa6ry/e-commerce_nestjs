import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { UserFactory } from './factory/user.factory';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { I18nService } from 'nestjs-i18n';
import { User } from './entity/user.entity';
import { UpdateUserDto } from './inputs/UpdateUser.dto';
import { RedisService } from 'src/common/redis/redis.service';
import { UploadService } from '../../common/upload/upload.service';
import { Role } from 'src/common/constant/enum.constant';
import { UserResponse } from './dto/UserResponse.dto';
import { UserProxy } from './proxy/user.proxy';
import { Transactional } from 'src/common/decerator/transactional.decerator';

@Injectable()
export class UserService {
  private proxy: UserProxy;

  constructor(
    private readonly i18n: I18nService,
    private readonly uploadService: UploadService,
    private readonly redisService: RedisService,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {
    this.proxy = new UserProxy(this.i18n, this.redisService, this.userRepo);
  }

  async findById(id: string): Promise<UserResponse> {
    return this.proxy.findById(id);
  }

  async findByEmail(email: string): Promise<UserResponse> {
    return this.proxy.findByEmail(email);
  }

  @Transactional()
  async update(
    updateUserDto: UpdateUserDto,
    id: string,
  ): Promise<UserResponse> {
    const user = (await this.proxy.findById(id)!)?.data;

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.userRepo.findOne({
        where: { email: updateUserDto.email },
      });
      if (existingUser) {
        throw new BadRequestException(await this.i18n.t('user.EMAIL_USED'));
      }
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

    await this.userRepo.save(user);

    this.redisService.update(`user:${id}`, user);
    this.redisService.update(`user:email:${user.email}`, user);

    return { data: user };
  }

  @Transactional()
  async deleteUser(id: string): Promise<UserResponse> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user)
      throw new BadRequestException(await this.i18n.t('user.EMAIL_WRONG'));

    await this.uploadService.deleteImage(user.avatar);
    await this.userRepo.remove(user);

    this.redisService.del(`user:${id}`);
    this.redisService.del(`user:email:${user.email}`);

    return { message: await this.i18n.t('user.DELETED'), data: null };
  }

  @Transactional()
  async editUserRole(email: string): Promise<UserResponse> {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user)
      throw new BadRequestException(await this.i18n.t('user.EMAIL_WRONG'));

    user.role = Role.ADMIN;
    await this.userRepo.save(user);

    this.redisService.update(`user:${user.id}`, user);
    this.redisService.update(`user:email:${email}`, user);

    return { data: user, message: await this.i18n.t('user.UPDATED') };
  }
}
