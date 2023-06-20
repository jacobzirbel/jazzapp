import 'reflect-metadata'
import { InjectionToken, Lifecycle, container } from "tsyringe";
import { BASE_INIT_ARGS, DependencyData, JDependency } from '../interfaces';
import { JCache } from './cache';
import { JLogger } from './logger';
import { JPrompter } from './prompter';
import { JUtilities } from "./utilities";
import dotenv from 'dotenv';
import * as path from 'path';

export class JApp {
  extendedDependencies: DependencyData[] = [];
  private baseDependencies: DependencyData[] = [];
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

    this.configureEnv();
    this.registerDependencies(this.baseDependencies);
  }

  async getDependency<T extends JDependency>(requested: InjectionToken<T>): Promise<T> {
    const dependencyData = [...this.baseDependencies, ...this.extendedDependencies].find(d => d.class === requested);
    const dependency = container.resolve(requested) as T;
    if (dependency.init) {
      return dependency.init(dependencyData?.initArgs || { });
    } else {
      return dependency;
    }
  }

  async run(fn: (app: this) => Promise<boolean | undefined | void>) {
    this.logger = await this.getDependency(JLogger);
    let success: boolean = true;
    try {
      success = await fn(this) as boolean ?? true;
    } catch (error: any) {
      success = false;
      this.logger.error(error, error.message);
    }
    finally {
      await this.destroy(success);
    }
  }

  async destroy(success: boolean) {
    await this.resetDependencies();
    console.info(success ? 'Completed' : 'Failed XXXXXXXXXXXXXXXXXX');
    console.info('Instance: ' + this.logger.instance);
  }

  registerDependencies(dependencies: DependencyData[]) {
    dependencies = dependencies.reverse().filter((d, i) => dependencies.findIndex(dd => dd.class === d.class) === i);

    for (const dep of dependencies) {
      container.register(dep.class,
        { useClass: dep.replaceWith ?? dep.class },
        { lifecycle: dep.lifecycle ?? Lifecycle.Singleton }
      );
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

  configureEnv() {
    const utilities = new JUtilities();
    const envFile = utilities.searchFileUpwards('.env') || '';
    dotenv.config({ path: envFile });
  }
}
