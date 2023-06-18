import { Lifecycle } from "tsyringe";
import { BASE_INIT_ARGS } from "./class-args.model";

export type Dependencies = 'utilities' | 'cache' | 'logger' | 'objectHandler' | 'prompter' | 'scraper';

export interface JDependency<Args = BASE_INIT_ARGS> {
  destroy?: () => void;
  init?: (args: Args) => Promise<this>;
}

export interface DependencyData {
  class: any,
  initArgs?: any | BASE_INIT_ARGS,
  lifecycle?: Lifecycle,
  replaceWith?: any,
}
