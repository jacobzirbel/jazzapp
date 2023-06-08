export type Dependencies = 'utilities' | 'cache' | 'logger' | 'objectHandler' | 'prompter' | 'scraper';

export interface JDependency {
  destroy?: () => void;
  init?: () => this;
}
