import 'reflect-metadata';
import { DependencyData } from './dependencies';

export class DIContainer {
  private instances = new Map<any, any>();
  private dependencies: DependencyData[] = [];

  registerDependencies(deps: DependencyData[]) {
    this.dependencies = [...this.dependencies, ...deps];
    this.dependencies = this.dependencies.reverse().filter((d, i) => this.dependencies.findIndex(dd => dd.class === d.class) === i);
  }

  async getDependency<T>(Token: any): Promise<T> {
    if (!this.instances.has(Token)) {
      const data = this.dependencies.find(d => d.class === Token);
      if (!data) {
        throw new Error(`Dependency ${Token.name} has not been registered`);
      }
      Token = data?.replaceWith || Token;

      const dependencies = Reflect.getMetadata('design:paramtypes', Token) || [];
      const instances = await Promise.all(dependencies.map((dep: any) => this.getDependency(dep)));
      const instance = new Token(...instances);
      this.instances.set(Token, instance);
      if (instance.init && typeof instance.init === 'function') {
        await instance.init(data.initArgs);
      }
    }
    return this.instances.get(Token);
  }
}
