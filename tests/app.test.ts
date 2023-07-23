import { JApp } from "../classes";
import { BASE_INIT_ARGS, JDependency } from "../interfaces";
import { inject } from "tsyringe";

interface HasArgsArgs extends BASE_INIT_ARGS {
  arg1: string;
  arg2: number;
}

class HasArgs extends JDependency<HasArgsArgs> {
  name = 'HasArgs'
  args: HasArgsArgs;

  async init(args: HasArgsArgs) {
    this.args = args;
    return this;
  }
}

class CanOverwrite extends JDependency<HasArgsArgs> {
  name = 'CanOverwrite'

  destroy?: () => void;
}

class HasAsyncInit extends JDependency {
  name = 'HasAsyncInit'
  isDefined = false;
  async init(): Promise<this> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.isDefined = true;
        resolve(this);
      }, 1000);
    });
  }
}

class CanConstructDependencies extends JDependency {
  constructor(
    @inject(HasAsyncInit)
    private dep: HasAsyncInit) {
    super();
  }
}


describe('JApp', () => {
  test('should run', async () => {
    const app = new JApp();
    await app.run(async (app) => {
      const hasArgs = await app.getDependency(HasArgs);
      expect(hasArgs).toBeDefined();
      expect(hasArgs).toBeInstanceOf(HasArgs);
      return true;
    });
  });

  test('should have args at init', async () => {
    const app = new JApp();
    app.extendedDependencies = [{ class: HasArgs, initArgs: { arg12: 'test', arg2: 1 } }];
    app.registerDependencies(app.extendedDependencies);
    const hasArgs = await app.getDependency(HasArgs);
    expect((hasArgs as any).args).toEqual({ arg12: 'test', arg2: 1 });
  });

  test('should overwrite with replacements', async () => {
    const app = new JApp();
    app.extendedDependencies = [
      { class: HasArgs, initArgs: { arg12: 'test', arg2: 1 } },
      { class: HasArgs, initArgs: { arg12: 'test', arg2: 1 }, replaceWith: CanOverwrite }
    ];
    app.registerDependencies(app.extendedDependencies);
    const hasArgs = await app.getDependency(HasArgs);
    expect(hasArgs).toBeInstanceOf(CanOverwrite);
  })

  test('should allow app to be extended', async () => {
    class MyApp extends JApp {
      hasProperty = true;
    }

    await new MyApp().run(async (app) => {
      expect(app.hasProperty).toBe(true);
      return true;
    });
  });

  test('should have async init', async () => {
    const app = new JApp();
    app.extendedDependencies = [{ class: HasAsyncInit }, { class: CanConstructDependencies }];
    app.registerDependencies(app.extendedDependencies);
    const hasAsyncInit = await app.getDependency(CanConstructDependencies);
    expect(hasAsyncInit).toBeInstanceOf(CanConstructDependencies);
    expect((hasAsyncInit as any).dep).toBeInstanceOf(HasAsyncInit);
    expect((hasAsyncInit as any).dep.isDefined).toBeTruthy();
  });
});
