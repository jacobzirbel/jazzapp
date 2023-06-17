This is a base for typescript node applications. It has some common classes that I want in all my projects.

Basic usage:

```
class MyApp extends JApp {
  constructor() {
    super();
    this.extendedDependencies = [
      { class: MyClass },
      { class: MyDep }
    ];

    this.registerDependencies(this.extendedDependencies);
  }
}

new MyApp().run(async myApp => {
  const c = await app.getDependency(MyClass);
  c.infoClass();
  return true;
})

```
