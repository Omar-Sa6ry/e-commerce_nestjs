import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/modules/users/entity/user.entity';
import { Role } from 'src/common/constant/enum.constant';
import { GoogleUserData } from './interface/google.interface';

@Injectable()
export class OAuthService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async validateUser(userData: GoogleUserData): Promise<User> {
    const user = await this.userRepository.findOne({
      where: [{ email: userData.email }, { googleId: userData.googleId }],
    });

    if (user) {
      if (!user.googleId) {
        await this.userRepository.update(user.id, {
          googleId: userData.googleId,
        });
      }
      return user;
    }

    return this.userRepository.save(
      this.userRepository.create({
        email: userData.email,
        googleId: userData.googleId,
        firstName: userData.firstName,
        lastName: userData.lastName,
        fullName: userData.username,
        avatar: userData.image,
        phone: null,
        password: null,
        role: Role.USER,
      }),
    );
  }
}
