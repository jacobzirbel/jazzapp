import 'reflect-metadata'
import { InjectionToken, container } from "tsyringe";
import { JDependency } from '../interfaces';
import { JCache } from './cache';
import { JLogger } from './logger';
import { JPrompter } from './prompter';
import { JUtilities } from "./utilities";

export class JApp {
  extendedDependencies: any[] = [];
  private baseDependencies: any[] = [];
  private requestedDependencies: Set<any> = new Set();
  private dependencyCache = new Map();

  logger: JLogger;

  constructor() {
    this.baseDependencies = [
      JUtilities,
      JCache,
      JLogger,
      JPrompter,
    ];

    this.registerDependencies(this.baseDependencies);
    this.logger = container.resolve(JLogger);
  }

  async getDependency<T extends JDependency>(dependency: InjectionToken<T>): Promise<T> {
    const d = container.resolve(dependency) as T;
    if (d.init) {
      return d.init();
    } else {
      return d;
    }
  }

  async run(fn: (app: JApp) => Promise<boolean | undefined>) {
    // this.logger = container.resolve(JLogger);

    let success: boolean = true;
    try {
      success = await fn(this) ?? true;
    } catch (error: any) {
      success = false;
      // this.logger.error(error.message);
    }
    finally {
      await this.destroy(success);
    }
  }

  async destroy(success: boolean) {
    await this.resetDependencies();
    console.info(success ? 'Completed' : 'Failed');
    console.info('Instance: ' + this.logger.instance);
  }

  registerDependencies(dependencies: any[]) {
    for (const dependency of dependencies) {
      // register singleton with factory
      container.register(dependency, {
        useFactory: () => {
          this.requestedDependencies.add(dependency);
          const cachedInstance = this.dependencyCache.get(dependency);
          if (cachedInstance) {
            return cachedInstance;
          }

          const newDependency = new dependency();
          this.dependencyCache.set(dependency, newDependency);
          return newDependency;
        }
      });
    }
  }

  private async resetDependencies() {
    const dependencies = [...this.requestedDependencies];
    for (const dependency of dependencies) {
      const dep = await this.getDependency<typeof dependency>(dependency);
      if (dep.destroy) {
        dep.destroy();
      }
    }
  }
}
