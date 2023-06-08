import * as readline from 'readline';
import { JDependency } from '../interfaces';

export class JPrompter implements JDependency {
  reader: readline.Interface;

  constructor() {
    this.reader = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    return this;
  }

  async destroy(): Promise<void> {
    this.reader.close();
  }

  ask(q: string): Promise<string> {
    return new Promise(r => {
      this.reader.question(q + ' ', (answer: string) => {
        r(answer);
      });
    });
  }
}
