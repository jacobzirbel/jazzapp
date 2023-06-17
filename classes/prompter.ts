import * as readline from 'readline';
import { JDependency } from '../interfaces';
import { injectable, singleton } from 'tsyringe';
import { AnswerValidator } from '../interfaces/answer-validator.model';

@singleton()
export class JPrompter implements JDependency {
  reader: readline.Interface;

  constructor() {
    this.reader = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  async destroy(): Promise<void> {
    this.reader.close();
  }

  async question<T>(q: string, validate: (ans: string) => T | null): Promise<T>;

  async question(q: string): Promise<string>;

  async question<T = string>(q: string, validate?: (ans: string) => T | null): Promise<T | string> {
    if (!validate) {
      const answer = await this.ask(q);
      return answer;
    } else {
      const answer = validate(await this.ask(q));
      return answer ?? await this.question(q, validate);
    }
  }

  private ask(q: string): Promise<string> {
    return new Promise(r => {
      this.reader.question(q + ' ', (answer: string) => {
        r(answer);
      });
    });
  }

  async yn(q: string, def?: boolean): Promise<boolean> {
    const y = def === true ? 'Y' : 'y';
    const n = def === false ? 'N' : 'n';
    const answer = await this.ask(`${q} ${y}/${n}`);
    if (answer.toLowerCase() === 'y') {
      return true;
    } else if (answer.toLowerCase() === 'n') {
      return false;
    } else if (!answer && (def === true || def === false)) {
      return def;
    } else {
      return this.yn(q);
    }
  }
}
