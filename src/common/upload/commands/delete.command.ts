import { IDeleteStrategy } from "../interfaces/IDaeleteStrategy.interface";
import { IImageCommand } from "../interfaces/IImageCommand.interface";

export class DeleteImageCommand implements IImageCommand{
  constructor(
    private strategy: IDeleteStrategy,
    private publicId: string,
  ) {}

  async execute(): Promise<any> {
    return this.strategy.delete(this.publicId);
  }
}
