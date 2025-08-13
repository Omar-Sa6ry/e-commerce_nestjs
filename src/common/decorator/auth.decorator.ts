import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common'
import { RoleGuard } from '../guard/role.guard'
import { Role } from '../constant/enum.constant'

export function Auth (roles: Role[] = [], permissions: string[] = []) {
  return applyDecorators(
    SetMetadata('roles', roles),
    SetMetadata('permissions', permissions),
    UseGuards(RoleGuard),
  )
}
