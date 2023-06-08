import { existsSync, readFileSync, writeFileSync } from "fs";
import { JObjectHandler } from "../helpers/object-handler";
import { JDependency } from "../interfaces";

export class JCache implements JDependency {
  private objectHandler: JObjectHandler;
  private cacheDir: string;

  constructor() {
    this.objectHandler = new JObjectHandler();
    this.cacheDir = process.env.LOG_INFO_FILE || '.d_cache';
  }

  async cache<T>(file: string, loadIfNotExists: () => Promise<T>): Promise<T> {
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
    console.log('NOT CACHING ' + file);
    return loadIfNotExists();
  }

  destroy() { }
}
