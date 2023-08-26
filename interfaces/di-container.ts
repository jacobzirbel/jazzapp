import 'reflect-metadata';
import { DependencyData } from './dependencies';

export class DIContainer {
  private instances = new Map<any, any>();
  private dependencies: DependencyData[] = [];
  private requestedDependencies: Set<any> = new Set();
  private initializingDependencies: Set<any> = new Set();

  registerDependencies(deps: DependencyData[]) {
    this.dependencies = [...this.dependencies, ...deps];
    this.dependencies = this.dependencies.reverse().filter((d, i) => this.dependencies.findIndex(dd => dd.class === d.class) === i);
  }

  async getDependency<T>(TT: T): Promise<T> {
    let Token = TT as any;

    if (this.initializingDependencies.has(Token)) {
      throw new Error(`Jazzapp: Circular dependency detected for ${Token.name}`);
    }

    const data = this.dependencies.find(d => d.class === Token);

    if (!data) {
      throw new Error(`Jazzapp: Dependency ${Token.name} has not been registered`);
    }

    Token = data?.replaceWith || Token;

    if (data.lifetime === 'singleton' && this.instances.has(Token)) {
      return this.instances.get(Token);
    }

    this.initializingDependencies.add(Token);

    const dependencies = Reflect.getMetadata('design:paramtypes', Token) || [];
    const instances = await Promise.all(dependencies.map((dep: any) => this.getDependency(dep)));
    const instance = new Token(...instances);

    this.initializingDependencies.delete(Token);

    if (data.lifetime === 'singleton') {
      this.instances.set(Token, instance);
    }

    if (instance.init && typeof instance.init === 'function') {
      await instance.init(data.initArgs);
    }

    return instance;
  }

  async destroy() {
    const dependencies = [...this.requestedDependencies];
    for (const dependency of dependencies) {
      const dep = await this.getDependency<typeof dependency>(dependency);
      if (dep.destroy && typeof dep.destroy === 'function') {
        dep.destroy();
      }
    }
    this.instances.clear();
    this.requestedDependencies.clear();
  }
}
