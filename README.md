This is a base for typescript node applications. It has some common classes that I want in all my projects.

Basic usage:

```
class MyApp extends JApp {
  constructor() {
    super();
    this.extendedDependencies = {
      myService: asClass(MyService).singleton()
    }

    this.container.register(this.extendedDependencies);
  }
}

new MyApp().run(async myApp => {
  const logger = myApp.getDependency('logger');
  const myService = myApp.getDependency('myService');

  myService.doStuff();
});
```
