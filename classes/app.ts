import awilix, { asClass, asFunction, Lifetime } from 'awilix';
import { JUtilities } from "./utilities";
import { JLogger } from './logger';
import { JObjectHandler } from '../helpers/object-handler';
import { JPrompter } from './prompter';
import { JScraper } from '../helpers/scraper';
import { JCache } from './cache';
import { JDependency } from '../interfaces';

export class JApp {
  private container: awilix.AwilixContainer;
  private baseDependencies: { [key: string]: any } = {};
  private extendedDependencies: { [key: string]: any } = {};

  logger: JLogger;

  constructor() {
    // create a container
    this.container = awilix.createContainer({
      injectionMode: awilix.InjectionMode.PROXY
    });

    this.baseDependencies = {
      utilities: asClass(JUtilities).singleton(),
      cache: asClass(JCache ).singleton(),
      logger: asClass(JLogger).singleton(),
      prompter: asClass(JPrompter).singleton(),
    }

    this.container.register(this.baseDependencies);
  }

  async getDependency<T extends JDependency>(dependency: string): Promise<T> {
    const d = await this.container.resolve(dependency) as T;
    if (d.init) {
      return d.init();
    } else {
      return d;
    }
  }

  async run(fn: (app: JApp) => Promise<boolean | void>) {
    this.logger = await this.getDependency<JLogger>('logger');

    let success: boolean = true;
    try {
      success = await fn(this) ?? true;
    } catch (error: any) {
      success = false;
      this.logger.error(error.message);
    }
    finally {
      await this.destroy(success);
    }
  }

  async destroy(success: boolean) {
    await this.resetDependencies();
    console.log(success ? 'Completed' : 'Failed');
    console.log('Instance: ' + this.logger.instance);
  }

  private async resetDependencies() {
    const dependencyStrings = [...Object.keys(this.baseDependencies), ...Object.keys(this.extendedDependencies)];
    for (const dependencyString of dependencyStrings) {
      const dependency = await this.getDependency<any>(dependencyString);
      if (dependency.destroy) {
        dependency.destroy();
      }
    }
  }
}
