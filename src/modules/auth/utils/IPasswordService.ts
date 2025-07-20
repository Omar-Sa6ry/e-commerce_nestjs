import { Injectable } from '@nestjs/common';
import { IPasswordService } from '../interfaces/IPassword.interface';
import { BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class PasswordServiceAdapter implements IPasswordService {
  async hash(password: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    return await bcrypt.hash(password, salt);
  }

  async compare(password: string, hashPassword: string): Promise<boolean> {
    await bcrypt.genSalt();
    const isMatch = await bcrypt.compare(password, hashPassword);

    if (!isMatch) throw new BadRequestException('Password is incorrect');

    return true;
  }
}
