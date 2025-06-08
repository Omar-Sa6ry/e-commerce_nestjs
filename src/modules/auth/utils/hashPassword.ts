import * as bcrypt from 'bcrypt'

export const HashPassword = async (password: string) => {
  const salt = await bcrypt.genSalt()
  return await bcrypt.hash(password, salt)
}
