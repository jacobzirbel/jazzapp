import { JApp, JCache, JLogger, JUtilities } from "../classes";

new JApp().run(async (app) => {
  const cache = await app.getDependency(JCache);
  const utils = await app.getDependency(JUtilities);
  const logger = await app.getDependency(JLogger);
  utils.delay(10000000);
  logger.info('running app here');
  await utils.delay(1000)

  console.log('end japp')
  return true;
});
