import { PromptModule, createPromptModule } from 'inquirer';
import { singleton } from 'tsyringe';
import { JDependency } from '../interfaces';

@singleton()
export class JPrompter extends JDependency {
  private _prompt: PromptModule;
  private get prompt(): PromptModule {
    return this._prompt ??= createPromptModule();
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

  private async ask(q: string): Promise<string> {
    let res = await this.prompt([
      {
        type: 'input',
        name: 'answer',
        message: q,
      }
    ])

    return res.answer;
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

  async multi(options: string[], question: string): Promise<string> {
    const answer = await this.prompt([
      {
        type: 'list',
        name: 'choice',
        message: question,
        choices: options,
      },
    ]);
    return answer.choice;
  }

  async checkbox(options: string[], question: string): Promise<string[]> {
    const answer = await this.prompt([
      {
        type: 'checkbox',
        name: 'checkbox',
        message: question,
        choices: options,
      }
    ]);

    return answer.checkbox;
  }
}
