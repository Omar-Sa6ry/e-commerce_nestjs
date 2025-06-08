import { SetMetadata } from '@nestjs/common'
import { Role } from '../constant/enum.constant'

export const Roles = (...roles: Role[]) => SetMetadata('roles', roles)
