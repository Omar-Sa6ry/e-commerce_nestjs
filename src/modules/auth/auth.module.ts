import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';
import { GenerateToken } from './jwt/jwt.service';
import { UserModule } from '../users/users.module';
import { User } from '../users/entity/user.entity';
import { RedisModule } from 'src/common/redis/redis.module';
import { UploadModule } from '../../common/upload/upload.module';
import { EmailModule } from 'src/common/queues/email/email.module';
import { SendEmailService } from 'src/common/queues/email/sendemail.service';
import { JwtModule } from './jwt/jwt.module';
import { UserAddressModule } from '../userAdress/userAddress.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    UserModule,
    RedisModule,
    UploadModule,
    EmailModule,
    JwtModule,
    UserAddressModule,
  ],
  providers: [AuthResolver, AuthService, SendEmailService, GenerateToken],
})
export class AuthModule {}
