import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';
import { UserModule } from '../users/users.module';
import { User } from '../users/entity/user.entity';
import { RedisModule } from 'src/common/redis/redis.module';
import { UploadModule } from '../../common/upload/upload.module';
import { EmailModule } from 'src/common/queues/email/email.module';
import { SendEmailService } from 'src/common/queues/email/sendemail.service';
import { JwtModule } from './jwt/jwt.module';
import { UserAddressModule } from '../userAdress/userAddress.module';
import { CartModule } from '../cart/cart.module';
import { GenerateTokenFactory } from './jwt/jwt.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    UserModule,
    RedisModule,
    UploadModule,
    EmailModule,
    JwtModule,
    CartModule,
    UserAddressModule,
  ],
  providers: [
    AuthResolver,
    AuthService,
    SendEmailService,
    GenerateTokenFactory,
  ],
})
export class AuthModule {}
