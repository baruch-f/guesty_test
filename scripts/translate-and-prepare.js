const fs = require('fs');
const path = require('path');

const PACKAGES_DIR = path.join(__dirname, '..', 'packages');
const OUTPUT_DIR = path.join(__dirname, '..', 'locales-dist');
const LANGUAGES = ['en', 'ru', 'he'];

function discoverPackages() {
  const packages = [];
  const dirs = fs.readdirSync(PACKAGES_DIR, { withFileTypes: true });

  for (const dir of dirs) {
    if (!dir.isDirectory()) continue;

    const packagePath = path.join(PACKAGES_DIR, dir.name);
    const localesPath = path.join(packagePath, 'locales');

    if (fs.existsSync(localesPath)) {
      const pkg = require(path.join(packagePath, 'package.json'));
      packages.push({
        name: dir.name,
        path: packagePath,
        version: pkg.version,
        localesPath,
      });
    }
  }

  return packages;
}

function prepareTranslations() {
  console.log('📦 Preparing translations for deployment...\n');

  const packages = discoverPackages();

  if (packages.length === 0) {
    console.warn('⚠️  No packages with locales/ found');
    console.log('Please create locales/ directories with translation files.\n');
    return;
  }

  // Очищаем dist
  if (fs.existsSync(OUTPUT_DIR)) {
    fs.rmSync(OUTPUT_DIR, { recursive: true });
  }
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const manifest = {};
  let totalFiles = 0;

  for (const pkg of packages) {
    console.log(`  Processing ${pkg.name}...`);

    const targetDir = path.join(OUTPUT_DIR, pkg.name, `v${pkg.version}`);
    fs.mkdirSync(targetDir, { recursive: true });

    let packageSize = 0;
    let keyCount = 0;

    for (const lang of LANGUAGES) {
      const sourceFile = path.join(pkg.localesPath, `${lang}.json`);
      const targetFile = path.join(targetDir, `${lang}.json`);

      if (!fs.existsSync(sourceFile)) {
        console.warn(`    ⚠️  Missing ${lang}.json, skipping`);
        continue;
      }

      // Копируем файл
      fs.copyFileSync(sourceFile, targetFile);

      // Подсчитываем метрики
      const content = JSON.parse(fs.readFileSync(sourceFile, 'utf-8'));
      const fileSize = fs.statSync(sourceFile).size;
      packageSize += fileSize;

      if (lang === 'en') {
        keyCount = Object.keys(content).length;
      }

      totalFiles++;
      console.log(`    ✓ Copied ${lang}.json (${fileSize} bytes)`);
    }

    // Добавляем в манифест
    manifest[pkg.name] = {
      version: pkg.version,
      size: packageSize,
      keyCount,
      priority: ['host', 'shared'].includes(pkg.name) ? 'critical' : 'low',
    };
  }

  // Сохраняем манифест
  const manifestPath = path.join(OUTPUT_DIR, 'manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');

  console.log('\n📄 Manifest:');
  console.log(JSON.stringify(manifest, null, 2));

  console.log(`\n✅ Prepared ${totalFiles} translation files in locales-dist/\n`);
  console.log('Next step: Run `npm run deploy:translations` to upload to S3\n');
}

prepareTranslations();