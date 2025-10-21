const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const glob = require('glob');

const PACKAGES_DIR = path.join(__dirname, '..', 'packages');

// Находим все пакеты
function discoverPackages() {
  const packages = [];
  const dirs = fs.readdirSync(PACKAGES_DIR, { withFileTypes: true });

  for (const dir of dirs) {
    if (!dir.isDirectory()) continue;

    const packagePath = path.join(PACKAGES_DIR, dir.name);
    const srcPath = path.join(packagePath, 'src');

    if (fs.existsSync(srcPath)) {
      const pkg = require(path.join(packagePath, 'package.json'));
      packages.push({
        name: dir.name,
        path: packagePath,
        version: pkg.version,
      });
    }
  }

  return packages;
}

// Извлекаем ключи из одного файла
function extractKeysFromFile(filePath) {
  const keys = new Set();
  const code = fs.readFileSync(filePath, 'utf-8');

  try {
    const ast = parser.parse(code, {
      sourceType: 'module',
      plugins: ['typescript', 'jsx'],
    });

    traverse(ast, {
      CallExpression(path) {
        const callee = path.node.callee;

        // t('key')
        if (callee.type === 'Identifier' && callee.name === 't') {
          const arg = path.node.arguments[0];
          if (arg && arg.type === 'StringLiteral') {
            keys.add(arg.value);
          }
        }

        // i18n.t('key') или i18next.t('key')
        if (
          callee.type === 'MemberExpression' &&
          callee.property.type === 'Identifier' &&
          callee.property.name === 't'
        ) {
          const arg = path.node.arguments[0];
          if (arg && arg.type === 'StringLiteral') {
            keys.add(arg.value);
          }
        }
      },
    });
  } catch (err) {
    console.warn(`⚠️  Failed to parse ${filePath}: ${err.message}`);
  }

  return Array.from(keys);
}

// Извлекаем все ключи из пакета
function extractPackageKeys(pkg) {
  console.log(`\n📦 Extracting keys from ${pkg.name}...`);

  const files = glob.sync(`${pkg.path}/src/**/*.{ts,tsx}`, {
    ignore: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}'],
  });

  const allKeys = new Set();

  for (const file of files) {
    const keys = extractKeysFromFile(file);
    keys.forEach(key => allKeys.add(key));
  }

  console.log(`  ✓ Found ${allKeys.size} unique keys`);

  return Array.from(allKeys).sort();
}

// Генерируем extraction report (для проверки)
function generateReport(packages, results) {
  console.log('\n📊 Extraction Report:\n');

  let totalKeys = 0;

  for (const pkg of packages) {
    const keys = results[pkg.name] || [];
    totalKeys += keys.length;
    console.log(`  ${pkg.name}: ${keys.length} keys`);
  }

  console.log(`\n  Total: ${totalKeys} keys across ${packages.length} packages\n`);

  // Сохраняем report
  const reportPath = path.join(__dirname, '..', 'locales-dist', 'extraction-report.json');
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));

  console.log(`  ✓ Report saved to ${reportPath}\n`);
}

// Main
function main() {
  console.log('🔍 Discovering packages...\n');
  const packages = discoverPackages();

  if (packages.length === 0) {
    console.warn('⚠️  No packages with src/ found');
    return;
  }

  console.log(`Found ${packages.length} packages:`);
  packages.forEach(pkg => console.log(`  - ${pkg.name}`));

  const results = {};

  for (const pkg of packages) {
    const keys = extractPackageKeys(pkg);
    results[pkg.name] = keys;
  }

  generateReport(packages, results);

  console.log('✅ Extraction complete!\n');
  console.log('Next steps:');
  console.log('  1. Review extraction-report.json');
  console.log('  2. Fill in translations in packages/*/locales/*.json');
  console.log('  3. Run `npm run i18n:prepare` to prepare for deployment\n');
}

main();