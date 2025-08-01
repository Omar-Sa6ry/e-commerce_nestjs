import { IImageCommand } from '../interfaces/IImageCommand.interface';
import { IUploadStrategy } from '../interfaces/IUpload.interface';

export class UploadImageCommand implements IImageCommand {
  constructor(
    private strategy: IUploadStrategy,
    private stream: any,
    private options: any,
  ) {}

  async execute(): Promise<any> {
    return this.strategy.upload(this.stream, this.options);
  }
}
