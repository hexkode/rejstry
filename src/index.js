/* eslint-disable no-restricted-syntax, no-await-in-loop */
const fs = require('fs');

const KERNEL_PACKAGES = ['config', 'logger'];

const registry = {
  packages: {},
};

const register = async ({
  packages,
  packagesFilter,
}) => {
  if (typeof packages.config !== 'function') throw new Error('Kernel package config is required.');
  if (typeof packages.logger !== 'function') throw new Error('Kernel package logger is required.');

  registry.packages.config = packages.config();
  registry.packages.logger = packages.logger();
  const { logger } = registry.packages;

  logger.info('Preparing registry...');
  logger.info('config is registered.');
  logger.info('logger is registered.');

  const packageIds = Object.keys(packages) || [];
  const pkgIds = packagesFilter
    ? packagesFilter(packageIds)
    : packageIds.filter(packageId => !KERNEL_PACKAGES.includes(packageId));
  for (const pkgId of pkgIds) {
    if (pkgId) {
      logger.info(`Registering packages.${pkgId}.`);

      const pkgRegister = (packages && packages[pkgId]) || undefined;
      if (pkgRegister) {
        if (typeof pkgRegister === 'function') {
          registry.packages[pkgId] = await pkgRegister();
          registry.packages[pkgId].id = pkgId;
          logger.info(`packages.${pkgId} is registered.`);
        } else {
          logger.warn(`Failed to register.  packages.${pkgId} is not a function.`);
        }
      } else {
        logger.warn(`Failed to register.  packages.${pkgId} not found.`);
      }
    }
  }

  logger.info(Object.keys(registry.packages), 'Packages registered.  Registry is ready.');
  return registry;
};

/* eslint-disable global-require, import/no-dynamic-require, no-shadow */
const loader = dirname => fs.readdirSync(dirname)
  .filter(dir => dir !== dirname)
  .reduce((packages, packageDir) => ({
    ...packages,
    // packageId is set to package dir
    [packageDir]: require(`./${packageDir}`),
  }), {});

module.exports = {
  register,
  registry,
  loader,
  packages: registry.packages,
};
