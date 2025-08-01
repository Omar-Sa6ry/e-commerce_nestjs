export interface ICacheObserver {
  update(key: string): Promise<void>;
}
