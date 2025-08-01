export interface INotificationCommand {
  execute(): Promise<void>;
}
