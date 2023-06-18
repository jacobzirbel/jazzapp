import { JApp } from "../classes";
import { BASE_INIT_ARGS, JDependency } from "../interfaces";


interface HasArgsArgs extends BASE_INIT_ARGS {
  arg1: string;
  arg2: number;
}

class HasArgs implements JDependency<HasArgsArgs> {
  args: HasArgsArgs;

  async init(args: HasArgsArgs) {
    this.args = args;
    return this;
  }
}

describe('JApp', () => {
  test('should run', async () => {
    const app = new JApp();
    await app.run(async (app) => {
      const hasArgs = await app.getDependency(HasArgs);
      expect(hasArgs).toBeInstanceOf(HasArgs);
      return true;
    });
  });

  test('should have args at init', async () => {
    const app = new JApp();
    app.extendedDependencies = [{ class: HasArgs, initArgs: { arg12: 'test', arg2: 1 } }];
    app.registerDependencies(app.extendedDependencies);
    const hasArgs = await app.getDependency(HasArgs);
    expect(hasArgs.args).toEqual({ arg12: 'test', arg2: 1 });
  });

  test('should allow app to be extended', async () => {
    await new MyApp().run(async (app) => {
      expect(app.hasProperty).toBe(true);
      return true;
    });
  })
});

class MyApp extends JApp {
  hasProperty = true;
}
