import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'

@Injectable()
export class GenerateToken {
  constructor (private jwtService: JwtService) {}

  async jwt (email: string, id: string): Promise<string> {
    const payload = { email, id }
    return await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET,
    })
  }
}
