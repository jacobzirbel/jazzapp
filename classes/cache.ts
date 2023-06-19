import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { singleton } from "tsyringe";
import { JDependency } from "../interfaces";
import { JLogger } from "./logger";
import { JObjectHandler } from "./object-handler";

@singleton()
export class JCache extends JDependency {
  private objectHandler: JObjectHandler;
  private cacheDir: string;

  constructor(
    private logger: JLogger,
  ) {
    super();
    this.objectHandler = new JObjectHandler();
    this.cacheDir = process.env.LOG_INFO_FILE || '.d_cache';

    if (!existsSync(this.cacheDir)) {
      mkdirSync(this.cacheDir);
    }
  }

  async cacheFile<T>(file: string, loadIfNotExists: () => Promise<T>): Promise<T> {
    const filePath = `${this.cacheDir}/${file}.json`;
    if (existsSync(filePath)) {
      return this.objectHandler.parse(readFileSync(filePath, 'utf-8'));
    } else {
      const s = await loadIfNotExists();
      writeFileSync(filePath, this.objectHandler.stringify(s), 'utf-8');
      return s;
    }
  }

  async cacheFake<T>(file: string, loadIfNotExists: () => Promise<T>): Promise<T> {
    console.warn('NOT CACHING ' + file);
    return loadIfNotExists();
  }

  destroy() { }
}
