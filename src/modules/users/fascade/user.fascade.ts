import { BadRequestException, Injectable } from '@nestjs/common';
import { UpdateUserDto } from '../inputs/UpdateUser.dto';
import { UserResponse } from '../dto/UserResponse.dto';
import { UserService } from '../users.service';
import { UserAction } from '../constant/user.constant';

@Injectable()
export class UserFacadeService {
  constructor(private readonly userService: UserService) {}

  async manageUser(
    action: UserAction,
    identifier: string | UpdateUserDto,
    id?: string,
  ): Promise<UserResponse> {
    switch (action) {
      case 'findById':
        return this.userService.findById(identifier as string);
      case 'findByEmail':
        return this.userService.findByEmail(identifier as string);
      case 'update':
        return this.userService.update(identifier as UpdateUserDto, id!);
      case 'delete':
        return this.userService.deleteUser(identifier as string);
      case 'editRole':
        return this.userService.editUserRole(identifier as string);
      default:
        throw new BadRequestException('Invalid action');
    }
  }
}
