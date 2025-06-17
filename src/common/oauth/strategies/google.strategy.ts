import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-google-oauth20';
import { GoogleUserData } from '../interface/google.interface';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
  ): Promise<GoogleUserData> {
    const { id, displayName, emails, photos, name } = profile;
    return {
      googleId: id,
      email: emails?.[0]?.value,
      username: displayName,
      image: photos?.[0]?.value,
      firstName: name?.givenName || displayName.split(' ')[0],
      lastName: name?.familyName || displayName.split(' ').slice(1).join(' '),
    };
  }
}
