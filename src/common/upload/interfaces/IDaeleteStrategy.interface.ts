export interface IDeleteStrategy {
  delete(publicId: string): Promise<any>;
}
