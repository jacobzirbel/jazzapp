import dotenv from 'dotenv';
import 'reflect-metadata';
import { DependencyData, JDependency } from '../interfaces';
import { JCache } from './cache';
import { JLogger } from './logger';
import { JPrompter } from './prompter';
import { JUtilities } from "./utilities";
import { DIContainer } from '../interfaces/di-container';

export class JApp {
  extendedDependencies: DependencyData[] = [];
  private baseDependencies: DependencyData[] = [];
  private requestedDependencies: Set<any> = new Set();
  private container = new DIContainer();
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

  async getDependency<T extends JDependency>(requested: any): Promise<T> {
    return this.container.getDependency<T>(requested);
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
    this.container.registerDependencies(dependencies);
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

  private configureEnv() {
    const utilities = new JUtilities();
    const envFile = utilities.searchFileUpwards('.env');

    if (!envFile) {
      console.warn('No .env file found');
    }

    console.info('Using .env file: ' + envFile)

    dotenv.config({ path: envFile });
  }
}
