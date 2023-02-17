const assert = require('assert');
const { checkDeprecatedPackages } = require('./main');

describe('checkDeprecatedPackages', () => {
  it('should return an array of deprecated packages', async () => {
    const deprecatedPackages = await checkDeprecatedPackages('./test_project');
    assert(Array.isArray(deprecatedPackages), 'Result should be an array');
    assert(deprecatedPackages.length > 0, 'There should be at least one deprecated package');
    deprecatedPackages.forEach((pkg) => {
      assert(pkg.name, 'Package name should be defined');
      assert(pkg.version, 'Package version should be defined');
      assert(pkg.deprecated, 'Package deprecated status should be defined');
    });
  });

  it('should return an empty array if there are no deprecated packages', async () => {
    const deprecatedPackages = await checkDeprecatedPackages('./test_project_no_deprecated');
    assert(Array.isArray(deprecatedPackages), 'Result should be an array');
    assert.strictEqual(deprecatedPackages.length, 0, 'There should be no deprecated packages');
  });
});
