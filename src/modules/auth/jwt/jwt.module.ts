import { Module } from '@nestjs/common'
import { JwtModule as jwtmodule, JwtService } from '@nestjs/jwt'

@Module({
  imports: [
    jwtmodule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'huigyufutftydty',
      signOptions: { expiresIn: process.env.JWT_EXPIRE },
    }),
  ],
  providers: [JwtService],
})
export class JwtModule {}
