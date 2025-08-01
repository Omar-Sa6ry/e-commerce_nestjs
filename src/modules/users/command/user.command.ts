import { UserResponse } from "../dto/UserResponse.dto";
import { UpdateUserDto } from "../inputs/UpdateUser.dto";
import { IUserCommand } from "../interfaces/IUserCommand.interface";
import { UserService } from "../users.service";


export class FindByIdCommand implements IUserCommand {
  constructor(
    private service: UserService,
    private id: string,
  ) {}

  async execute(): Promise<UserResponse> {
    return this.service.findById(this.id);
  }
}

export class FindByEmailCommand implements IUserCommand {
  constructor(
    private service: UserService,
    private email: string,
  ) {}

  async execute(): Promise<UserResponse> {
    return this.service.findByEmail(this.email);
  }
}

export class UpdateUserCommand implements IUserCommand {
  constructor(
    private service: UserService,
    private updateDto: UpdateUserDto,
    private id: string,
  ) {}

  async execute(): Promise<UserResponse> {
    return this.service.update(this.updateDto, this.id);
  }
}

export class DeleteUserCommand implements IUserCommand {
  constructor(
    private service: UserService,
    private id: string,
  ) {}

  async execute(): Promise<UserResponse> {
    return this.service.deleteUser(this.id);
  }
}

export class EditRoleCommand implements IUserCommand {
  constructor(
    private service: UserService,
    private email: string,
  ) {}

  async execute(): Promise<UserResponse> {
    return this.service.editUserRole(this.email);
  }
}
