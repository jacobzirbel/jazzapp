import { inject, injectable, singleton } from "tsyringe";
import { JDependency } from "../interfaces";
import { existsSync } from "fs";
import path from "path";

@singleton()
export class JUtilities implements JDependency {
  private timeouts: Array<{ timeout: NodeJS.Timeout, resolve: () => void }> = [];

  constructor() { }

  getSecret(key: string) {
    if (process.env[key]) {
      return process.env[key];
    } else {
      throw new Error(`No secret for ${key}`);
    }
  }

  delay(ms: number): Promise<void> {
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        resolve();
        this.timeouts = this.timeouts.filter((t) => t.timeout !== timeout);
      }, ms);
      this.timeouts.push({ timeout, resolve });
    });
  }

  destroy(): void {
    this.timeouts.forEach(({ timeout, resolve }) => {
      clearTimeout(timeout);
      resolve();
    });
    this.timeouts = [];
  }

  generateUUID() {
    let d = new Date().getTime();
    let d2 = ((typeof performance !== 'undefined') && performance.now && (performance.now() * 1000)) || 0;
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      let r = Math.random() * 16;
      if (d > 0) {
        r = (d + r) % 16 | 0;
        d = Math.floor(d / 16);
      } else {
        r = (d2 + r) % 16 | 0;
        d2 = Math.floor(d2 / 16);
      }
      return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
    });
  };

  searchFileUpwards(filename: string) {
    if (!filename) throw new Error('Filename is required');

    let currentDir = process.cwd();

    while (true) {
      const filePath = path.join(currentDir, filename);

      if (existsSync(filePath)) {
        return filePath;
      }

      const parentDir = path.dirname(currentDir);

      if (currentDir === parentDir) {
        return null;
      }

      currentDir = parentDir;
    }
  }
}
