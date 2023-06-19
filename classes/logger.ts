import { appendFileSync, existsSync, lstatSync, mkdirSync, readdirSync, rmdirSync, writeFileSync } from "fs";
import path from "path";
import { singleton } from "tsyringe";
import { JDependency } from "../interfaces";
import { JObjectHandler } from "./object-handler";

@singleton()
export class JLogger extends JDependency {
  private objectHandler: JObjectHandler;
  private logDir = './logs'
  private infoFile = 'info.txt';
  private errorFile = 'error.txt';
  instance: string;

  constructor() {
    super();
    this.objectHandler = new JObjectHandler();
    this.instance = this.generateDatedId();

    this.logDir = process.env.LOG_DIR || this.logDir;
    this.infoFile = this.logDir + '/' + (process.env.LOG_INFO_FILE || this.infoFile);
    this.errorFile = this.logDir + '/' + (process.env.LOG_ERROR_FILE || this.errorFile);

    if (!existsSync(this.logDir)) {
      mkdirSync(this.logDir, { recursive: true });
    }

    if (!existsSync(this.infoFile)) {
      writeFileSync(this.infoFile, '');
    }

    if (!existsSync(this.logDir)) {
      mkdirSync(this.logDir, { recursive: true });
    }

    if (!existsSync(this.errorFile)) {
      writeFileSync(this.errorFile, '');
    }

    if (!existsSync(`${this.logDir}/${this.instance}`)) {
      mkdirSync(`${this.logDir}/${this.instance}`);
    }
  }

  error(toFile: string, toConsole?: string) {
    if (!toConsole && toConsole !== "") toConsole = toFile;
    appendFileSync(this.errorFile, `${toFile} :: ${new Date().toISOString()}\n\n`);
    console.error(toConsole);
  }

  info(toFile: string, toConsole?: string) {
    if (!toConsole && toConsole !== "") toConsole = toFile;
    appendFileSync(this.infoFile, `${toFile}-${new Date().toISOString()}\n`);
    console.info(toConsole);
  }

  write(file: string, str: string): string {
    const filePath = `./logs/${this.instance}/${file}-${this.instance}-${Math.random()}-${new Date().toISOString()}`;
    writeFileSync(filePath, str || '', 'utf-8');
    return file;
  }

  writeJson<T>(file: string, obj: T): string {
    return this.write(file, this.objectHandler.stringify(obj));
  }

  generateDatedId() {
    return new Date().toISOString() + '_' + Math.random().toString().slice(3, 7);
  }

  destroy() {
    if (existsSync(this.logDir) && lstatSync(this.logDir).isDirectory()) {
      // Get all items in the directory
      const items = readdirSync(this.logDir);

      for (const item of items) {
        const fullPath = path.join(this.logDir, item);

        // If the item is a directory and is empty, delete it
        if (lstatSync(fullPath).isDirectory() && readdirSync(fullPath).length === 0) {
          rmdirSync(fullPath);
        }
      }
    } else {
      console.info(`${this.logDir} is not a directory or does not exist.`);
    }
  }

}
