export interface StorageAdapter {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  readonly isDegraded?: boolean;
}

export const MOCK_STORAGE_KEY = 'nft-mocks:v1:state';

export class MemoryStorageAdapter implements StorageAdapter {
  private store = new Map<string, string>();
  readonly isDegraded = false;

  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }
}

export class LocalStorageAdapter implements StorageAdapter {
  private memoryFallback = new MemoryStorageAdapter();
  private _isDegraded = false;

  get isDegraded(): boolean {
    return this._isDegraded;
  }

  private isLocalStorageAvailable(): boolean {
    try {
      return typeof globalThis !== 'undefined' && 'localStorage' in globalThis && globalThis.localStorage !== null;
    } catch {
      return false;
    }
  }

  getItem(key: string): string | null {
    if (!this.isLocalStorageAvailable() || this._isDegraded) {
      return this.memoryFallback.getItem(key);
    }
    try {
      return globalThis.localStorage.getItem(key);
    } catch {
      this._isDegraded = true;
      return this.memoryFallback.getItem(key);
    }
  }

  setItem(key: string, value: string): void {
    if (!this.isLocalStorageAvailable() || this._isDegraded) {
      this.memoryFallback.setItem(key, value);
      return;
    }
    try {
      globalThis.localStorage.setItem(key, value);
    } catch {
      // QuotaExceededError or security restrictions
      this._isDegraded = true;
      this.memoryFallback.setItem(key, value);
    }
  }

  removeItem(key: string): void {
    if (this.isLocalStorageAvailable()) {
      try {
        globalThis.localStorage.removeItem(key);
      } catch {
        // Ignored
      }
    }
    this.memoryFallback.removeItem(key);
  }
}
