import { BadRequestException, Injectable } from '@nestjs/common';
import { UpdateUserDto } from '../inputs/UpdateUser.dto';
import { UserResponse } from '../dto/UserResponse.dto';
import { UserService } from '../users.service';
import { IUserCommand } from '../interfaces/IUserCommand.interface';
import { UserAction } from '../constant/user.constant';
import {
  DeleteUserCommand,
  EditRoleCommand,
  FindByEmailCommand,
  FindByIdCommand,
  UpdateUserCommand,
} from '../command/user.command';

@Injectable()
export class UserFacadeService {
  constructor(private readonly userService: UserService) {}

  async manageUser(
    action: UserAction,
    identifier: string | UpdateUserDto,
    id?: string,
  ): Promise<UserResponse> {
    let command: IUserCommand;

    switch (action) {
      case 'findById':
        command = new FindByIdCommand(this.userService, identifier as string);
        break;
      case 'findByEmail':
        command = new FindByEmailCommand(
          this.userService,
          identifier as string,
        );
        break;
      case 'update':
        command = new UpdateUserCommand(
          this.userService,
          identifier as UpdateUserDto,
          id!,
        );
        break;
      case 'delete':
        command = new DeleteUserCommand(this.userService, identifier as string);
        break;
      case 'editRole':
        command = new EditRoleCommand(this.userService, identifier as string);
        break;
      default:
        throw new BadRequestException('Invalid action');
    }

    return command.execute();
  }
}
