import 'reflect-metadata';
import { BASE_INIT_ARGS } from './interfaces/class-args.model';

export interface Constructable<T, Args extends BASE_INIT_ARGS = BASE_INIT_ARGS> {
    new(...args: any[]): T;
    init?(args: Args): Promise<T>;
  }

class DIContainer {
    private instances: Map<Constructable<any>, any> = new Map();

    async getDependency<T extends Constructable<T>>(Token: Constructable<T>): Promise<T> {
        if (!this.instances.has(Token)) {
            // Get the dependencies of the Token.
            const dependencies = Reflect.getMetadata('design:paramtypes', Token) || [];
            // Resolve all dependencies recursively.
            const instances = await Promise.all(dependencies.map((dep: Constructable<any>) => this.getDependency(dep)));
            // Create a new instance of the Token.
            const instance = new Token(...instances);
            // Add the instance to the container.
            this.instances.set(Token, instance);
            // Run async initialization if it exists.
            if (typeof instance.init === 'function') {
                await instance.init(null as any);
            }
        }
        return this.instances.get(Token);
    }
}

export const container = new DIContainer();
