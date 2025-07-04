import { Module } from '@nestjs/common';
import { GoogleStrategy } from './strategies/google.strategy';
import { OAuthService } from './oauth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GenerateTokenFactory } from 'src/modules/auth/jwt/jwt.service';
import { OAuthController } from './oauth.controller';
import { PassportModule } from '@nestjs/passport';
import { User } from 'src/modules/users/entity/user.entity';

@Module({
  imports: [
    PassportModule.register({ session: false }),
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [OAuthController],
  providers: [GoogleStrategy, OAuthService, GenerateTokenFactory],
})
export class OAuthModule {}
