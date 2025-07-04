import { Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { OAuthService } from './oauth.service';
import { GenerateTokenFactory } from 'src/modules/auth/jwt/jwt.service';
import { plainToInstance } from 'class-transformer';
import { AuthResponse } from 'src/modules/auth/dto/AuthRes.dto';

@Controller('api/auth')
export class OAuthController {
  constructor(
    private readonly oauthService: OAuthService,
    private readonly tokenFactory: GenerateTokenFactory,
  ) {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req: any) {
    const user = await this.oauthService.validateUser(req.user);

    const tokenService = await this.tokenFactory.createTokenGenerator();
    const token = await tokenService.generate(user.email, user.id);

    const response = plainToInstance(AuthResponse, {
      statusCode: 201,
      success: true,
      message: 'Google authentication successful',
      timeStamp: new Date().toISOString().split('T')[0],
      data: {
        user,
        token,
      },
    });

    // res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}`);
    return response;
  }
}
