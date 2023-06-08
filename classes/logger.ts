import { appendFileSync, existsSync, mkdirSync, writeFileSync } from "fs";
import { dirname } from "path";
import { JObjectHandler } from "../helpers/object-handler";
import { JDependency } from "../interfaces";

export class JLogger implements JDependency {
  private objectHandler: JObjectHandler;
  private infoFile = './logs/info.txt';
  private errorFile = './logs/error.txt';
  instance: string;

  constructor() {
    this.objectHandler = new JObjectHandler();
    this.instance = this.generateDatedId();

    this.infoFile = process.env.LOG_INFO_FILE || this.infoFile;
    this.errorFile = process.env.LOG_ERROR_FILE || this.errorFile;

    let dir = dirname(this.infoFile);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    if (!existsSync(this.infoFile)) {
      writeFileSync(this.infoFile, '');
    }

    dir = dirname(this.errorFile);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    if (!existsSync(this.errorFile)) {
      writeFileSync(this.errorFile, '');
    }

    if (!existsSync(`./logs/${this.instance}`)) {
      mkdirSync(`./logs/${this.instance}`);
    }

    if (!existsSync(`./.d_cache`)) {
      mkdirSync(`./.d_cache`);
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
    console.log(toConsole);
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

  destroy() { }
}
