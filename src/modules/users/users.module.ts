import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { UserService } from './users.service';
import { UserResolver } from './users.resolver';
import { RedisModule } from 'src/common/redis/redis.module';
import { UploadService } from '../../common/upload/upload.service';
import { EmailModule } from 'src/common/queues/email/email.module';
import { AddressModule } from '../address/address.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    EmailModule,
    RedisModule,
    forwardRef(() => AddressModule),
  ],
  providers: [UserService, UserResolver, UploadService],
  exports: [UserService, TypeOrmModule],
})
export class UserModule {}
