import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ColorService } from './color.service';
import { ColorResolver } from './color.resolver';
import { Color } from './entity/color.entity';
import { UserModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Color]), UserModule],
  providers: [ColorResolver, ColorService],
  exports: [ColorService],
})
export class ColorModule {}
