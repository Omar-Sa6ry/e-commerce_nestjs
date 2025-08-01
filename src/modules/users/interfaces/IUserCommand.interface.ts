import { UserResponse } from "../dto/UserResponse.dto";

export interface IUserCommand {
  execute(): Promise<UserResponse>;
}
