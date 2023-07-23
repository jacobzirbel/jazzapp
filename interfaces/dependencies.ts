
import { BASE_INIT_ARGS } from "./class-args.model";

export type Dependencies = 'utilities' | 'cache' | 'logger' | 'objectHandler' | 'prompter' | 'scraper';

export class JDependency<Args extends BASE_INIT_ARGS = BASE_INIT_ARGS> {
  isTesting = false;

  async init(args: Args): Promise<this> {
    return this;
  }

  destroy?(): void { }
}


export interface DependencyData {
  class: any,
  initArgs?: any | BASE_INIT_ARGS,
  replaceWith?: any,
}
