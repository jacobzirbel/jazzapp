import { PromptModule, createPromptModule } from 'inquirer';
import { singleton } from 'tsyringe';
import { JDependency } from '../interfaces';
import { AnswerValidator } from '../interfaces/answer-validator.model';

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
  async yn(q: string, defaultValue?: boolean): Promise<boolean> {
    const y = defaultValue === true ? 'Y' : 'y';
    const n = defaultValue === false ? 'N' : 'n';
    const answer = await this.ask(`${q} ${y}/${n}`);
    if (answer.toLowerCase() === 'y') {
      return true;
    } else if (answer.toLowerCase() === 'n') {
      return false;
    } else if (!answer && (defaultValue === true || defaultValue === false)) {
      return defaultValue;
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
}
