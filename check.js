const ncu = require('npm-check-updates');
const snyk = require('snyk');
const depcheck = require('depcheck');
const { Command } = require('commander');

// Checks for outdated dependencies in the project
function checkOutdatedDependencies() {
  return ncu.run({
    packageFile: './package.json',
    silent: true,
    jsonUpgraded: true,
    filter: '/^(?:(?!@types).)*$/', // ignore updating @types packages
  });
}

// Checks for security vulnerabilities in the project
async function checkSecurityVulnerabilities() {
  try {
    return await snyk.test();
  } catch (error) {
    console.error('Error checking security vulnerabilities:', error);
    throw error;
  }
}

// Checks for deprecated packages in the project
function checkDeprecatedPackages() {
  const options = {
    ignoreDirs: ['node_modules'],
    ignoreMatches: [
      '@babel/core', // ignore deprecated packages used by Babel
      'babel-eslint',
      'eslint-plugin-babel',
      'eslint-plugin-react-hooks',
      'tslint-react-hooks',
    ],
  };
  
  return new Promise((resolve, reject) => {
    depcheck('.', options, ({ dependencies }) => {
      resolve(dependencies);
    });
  });
}

function createCommand() {
  const program = new Command();
  
  program
    .description('Checks for outdated dependencies, security vulnerabilities, and deprecated packages in your JavaScript project')
    .option('-o, --outdated', 'Check for outdated dependencies')
    .option('-s, --security', 'Check for security vulnerabilities')
    .option('-d, --deprecated', 'Check for deprecated packages')
    .parse(process.argv);

  return program;
}

async function runChecks() {
  const program = createCommand();

  if (!program.outdated && !program.security && !program.deprecated) {
    program.outputHelp();
    process.exit(1);
  }

  if (program.outdated) {
    const upgraded = await checkOutdatedDependencies();
    console.log('The following dependencies can be updated:');
    console.log(JSON.stringify(upgraded, null, 2));
  }

  if (program.security) {
    const { vulnerabilities } = await checkSecurityVulnerabilities();
    console.log(`Found ${vulnerabilities.length} security vulnerabilities:`);
    console.log(JSON.stringify(vulnerabilities, null, 2));
  }

  if (program.deprecated) {
    const dependencies = await checkDeprecatedPackages();
    console.log('The following deprecated packages are being used:');
    console.log(JSON.stringify(dependencies, null, 2));
  }
}

module.exports = {
  checkOutdatedDependencies,
  checkSecurityVulnerabilities,
  checkDeprecatedPackages,
  runChecks,
};