import { BadRequestException } from '@nestjs/common'
import * as bcrypt from 'bcrypt'

export const ComparePassword = async (password, hashPassword) => {
  await bcrypt.genSalt()
  const isMatch = await bcrypt.compare(password, hashPassword)
  if (!isMatch) {
    throw new BadRequestException('Password is incorrect')
  }
  return true
}
