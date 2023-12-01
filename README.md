This is a base for typescript node applications. It has some common classes that I want in all my projects.

Main reason for this was to have async constructors with dependency injection.

Someday I'll write some docs but for now here's an example of basic usage:

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
