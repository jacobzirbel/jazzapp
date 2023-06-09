import 'reflect-metadata'
import { InjectionToken, Lifecycle, container } from "tsyringe";
import { JDependency } from '../interfaces';
import { JCache } from './cache';
import { JLogger } from './logger';
import { JPrompter } from './prompter';
import { JUtilities } from "./utilities";

export class JApp {
  extendedDependencies: { class: any, lifecycle?: Lifecycle }[] = [];
  private baseDependencies: { class: any, lifecycle?: Lifecycle }[] = [];
  private requestedDependencies: Set<any> = new Set();
  private dependencyCache = new Map();

  logger: JLogger;

  constructor() {
    this.baseDependencies = [
      { class: JUtilities },
      { class: JCache },
      { class: JLogger },
      { class: JPrompter },
    ];

    this.registerDependencies(this.baseDependencies);
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
    this.logger = await this.getDependency(JLogger);
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
    console.info(success ? 'Completed' : 'Failed');
    console.info('Instance: ' + this.logger.instance);
  }

  registerDependencies(dependencies: any[]) {
    for (const dep of dependencies) {
      container.register(dep.class, { useClass: dep.class }, { lifecycle: dep.lifecycle ?? Lifecycle.Singleton });
      container.afterResolution(
        dep.class,
        (_t, result) => {
          this.requestedDependencies.add(dep.class);
        },
        { frequency: "Once" }
      );
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
