const semver = require('semver');
const chalk = require('chalk');
const execa = require('execa');

/**
 * Check the installed packages and report on any that are deprecated.
 *
 * @returns {Promise<Object>} A Promise that resolves to an object with two properties:
 *    - packages: an array of package names that are deprecated.
 *    - error: an error object if the check failed, or null if it succeeded.
 *    Date: 2022, 17 Feb
 */


async function checkDeprecatedPackages() {
  try {

    const { stdout } = await execa('npm', ['ls', '--json', '--depth=0'], {
      shell: true
    });

    const installedPackages = JSON.parse(stdout).dependencies;

    const deprecatedPackages = Object.entries(installedPackages)
      .filter(([packageName, packageData]) => {
        const isDeprecated = semver.valid(packageData.deprecated);
        return isDeprecated;
      })
      .map(([packageName, packageData]) => packageName);

    if (deprecatedPackages.length) {
      const errorMessage = `The following packages are deprecated: ${deprecatedPackages.join(', ')}`;
      console.error(chalk.red(errorMessage));
      return { packages: deprecatedPackages, error: new Error(errorMessage) };
    }

    console.log(chalk.green('No deprecated packages found.'));
    return { packages: [], error: null };
  } catch (error) {
    console.error(chalk.red(`An error occurred while checking for deprecated packages: ${error.message}`));
    return { packages: [], error };
  }
}

module.exports = checkDeprecatedPackages;