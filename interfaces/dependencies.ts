import { Lifecycle } from "tsyringe";
import { BASE_INIT_ARGS } from "./class-args.model";

export type Dependencies = 'utilities' | 'cache' | 'logger' | 'objectHandler' | 'prompter' | 'scraper';

export class JDependency<Args extends BASE_INIT_ARGS = BASE_INIT_ARGS> implements Constructable<JDependency<Args>, Args> {
  isTesting = false;

  constructor(...args: any[]) {}

  async init(args: Args): Promise<this> {
    return this;
  }

  destroy?(): void { }
}


export interface DependencyData {
  class: any,
  initArgs?: any | BASE_INIT_ARGS,
  lifecycle?: Lifecycle,
  replaceWith?: any,
}

export interface Constructable<T, Args extends BASE_INIT_ARGS = BASE_INIT_ARGS> {
  new(...args: any[]): T;
  init?(args: Args): Promise<T>;
}