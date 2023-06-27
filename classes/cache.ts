import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { singleton } from "tsyringe";
import { JDependency } from "../interfaces";
import { JLogger } from "./logger";
import { JObjectHandler } from "./object-handler";

@singleton()
export class JCache extends JDependency {
  private objectHandler: JObjectHandler;
  private cacheDir: string;
  private filePromiseCache: { [key: string]: Promise<unknown> } = {};
  private memoryPromiseCache: { [key: string]: Promise<unknown> } = {};

  constructor(
    private logger: JLogger,
  ) {
    super();
    this.objectHandler = new JObjectHandler();
    this.cacheDir = process.env.CACHE_DIR || '.d_cache';

    if (!existsSync(this.cacheDir)) {
      mkdirSync(this.cacheDir);
    }
  }

  async cacheFile<T>(file: string, loadIfNotExists: () => Promise<T>): Promise<T> {
    const path = `${this.cacheDir}/${file}.json`;

    if (this.filePromiseCache[path]) {
      return this.filePromiseCache[path] as Promise<T>;
    }

    let filePromise: Promise<T>;

    if (existsSync(path)) {
      filePromise = Promise.resolve(this.objectHandler.parse(readFileSync(path, 'utf-8'))) as Promise<T>;
    } else {
      filePromise = loadIfNotExists().then(s => {
        writeFileSync(path, this.objectHandler.stringify(s), 'utf-8');
        return s;
      });
    }

    return this.filePromiseCache[path] = filePromise;
  }

  async cacheMemory<T>(key: string, loadIfNotExists: () => Promise<T>): Promise<T> {
    return (this.memoryPromiseCache[key] ??= loadIfNotExists()) as Promise<T>;
  }

  async cacheFake<T>(file: string, loadIfNotExists: () => Promise<T>): Promise<T> {
    console.warn('NOT CACHING ' + file);
    return loadIfNotExists();
  }

  destroy() { }
}
