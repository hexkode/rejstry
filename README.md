# Rejstry Framework
Opinionated Nodejs framework with the assumption that every component is a package.

## Example
```javascript
const { register, registry } = require('rejstry');
const pino = require('pino');
const express = require('express');

const packages = {
  // config and logger are kernel packages that are required.
  config: () => ({
    NODE_ENV: process.env.NODE_ENV,
    SERVER_A_PORT: 3000,
    SERVER_B_PORT: 4000,
    SERVER_C_PORT: 5000,
  }),
  logger: () => pino(),
  // example packages
  serverA: () => {
    const app = express();
    app.get('/', (req, res) => res.send(`serverA@${registry.packages.config.SERVER_A_PORT}`));
    app.set('title', 'serverA');
    app.listen(registry.packages.config.SERVER_A_PORT);
    return app;
  },
  serverB: () => {
    const app = express();
    app.get('/', (req, res) => res.send(`serverB@${registry.packages.config.SERVER_B_PORT}`));
    app.set('title', 'serverB');
    app.listen(registry.packages.config.SERVER_B_PORT);
    return app;
  },
  serverC: () => {
    const app = express();
    app.get('/', (req, res) => res.send(`serverC@${registry.packages.config.SERVER_C_PORT}`));
    app.set('title', 'serverC');
    app.listen(registry.packages.config.SERVER_C_PORT);
    return app;
  },
};

(async () => {
  await register({
    packages,
    // filter a list of packagesIds to register in order
    packagesFilter: packagesIds => [
      'serverC',
      // 'serverB',
      'serverA',
    ],
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

  // After register(), all the registered packages are
  // accessible by including the following in any file:
  // const { registry, packages } = require('rejstry');
  registry.packages.logger.info(registry.packages.config);
  registry.packages.logger.info(registry.packages.serverA.get('title'));
  registry.packages.logger.info(registry.packages.serverC.get('title'));
})();
```