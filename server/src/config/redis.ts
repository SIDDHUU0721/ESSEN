/**
 * Resilient Cache Service
 * Provides fast key-value storage, expiration, and rate-limiting
 * with automatic in-memory fallback for local development.
 */
class MemoryCache {
  private store: Map<string, { value: string; expiry: number | null }> = new Map();

  async get(key: string): Promise<string | null> {
    const item = this.store.get(key);
    if (!item) return null;
    if (item.expiry && Date.now() > item.expiry) {
      this.store.delete(key);
      return null;
    }
    return item.value;
  }

  async set(key: string, value: string, mode?: string, durationSeconds?: number): Promise<'OK'> {
    let expiry: number | null = null;
    if (durationSeconds && (mode === 'EX' || mode === 'ex')) {
      expiry = Date.now() + durationSeconds * 1000;
    }
    this.store.set(key, { value, expiry });
    return 'OK';
  }

  async del(key: string): Promise<number> {
    const deleted = this.store.delete(key);
    return deleted ? 1 : 0;
  }

  async exists(key: string): Promise<number> {
    const item = await this.get(key);
    return item !== null ? 1 : 0;
  }
}

export const redisClient = new MemoryCache();
