/* eslint-disable no-restricted-syntax, no-await-in-loop */
const KERNEL_PACKAGES = ['config', 'logger'];

const registry = {
  packages: {},
};

const validateKernelPackages = (packages) => {
  for (const pkgId of KERNEL_PACKAGES) {
    if (packages[pkgId]) {
      if (typeof packages[pkgId] !== 'function') {
        throw new Error(`Kernel package.${pkgId} is not a function.`);
      }
    } else {
      throw new Error(`Kernel package.package.${pkgId} is required.`);
    }
  }
};

const register = async ({
  packages = {},
  packagesFilter = packageIds => packageIds.filter(packageId => !KERNEL_PACKAGES.includes(packageId)),
}) => {
  validateKernelPackages(packages);

  registry.packages.config = packages.config();
  registry.packages.logger = packages.logger();

  const { logger } = registry.packages;
  logger.info('Preparing registry...');
  logger.info('package.config is registered.');
  logger.info('package.logger is registered.');

  const packageIds = Object.keys(packages) || [];
  const regPkgIds = packagesFilter(packageIds);
  for (const regPkgId of regPkgIds) {
    if (regPkgId) {
      logger.info(`Registering packages.${regPkgId}.`);

      const pkgRegister = packages[regPkgId];
      if (pkgRegister) {
        if (typeof pkgRegister === 'function') {
          registry.packages[regPkgId] = await pkgRegister();
          logger.info(`packages.${regPkgId} is registered.`);
        } else {
          logger.warn(`Failed to register.  packages.${regPkgId} is not a function.`);
        }
      } else {
        logger.warn(`Failed to register.  packages.${regPkgId} not found.`);
      }
    }
  }

  logger.info(Object.keys(registry.packages), 'Registered packages.');
  logger.info('Registry is ready.');

  return registry;
};

module.exports = {
  registry,
  packages: registry.packages,
  register,
};
