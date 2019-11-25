# rejstry
Rejstry Framework

## Example
```javascript
const { register, registry } = require('rejstry');

const packages = {
  config: () => ({
    NODE_ENV: 'development',
  }),
  logger: () => ({
    trace: msg => console.log(msg),
    debug: msg => console.log(msg),
    info: msg => console.log(msg),
    warn: msg => console.log(msg),
    error: msg => console.error(msg),
  }),
};

(async () => {
  await register({
    packages,
  }).catch((err) => {
    const errMessage = 'Encountered an exception.  Exit with process.exit(1).';

    if (registry.packages.logger) {
      registry.packages.logger.error(err, errMessage);
    } else {
      // fallback to console.error if logger packages is not yet registered
      // eslint-disable-next-line no-console
      console.error(err, errMessage);
    }

    process.exit(1);
  });

  // Can access all the registered packages after register()
  // Even in another file, just import:
  // const { registry, package } = require('rejstry');
  registry.packages.logger.info(registry.packages.config.NODE_ENV);
})();
```